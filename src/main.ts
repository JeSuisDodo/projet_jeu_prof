import Phaser from 'phaser';
import { play, setLevels, setMusic, unlockAudio } from './audio/sound';
import { GRADES, chapterById, gradeById } from './content';
import type { ChapterDef, CreatureDef, GradeId } from './content/types';
import { Rng } from './exercises/rng';
import type { Level } from './exercises/types';
import { creatureSvg } from './game/creatureArt';
import { type SaveData, clearSave, loadSave, newSave, speciesCaught, storeSave } from './game/save';
import { loadSettings, storeSettings } from './game/settings';
import { WorldScene } from './game/WorldScene';
import { runBattle } from './ui/battle';
import { showDialog } from './ui/dialog';
import { openJournal } from './ui/journal';
import { escapeHtml } from './ui/math';
import { hideOverlay, overlayOpen } from './ui/overlay';
import { openRegions } from './ui/regions';
import { ICONS, openSettings } from './ui/settings';
import { showStart } from './ui/start';
import './style.css';

let save: SaveData;
let chapter: ChapterDef;
const settings = loadSettings();
let busy = false;
/** Régions où la gardienne a déjà fait son accueil pendant cette session. */
const guideMet = new Set<string>();
const rng = new Rng(Date.now() >>> 0);
let game: Phaser.Game | null = null;

const GUIDE_NAME = 'Gardienne Élia';

/** Espèces à capturer dans la région avant de pouvoir défier son gardien. */
const speciesForBoss = (c: ChapterDef) => Math.min(3, c.creatures.length);
const regionCaught = () => speciesCaught(save, chapter.creatures.map((c) => c.id));

/**
 * Créatures d'une zone de niveau donné : les premières du chapitre au sud (niveau 1),
 * les dernières au nord (niveau 3), avec un recouvrement pour varier les rencontres.
 */
function zoneCreatures(c: ChapterDef, level: Level): CreatureDef[] {
  const n = c.creatures.length;
  const tier = (i: number) => Math.min(3, Math.floor((i * 3) / n) + 1);
  const pool = c.creatures.filter((_, i) => tier(i) === level || tier(i) === level - 1);
  return pool.length ? pool : c.creatures;
}

const persist = () => {
  storeSave(save);
  renderHud();
};

function renderHud(): void {
  const hud = document.getElementById('hud')!;
  hud.hidden = false;
  const grade = gradeById(save.grade);
  hud.innerHTML = `
    <span class="tag region">${chapter.region} · ${grade.name}</span>
    <span class="tag">${escapeHtml(save.pseudo || 'Aventurier')} · ${save.xp} XP · ${regionCaught()}/${chapter.creatures.length} espèces</span>
    <span class="spacer"></span>`;
  hud.append(
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
  openJournal(save, chapter, () => {
    clearSave();
    location.reload();
  });
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

async function fight(creature: CreatureDef, boss: boolean, level: Level): Promise<void> {
  setMusic(boss ? 'boss' : 'battle');
  const result = await runBattle({ ...creature, svg: creatureSvg(creature), boss }, level, save, persist);
  setMusic('explore');
  if (result.captured) {
    save.captures[creature.id] = (save.captures[creature.id] ?? 0) + 1;
    save.xp += result.xp;
    showToast(`+${result.xp} XP · ${creature.name} capturé`);
    if (boss && !save.badges.includes(chapter.id)) {
      save.badges.push(chapter.id);
      play('victory');
    }
  }
  persist();
}

function signLines(index: number): string[] {
  const n = speciesForBoss(chapter);
  return [
    [`Bienvenue dans la région ${chapter.region}. Chapitre : ${chapter.title}.`, 'Les hautes herbes du sud abritent les créatures les plus faciles.'],
    ['Au nord de ce pont, les plateaux et leurs créatures de niveau 2.'],
    ['Les pentes du nord-est sont réservées aux aventuriers aguerris (niveau 3).'],
    [`Arène de ${chapter.boss.name}, gardien de la région. Il ne combat que ceux qui ont capturé ${n} espèces d’ici.`],
  ][index];
}

const world = new WorldScene({
  isBusy: () => busy || overlayOpen(),
  encounter: (level) => exclusive(() => fight(rng.pick(zoneCreatures(chapter, level)), false, level)),
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
            `Capture ${needed} espèces différentes, puis va défier ${boss}, le gardien de la région, au nord-est.`,
            'Déplace-toi avec les flèches (ou ZQSD), ou en maintenant le doigt sur l’écran. V ouvre la carte de l’île, C ton carnet, P les paramètres.',
          ],
        );
      } else if (save.badges.includes(chapter.id)) {
        await showDialog(GUIDE_NAME, ['Tu as battu le gardien de cette région ! Complète ton carnet ou ouvre la carte de l’île (V) pour changer de région.']);
      } else if (species >= needed) {
        await showDialog(GUIDE_NAME, [`Tu es prêt. ${boss} t’attend dans son arène, au nord-est.`]);
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
      await fight(boss, true, 3);
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

async function boot(): Promise<void> {
  applySettings();
  const existing = loadSave();
  const choice = await showStart(existing);
  unlockAudio();
  if (choice.kind === 'continue' && existing) {
    save = existing;
    chapter = chapterById(save.region) ?? firstChapter(save.grade);
    save.region = chapter.id;
  } else {
    const grade = choice.kind === 'new' ? choice.grade : '1re-spe';
    // Nouvelle partie : l'élève choisit sa région de départ sur la carte de l'île.
    save = newSave(choice.kind === 'new' ? choice.pseudo : '', grade, firstChapter(grade).id);
    chapter = firstChapter(grade);
    if (gradeById(grade).chapters.length > 1) {
      await new Promise<void>((resolve) =>
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
  }
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
