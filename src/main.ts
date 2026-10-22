import Phaser from 'phaser';
import { play, setLevels, setMusic, unlockAudio } from './audio/sound';
import { Rng } from './exercises/rng';
import type { Level } from './exercises/types';
import { CREATURES, SPECIES_FOR_BOSS, creatureById } from './game/creatures';
import { type SaveData, clearSave, loadSave, newSave, speciesCaught, storeSave } from './game/save';
import { loadSettings, storeSettings } from './game/settings';
import { WorldScene } from './game/WorldScene';
import { runBattle } from './ui/battle';
import { showDialog } from './ui/dialog';
import { openJournal } from './ui/journal';
import { hideOverlay, overlayOpen } from './ui/overlay';
import { ICONS, openSettings } from './ui/settings';
import { showStart } from './ui/start';
import { escapeHtml } from './ui/math';
import './style.css';

let save: SaveData;
const settings = loadSettings();
let busy = false;
let guideMet = false;
const rng = new Rng(Date.now() >>> 0);

const persist = () => {
  storeSave(save);
  renderHud();
};

function renderHud(): void {
  const hud = document.getElementById('hud')!;
  hud.hidden = false;
  hud.innerHTML = `
    <span class="tag region">Volcan du Second degré · 1re spé</span>
    <span class="tag">${escapeHtml(save.pseudo || 'Aventurier')} · ${save.xp} XP · ${speciesCaught(save)}/${CREATURES.length - 1} espèces</span>
    <span class="spacer"></span>`;
  hud.append(
    iconButton(settings.muted ? ICONS.soundOff : ICONS.soundOn, settings.muted ? 'Remettre le son (M)' : 'Couper le son (M)', toggleMute),
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
  openJournal(save, () => {
    clearSave();
    location.reload();
  });
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

async function fight(creatureId: string, level: Level): Promise<void> {
  const creature = creatureById(creatureId);
  setMusic(creature.boss ? 'boss' : 'battle');
  const result = await runBattle(creature, level, save, persist);
  setMusic('explore');
  if (result.captured) {
    save.captures[creature.id] = (save.captures[creature.id] ?? 0) + 1;
    save.xp += result.xp;
    showToast(`+${result.xp} XP · ${creature.name} capturé`);
    if (creature.boss && !save.badges.includes('volcan')) {
      save.badges.push('volcan');
      play('victory');
    }
  }
  persist();
}

const GUIDE_NAME = 'Gardienne Élia';

const world = new WorldScene({
  isBusy: () => busy || overlayOpen(),
  encounter: (creatures, level) => exclusive(() => fight(rng.pick(creatures), level)),
  talkToGuide: () =>
    exclusive(async () => {
      const species = speciesCaught(save);
      if (!guideMet) {
        guideMet = true;
        await showDialog(GUIDE_NAME, [
          `Bienvenue au Volcan du Second degré${save.pseudo ? `, ${save.pseudo}` : ''} !`,
          'Dans les hautes herbes vivent des créatures. Pour en capturer une, il faut répondre juste à ses questions.',
          `Capture ${SPECIES_FOR_BOSS} espèces différentes, puis va défier Trinomax, le gardien du cratère, au nord-est.`,
          'Déplace-toi avec les flèches (ou ZQSD), ou en maintenant le doigt sur l’écran. Ouvre ton carnet avec C, les paramètres avec P.',
        ]);
      } else if (save.badges.includes('volcan')) {
        await showDialog(GUIDE_NAME, ['Tu as le Badge du Volcan ! Continue à t’entraîner pour compléter ton carnet.']);
      } else if (species >= SPECIES_FOR_BOSS) {
        await showDialog(GUIDE_NAME, ['Tu es prêt. Trinomax t’attend au fond du cratère, au nord-est.']);
      } else {
        await showDialog(GUIDE_NAME, [`Tu as capturé ${species} espèce(s) sur ${SPECIES_FOR_BOSS}. Continue !`]);
      }
    }),
  approachBoss: () =>
    exclusive(async () => {
      if (speciesCaught(save) < SPECIES_FOR_BOSS) {
        await showDialog('Trinomax', [
          `Reviens quand tu auras capturé ${SPECIES_FOR_BOSS} espèces différentes. Tu n’en as que ${speciesCaught(save)}.`,
        ]);
        return;
      }
      play('boss');
      await showDialog('Trinomax', ['Alors tu oses me défier ? Montre-moi ce que tu sais du second degré !']);
      await fight('trinomax', 3);
      if (save.badges.includes('volcan'))
        await showDialog('Trinomax', ['Impressionnant… Tu mérites le Badge du Volcan.']);
    }),
  bossDefeated: () => save.badges.includes('volcan'),
  readSign: (lines) =>
    exclusive(() => {
      play('sign');
      return showDialog('Panneau', lines);
    }),
  isCalm: () => settings.calm,
});

window.addEventListener('keydown', (e) => {
  const typing = e.target instanceof HTMLInputElement && e.target.type === 'text';
  const key = e.key.toLowerCase();
  if (typing || !save) return;
  if (key === 'm') toggleMute();
  else if ((key === 'c' || key === 'p') && !busy) {
    if (overlayOpen()) hideOverlay();
    else if (key === 'c') showJournal();
    else showSettings();
  } else if (e.key === 'Escape' && overlayOpen() && !busy) hideOverlay();
});

// Les navigateurs n'autorisent le son qu'après un geste ; chaque bouton fait un petit clic.
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);
document.addEventListener('click', (e) => {
  if ((e.target as Element).closest?.('button')) play('click');
});

async function boot(): Promise<void> {
  applySettings();
  const existing = loadSave();
  const choice = await showStart(existing);
  save = choice.kind === 'continue' && existing ? existing : newSave(choice.kind === 'new' ? choice.pseudo : '');
  guideMet = choice.kind === 'continue';
  persist();
  unlockAudio();
  setMusic('explore');
  new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#1b1412',
    pixelArt: true,
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
    scene: world,
  });
}

void boot();
