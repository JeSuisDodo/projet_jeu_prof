import { SECOND_DEGRE_SKILLS } from '../exercises/secondDegre';
import { CREATURES } from '../game/creatures';
import type { SaveData } from '../game/save';
import { escapeHtml } from './math';
import { h, hideOverlay, showOverlay } from './overlay';

/** Le carnet de l'élève : créatures capturées et taux de réussite par compétence. */
export function openJournal(save: SaveData, onReset: () => void): void {
  const panel = h('div', 'panel');
  const cards = CREATURES.map((c, i) => {
    const n = save.captures[c.id] ?? 0;
    return `<div class="card ${n ? '' : 'unknown'}" style="animation-delay:${i * 60}ms">${c.svg}<div><strong>${n ? c.name : '???'}</strong></div>
      <div class="muted">${n ? `capturé ${n} fois` : c.boss ? 'gardien du cratère' : 'pas encore vu'}</div></div>`;
  }).join('');

  const rows = SECOND_DEGRE_SKILLS.map((s) => {
    const st = save.skills[s.id];
    const rate = st && st.attempts ? Math.round((100 * st.correct) / st.attempts) : null;
    return `<tr><td>${s.name}</td>
      <td class="muted">${st ? `${st.correct}/${st.attempts}` : '–'}</td>
      <td><div class="bar"><span style="--rate:${rate ?? 0}%"></span></div></td></tr>`;
  }).join('');

  panel.innerHTML = `
    <h2>Carnet de ${escapeHtml(save.pseudo || 'l’aventurier')}</h2>
    <p class="muted">Volcan du Second degré · 1re spécialité · ${save.xp} points d'expérience
      ${save.badges.includes('volcan') ? ' · Badge du Volcan obtenu' : ''}</p>
    <div class="dex">${cards}</div>
    <h2>Compétences</h2>
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
