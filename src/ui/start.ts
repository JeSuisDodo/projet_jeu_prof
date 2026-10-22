import type { SaveData } from '../game/save';
import { escapeHtml } from './math';
import { h, hideOverlay, showOverlay } from './overlay';

export type StartChoice = { kind: 'continue' } | { kind: 'new'; pseudo: string };

/** Écran d'accueil : choix de la classe (seule la 1re spécialité est jouable dans ce prototype). */
export function showStart(existing: SaveData | null): Promise<StartChoice> {
  return new Promise((resolve) => {
    const panel = h('div', 'panel start');
    panel.innerHTML = `
      <h1>Mathoria</h1>
      <p class="muted">Explore le monde, affronte les créatures… en résolvant des exercices de maths.</p>
      ${existing ? `<p>Partie en cours : <strong>${escapeHtml(existing.pseudo || 'sans pseudo')}</strong>, ${existing.xp} points d'expérience.</p>` : ''}
      <h2>Choisis ta classe</h2>
      <div class="classes">
        <button class="secondary" disabled>2nde<small>Bientôt</small></button>
        <button class="selected">1re spécialité<small>Volcan du Second degré</small></button>
        <button class="secondary" disabled>Terminale<small>Bientôt</small></button>
      </div>
      <label for="pseudo">Ton prénom ou pseudo</label>`;
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'pseudo';
    input.maxLength = 20;
    input.value = existing?.pseudo ?? '';
    const actions = h('div', 'row actions');
    const play = h('button', '', existing ? 'Nouvelle partie' : 'Jouer') as HTMLButtonElement;
    play.onclick = () => {
      if (existing && !confirm('Une nouvelle partie efface la progression actuelle. Continuer ?')) return;
      hideOverlay();
      resolve({ kind: 'new', pseudo: input.value.trim() });
    };
    if (existing) {
      const cont = h('button', '', 'Continuer') as HTMLButtonElement;
      cont.onclick = () => {
        hideOverlay();
        resolve({ kind: 'continue' });
      };
      play.className = 'secondary';
      actions.append(cont);
    }
    actions.append(play);
    panel.append(input, actions);
    showOverlay(panel);
  });
}
