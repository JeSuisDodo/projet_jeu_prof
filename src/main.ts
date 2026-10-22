import Phaser from 'phaser';
import { Rng } from './exercises/rng';
import type { Level } from './exercises/types';
import { CREATURES, SPECIES_FOR_BOSS, creatureById } from './game/creatures';
import { type SaveData, clearSave, loadSave, newSave, speciesCaught, storeSave } from './game/save';
import { WorldScene } from './game/WorldScene';
import { runBattle } from './ui/battle';
import { showDialog } from './ui/dialog';
import { openJournal } from './ui/journal';
import { hideOverlay, overlayOpen } from './ui/overlay';
import { showStart } from './ui/start';
import { escapeHtml } from './ui/math';
import './style.css';

let save: SaveData;
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
  const btn = document.createElement('button');
  btn.textContent = 'Carnet';
  btn.title = 'Ouvrir le carnet (touche C)';
  btn.onclick = showJournal;
  hud.append(btn);
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
  const result = await runBattle(creature, level, save, persist);
  if (result.captured) {
    save.captures[creature.id] = (save.captures[creature.id] ?? 0) + 1;
    save.xp += result.xp;
    showToast(`+${result.xp} XP · ${creature.name} capturé`);
    if (creature.boss && !save.badges.includes('volcan')) save.badges.push('volcan');
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
          'Déplace-toi avec les flèches (ou ZQSD), ou en maintenant le doigt sur l’écran. Ouvre ton carnet avec C.',
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
      await showDialog('Trinomax', ['Alors tu oses me défier ? Montre-moi ce que tu sais du second degré !']);
      await fight('trinomax', 3);
      if (save.badges.includes('volcan'))
        await showDialog('Trinomax', ['Impressionnant… Tu mérites le Badge du Volcan.']);
    }),
  bossDefeated: () => save.badges.includes('volcan'),
  readSign: (lines) => exclusive(() => showDialog('Panneau', lines)),
});

window.addEventListener('keydown', (e) => {
  const typing = e.target instanceof HTMLInputElement;
  if ((e.key === 'c' || e.key === 'C') && !typing && !busy) {
    if (overlayOpen()) hideOverlay();
    else showJournal();
  } else if (e.key === 'Escape' && overlayOpen() && !busy) hideOverlay();
});

async function boot(): Promise<void> {
  const existing = loadSave();
  const choice = await showStart(existing);
  save = choice.kind === 'continue' && existing ? existing : newSave(choice.kind === 'new' ? choice.pseudo : '');
  guideMet = choice.kind === 'continue';
  persist();
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
