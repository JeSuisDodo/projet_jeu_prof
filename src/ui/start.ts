import { GRADES } from '../content';
import type { GradeId } from '../content/types';
import type { SaveData } from '../game/save';
import { escapeHtml } from './math';
import { h, hideOverlay, showOverlay } from './overlay';

export type StartChoice = { kind: 'continue' } | { kind: 'new'; pseudo: string; grade: GradeId };

/** Écran d'accueil : choix de la classe (une île par classe) et du pseudo. */
export function showStart(existing: SaveData | null): Promise<StartChoice> {
  return new Promise((resolve) => {
    const open = GRADES.filter((g) => g.chapters.length > 0);
    let grade: GradeId = existing && open.some((g) => g.id === existing.grade) ? existing.grade : (open[0]?.id ?? '1re-spe');
    const panel = h('div', 'panel start');
    panel.innerHTML = `
      <h1>Mathoria</h1>
      <p class="muted">Explore le monde, affronte les créatures… en résolvant des exercices de maths.</p>
      ${existing ? `<p>Partie en cours : <strong>${escapeHtml(existing.pseudo || 'sans pseudo')}</strong>, ${existing.xp} points d'expérience.</p>` : ''}
      <h2>Choisis ta classe</h2>`;
    const classes = h('div', 'classes');
    for (const [stage, title] of [['college', 'Collège'], ['lycee', 'Lycée']] as const) {
      const grades = GRADES.filter((g) => g.stage === stage);
      if (!grades.length) continue;
      const group = h('div', 'class-group');
      group.append(h('h3', '', title));
      const row = h('div', 'class-row');
      for (const g of grades) {
        const b = h('button', 'secondary', `${g.name}<small>${g.chapters.length ? `${g.island} · ${g.chapters.length} région${g.chapters.length > 1 ? 's' : ''}` : 'Bientôt'}</small>`) as HTMLButtonElement;
        b.disabled = g.chapters.length === 0;
        b.dataset.grade = g.id;
        b.onclick = () => {
          grade = g.id;
          classes.querySelectorAll('button').forEach((x) => x.classList.toggle('selected', x === b));
        };
        if (g.id === grade) b.classList.add('selected');
        row.append(b);
      }
      group.append(row);
      classes.append(group);
    }
    const label = h('label', '', 'Ton prénom ou pseudo');
    label.setAttribute('for', 'pseudo');
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
      resolve({ kind: 'new', pseudo: input.value.trim(), grade });
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
    panel.append(classes, label, input, actions);
    showOverlay(panel);
  });
}
