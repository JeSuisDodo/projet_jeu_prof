import type { ChapterDef } from '../content/types';
import { creatureSvg } from '../game/creatureArt';
import { RARITY, rarityOf, starsOf } from '../game/rarity';
import type { SaveData } from '../game/save';
import { escapeHtml } from './math';
import { h, hideOverlay, showOverlay } from './overlay';

/** Le carnet de l'élève : créatures de la région et taux de réussite par compétence du chapitre. */
export function openJournal(save: SaveData, chapter: ChapterDef, onReset: () => void): void {
  const panel = h('div', 'panel');
  const all = [...chapter.creatures, chapter.boss];
  const cards = all
    .map((c, i) => {
      const n = save.captures[c.id] ?? 0;
      const boss = c === chapter.boss;
      // La rareté se voit même avant la capture : on sait ce qu'il reste à dénicher.
      const rarity = boss ? null : rarityOf(chapter, c);
      const badge = rarity ? `<div class="rarity ${rarity}" title="${RARITY[rarity].label}">${starsOf(rarity)} ${RARITY[rarity].label}</div>` : '';
      return `<div class="card ${n ? '' : 'unknown'} ${rarity ?? 'boss'}" style="animation-delay:${i * 60}ms" title="${n ? escapeHtml(c.description) : ''}">${creatureSvg(c)}<div><strong>${n ? c.name : '???'}</strong></div>${badge}
      <div class="muted">${n ? `capturé ${n} fois` : boss ? 'gardien de la région' : 'pas encore vu'}</div></div>`;
    })
    .join('');

  const rows = chapter.skills
    .map((s) => {
      const st = save.skills[s.id];
      const rate = st && st.attempts ? Math.round((100 * st.correct) / st.attempts) : null;
      return `<tr><td>${s.name}</td>
      <td class="muted">${st ? `${st.correct}/${st.attempts}` : '–'}</td>
      <td><div class="bar"><span style="--rate:${rate ?? 0}%"></span></div></td></tr>`;
    })
    .join('');

  panel.innerHTML = `
    <h2>Carnet de ${escapeHtml(save.pseudo || 'l’aventurier')}</h2>
    <p class="muted">${chapter.region} · ${chapter.title} · ${save.xp} points d'expérience · ${save.badges.length} badge${save.badges.length > 1 ? 's' : ''}
      ${save.badges.includes(chapter.id) ? ' · gardien de la région battu' : ''}</p>
    <div class="dex">${cards}</div>
    <h2>Compétences du chapitre</h2>
    <table class="skills-table">${rows}</table>`;
  const actions = h('div', 'row actions');
  const close = h('button', '', 'Fermer') as HTMLButtonElement;
  close.onclick = hideOverlay;
  const reset = h('button', 'secondary', 'Recommencer la partie') as HTMLButtonElement;
  reset.onclick = () => {
    if (confirm('Effacer toute ta progression sur cet appareil ?')) onReset();
  };
  actions.append(close, reset);
  panel.append(actions);
  showOverlay(panel);
  close.focus({ preventScroll: true });
}
