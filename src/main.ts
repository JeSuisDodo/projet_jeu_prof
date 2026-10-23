import Phaser from 'phaser';
import { play, setLevels, setMusic, unlockAudio } from './audio/sound';
import { GRADES, chapterById, gradeById } from './content';
import type { ChapterDef, CreatureDef, GradeId, TerrainId } from './content/types';
import { Rng } from './exercises/rng';
import { creatureSvg } from './game/creatureArt';
import { directionWord } from './game/map';
import { RARITY, pickEncounter, rarityOf } from './game/rarity';
import { type SaveData, clearSave, freshest, loadSave, newSave, speciesCaught, storeSave, studentSlot } from './game/save';
import { loadSettings, storeSettings } from './game/settings';
import { WorldScene } from './game/WorldScene';
import { getBackend } from './online';
import type { Backend, StudentSession } from './online/types';
import { codeFromUrl } from './online/util';
import { runBattle } from './ui/battle';
import { showDialog } from './ui/dialog';
import { runHome } from './ui/home';
import { openJournal } from './ui/journal';
import { escapeHtml } from './ui/math';
import { hideOverlay, overlayOpen } from './ui/overlay';
import { openRegions } from './ui/regions';
import { ICONS, openSettings } from './ui/settings';
import { closeMenu } from './ui/menu';
import './style.css';

let save: SaveData;
let chapter: ChapterDef;
const settings = loadSettings();
let busy = false;
/** Régions où la gardienne a déjà fait son accueil pendant cette session. */
const guideMet = new Set<string>();
const rng = new Rng(Date.now() >>> 0);
let game: Phaser.Game | null = null;
/** Élève connecté à une partie : sa progression est aussi envoyée au professeur. */
let student: StudentSession | null = null;
let backend: Backend | null = null;
let slot: string | undefined;
let syncTimer: ReturnType<typeof setTimeout> | undefined;
let syncFailed = false;

const GUIDE_NAME = 'Gardienne Élia';

/** Espèces à capturer dans la région avant de pouvoir défier son gardien. */
const speciesForBoss = (c: ChapterDef) => Math.min(3, c.creatures.length);
const regionCaught = () => speciesCaught(save, chapter.creatures.map((c) => c.id));

const persist = () => {
  storeSave(save, slot);
  if (student) {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => void sync(), 2000);
  }
  renderHud();
};

/** Envoie la progression de l'élève ; en cas d'échec, on réessaiera à la prochaine sauvegarde. */
async function sync(): Promise<void> {
  clearTimeout(syncTimer);
  if (!student || !backend) return;
  try {
    await backend.saveProgress(save);
    syncFailed = false;
  } catch {
    syncFailed = true;
  }
  renderHud();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden && syncTimer) void sync();
});

function renderHud(): void {
  const hud = document.getElementById('hud')!;
  hud.hidden = false;
  const grade = gradeById(save.grade);
  hud.innerHTML = `
    <span class="tag region">${chapter.region} · ${grade.name}</span>
    <span class="tag">${escapeHtml(save.pseudo || 'Aventurier')} · ${save.xp} XP · ${regionCaught()}/${chapter.creatures.length} espèces</span>
    ${student ? `<span class="tag class-tag" title="${syncFailed ? 'Progression pas encore envoyée : nouvel essai à la prochaine capture.' : 'Progression envoyée à ton professeur.'}">${syncFailed ? '⚠' : '☁'} ${escapeHtml(student.className)}</span>` : ''}
    <span class="spacer"></span>`;
  hud.append(
    iconButton(ICONS.home, 'Menu principal', goHome),
    iconButton(settings.muted ? ICONS.soundOff : ICONS.soundOn, settings.muted ? 'Remettre le son (M)' : 'Couper le son (M)', toggleMute),
    iconButton(ICONS.map, 'Carte de l’île (V)', showRegions),
    iconButton(ICONS.journal, 'Carnet (C)', showJournal),
    iconButton(ICONS.settings, 'Paramètres (P)', showSettings),
  );
}

function iconButton(svg: string, label: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'icon-btn';
  btn.innerHTML = svg;
  btn.title = label;
  btn.setAttribute('aria-label', label);
  btn.onclick = onClick;
  return btn;
}

/** Applique les réglages au son, à la page et au décor, puis les enregistre. */
function applySettings(): void {
  setLevels(settings.music, settings.effects, settings.muted);
  document.documentElement.classList.toggle('calm', settings.calm);
  document.documentElement.classList.toggle('big-text', settings.bigText);
  world.setCalm(settings.calm);
  storeSettings(settings);
}

function toggleMute(): void {
  settings.muted = !settings.muted;
  applySettings();
  if (save) renderHud();
}

function showSettings(): void {
  if (busy) return;
  openSettings(settings, () => {
    applySettings();
    renderHud();
  });
}

/** Petit message qui monte et s'efface au-dessus du jeu. */
function showToast(text: string): void {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 2600);
}

function showJournal(): void {
  if (busy) return;
  openJournal(
    save,
    chapter,
    student
      ? undefined
      : () => {
          clearSave();
          location.reload();
        },
  );
}

/** Retour au menu principal : la progression est déjà enregistrée, on recharge la page. */
async function goHome(): Promise<void> {
  if (busy) return;
  await sync();
  location.href = location.href.split(/[?#]/)[0];
}

function showRegions(): void {
  if (busy) return;
  openRegions(save, travel);
}

/** Change de région : la scène redémarre avec le nouveau chapitre. */
function travel(grade: GradeId, chapterId: string): void {
  const next = chapterById(chapterId);
  if (!next) return;
  save.grade = grade;
  save.region = chapterId;
  chapter = next;
  persist();
  if (game) world.scene.restart({ chapter });
  showToast(`${chapter.region} · ${chapter.title}`);
}

/** Encadre une action d'interface : le jeu ne bouge plus tant qu'elle n'est pas terminée. */
async function exclusive(action: () => Promise<void>): Promise<void> {
  if (busy) return;
  busy = true;
  try {
    await action();
  } finally {
    busy = false;
  }
}

async function fight(creature: CreatureDef, boss: boolean): Promise<void> {
  setMusic(boss ? 'boss' : 'battle');
  const rarity = boss ? undefined : rarityOf(chapter, creature);
  if (rarity === 'rare' || rarity === 'legendaire') play('rare');
  const result = await runBattle({ ...creature, svg: creatureSvg(creature), boss, rarity }, save, persist);
  setMusic('explore');
  if (result.captured) {
    save.captures[creature.id] = (save.captures[creature.id] ?? 0) + 1;
    save.xp += result.xp;
    showToast(`+${result.xp} XP · ${creature.name} capturé${rarity && rarity !== 'commune' ? ` (${RARITY[rarity].label.toLowerCase()})` : ''}`);
    if (boss && !save.badges.includes(chapter.id)) {
      save.badges.push(chapter.id);
      play('victory');
    }
  }
  persist();
}

/** Le panneau du milieu du chemin, selon le relief. */
const FURTHER: Record<TerrainId, string> = {
  riviere: 'Au-delà de ce pont',
  foret: 'Plus profond dans la forêt',
  montagne: 'Plus haut sur ce sentier',
  cote: 'Le long de la côte',
  archipel: 'Sur les îles suivantes',
  marais: 'Au cœur du marais',
  desert: 'Plus loin dans les dunes',
  canyon: 'Dans les salles suivantes',
  lac: 'En faisant le tour du lac',
};

/** Où trouver l'arène, vue du départ : « au nord-est ». */
const arenaWhere = () => {
  const map = world.regionMap;
  return map ? directionWord(map.start, map.arena) : 'au bout du chemin';
};

/** La région a-t-elle des plateaux ? */
const hasPlateaus = () => world.regionMap?.raised.some((row) => row.includes(true)) ?? false;

function signLines(index: number): string[] {
  const n = speciesForBoss(chapter);
  return [
    [
      `Bienvenue dans la région ${chapter.region}. Chapitre : ${chapter.title}.`,
      'Les hautes herbes les plus proches abritent surtout des créatures communes, aux questions faciles. Les rares et les légendaires se cachent plus loin et sont plus coriaces.',
      ...(hasPlateaus() ? ['Des escaliers mènent aux plateaux. Pour redescendre plus vite, saute d’une corniche vers le sud !'] : []),
    ],
    [`${FURTHER[world.regionMap?.terrain ?? 'riviere']}, des créatures de niveau 2.`],
    ['Les coins les plus reculés de la région sont réservés aux aventuriers aguerris (niveau 3).'],
    [`Arène de ${chapter.boss.name}, gardien de la région. Il ne combat que ceux qui ont capturé ${n} espèces d’ici.`],
  ][index];
}

const world = new WorldScene({
  isBusy: () => busy || overlayOpen(),
  encounter: (level) => exclusive(() => fight(pickEncounter(chapter, level, rng), false)),
  talkToGuide: () =>
    exclusive(async () => {
      const species = regionCaught();
      const needed = speciesForBoss(chapter);
      const boss = chapter.boss.name;
      if (!guideMet.has(chapter.id)) {
        guideMet.add(chapter.id);
        await showDialog(
          GUIDE_NAME,
          chapter.guide ?? [
            `Bienvenue dans la région ${chapter.region}${save.pseudo ? `, ${save.pseudo}` : ''} ! Ici, on travaille le chapitre « ${chapter.title} ».`,
            'Dans les hautes herbes vivent des créatures. Pour en capturer une, il faut répondre juste à ses questions.',
            `Capture ${needed} espèces différentes, puis va défier ${boss}, le gardien de la région, ${arenaWhere()}.`,
            'Déplace-toi avec les flèches (ou ZQSD), ou en maintenant le doigt sur l’écran. V ouvre la carte de l’île, C ton carnet, P les paramètres.',
          ],
        );
      } else if (save.badges.includes(chapter.id)) {
        await showDialog(GUIDE_NAME, ['Tu as battu le gardien de cette région ! Complète ton carnet ou ouvre la carte de l’île (V) pour changer de région.']);
      } else if (species >= needed) {
        await showDialog(GUIDE_NAME, [`Tu es prêt. ${boss} t’attend dans son arène, ${arenaWhere()}.`]);
      } else {
        await showDialog(GUIDE_NAME, [`Tu as capturé ${species} espèce(s) sur ${needed}. Continue !`]);
      }
    }),
  approachBoss: () =>
    exclusive(async () => {
      const boss = chapter.boss;
      const needed = speciesForBoss(chapter);
      if (regionCaught() < needed) {
        await showDialog(boss.name, [`Reviens quand tu auras capturé ${needed} espèces de la région. Tu n’en as que ${regionCaught()}.`]);
        return;
      }
      play('boss');
      await showDialog(boss.name, [`Alors tu oses me défier ? Montre-moi ce que tu sais : ${chapter.title} !`]);
      await fight(boss, true);
      if (save.badges.includes(chapter.id)) await showDialog(boss.name, ['Impressionnant… La région te reconnaît comme son champion.']);
    }),
  bossDefeated: () => save.badges.includes(chapter.id),
  readSign: (index) =>
    exclusive(() => {
      play('sign');
      return showDialog('Panneau', signLines(index));
    }),
  isCalm: () => settings.calm,
});

window.addEventListener('keydown', (e) => {
  const typing = e.target instanceof HTMLInputElement && e.target.type === 'text';
  const key = e.key.toLowerCase();
  if (typing || !game) return;
  if (key === 'm') toggleMute();
  else if ((key === 'c' || key === 'p' || key === 'v') && !busy) {
    if (overlayOpen()) hideOverlay();
    else if (key === 'c') showJournal();
    else if (key === 'v') showRegions();
    else showSettings();
  } else if (e.key === 'Escape' && overlayOpen() && !busy) hideOverlay();
});

// Les navigateurs n'autorisent le son qu'après un geste ; chaque bouton fait un petit clic.
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);
document.addEventListener('click', (e) => {
  if ((e.target as Element).closest?.('button')) play('click');
});

/** Première région disponible d'une classe. */
const firstChapter = (grade: GradeId) => gradeById(grade).chapters[0] ?? GRADES.flatMap((g) => g.chapters)[0];

/** L'élève choisit sa région de départ sur la carte de l'île. */
function chooseStartRegion(): Promise<void> {
  chapter = firstChapter(save.grade);
  if (gradeById(save.grade).chapters.length <= 1) return Promise.resolve();
  return new Promise<void>((resolve) =>
    openRegions(
      save,
      (g, id) => {
        save.grade = g;
        save.region = id;
        chapter = chapterById(id)!;
        resolve();
      },
      false,
    ),
  );
}

async function boot(): Promise<void> {
  applySettings();
  const invite = codeFromUrl();
  const backendReady = getBackend();
  const existing = loadSave();
  const home = await runHome(backendReady, invite, existing);
  unlockAudio();
  // Le code d'invitation ne doit pas resservir au prochain rechargement.
  if (invite) history.replaceState(null, '', location.pathname);
  if (home.kind === 'student') {
    student = home.session;
    backend = await backendReady;
    slot = studentSlot(student.studentId);
    const kept = freshest(student.progress, loadSave(slot));
    if (kept) {
      save = { ...kept, pseudo: student.name };
      chapter = chapterById(save.region) ?? firstChapter(save.grade);
      save.region = chapter.id;
    } else {
      save = newSave(student.name, student.grade, firstChapter(student.grade).id);
      await chooseStartRegion();
    }
  } else if (home.choice.kind === 'continue' && existing) {
    save = existing;
    chapter = chapterById(save.region) ?? firstChapter(save.grade);
    save.region = chapter.id;
  } else {
    const grade = home.choice.kind === 'new' ? home.choice.grade : '1re-spe';
    save = newSave(home.choice.kind === 'new' ? home.choice.pseudo : '', grade, firstChapter(grade).id);
    await chooseStartRegion();
  }
  closeMenu();
  persist();
  setMusic('explore');
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#1b1412',
    pixelArt: true,
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  });
  game.scene.add('world', world, true, { chapter });
}

void boot();
