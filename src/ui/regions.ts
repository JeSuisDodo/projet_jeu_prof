import { GRADES } from '../content';
import type { GradeId } from '../content/types';
import { creatureSvg } from '../game/creatureArt';
import type { SaveData } from '../game/save';
import { speciesCaught } from '../game/save';
import { THEMES } from '../game/themes';
import { h, hideOverlay, showOverlay } from './overlay';

/**
 * Carte de l'île : une carte par région (chapitre), avec la progression de l'élève.
 * Des onglets permettent de visiter les autres îles, pour réviser ou prendre de l'avance.
 */
export function openRegions(save: SaveData, onPick: (grade: GradeId, chapterId: string) => void, closable = true): void {
  let shown: GradeId = save.grade;
  const panel = h('div', 'panel regions');
  const render = () => {
    const grade = GRADES.find((g) => g.id === shown)!;
    panel.innerHTML = `<h2>${grade.island}</h2>
      <p class="muted">${grade.name} : choisis une région. Chaque région est un chapitre du programme.</p>`;
    const tabs = h('div', 'tabs');
    for (const g of GRADES) {
      const b = h('button', g.id === shown ? '' : 'secondary', g.name) as HTMLButtonElement;
      b.disabled = g.chapters.length === 0;
      b.onclick = () => {
        shown = g.id;
        render();
      };
      tabs.append(b);
    }
    const list = h('div', 'region-list');
    grade.chapters.forEach((c, i) => {
      const ids = c.creatures.map((x) => x.id);
      const caught = speciesCaught(save, ids);
      const done = save.badges.includes(c.id);
      const here = save.region === c.id;
      const card = h('button', `region-card ${here ? 'here' : ''}`) as HTMLButtonElement;
      card.style.setProperty('--theme', THEMES[c.theme].accent);
      card.innerHTML = `
        <span class="region-art">${creatureSvg(c.boss)}</span>
        <span class="region-text">
          <small>Chapitre ${i + 1} · ${c.title}</small>
          <strong>${c.region}</strong>
          <span class="muted">${caught}/${ids.length} espèces${done ? ' · gardien battu ✓' : ''}${here ? ' · tu es ici' : ''}</span>
        </span>`;
      card.onclick = () => {
        hideOverlay();
        onPick(grade.id, c.id);
      };
      list.append(card);
    });
    panel.append(tabs, list);
    if (closable) {
      const actions = h('div', 'row actions');
      const close = h('button', 'secondary', 'Fermer') as HTMLButtonElement;
      close.onclick = hideOverlay;
      actions.append(close);
      panel.append(actions);
    }
  };
  render();
  showOverlay(panel);
}
