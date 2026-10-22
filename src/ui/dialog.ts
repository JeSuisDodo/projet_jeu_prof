import { renderMath } from './math';
import { h, hideOverlay, showOverlay } from './overlay';

/** Affiche une suite de répliques ; Entrée, Espace ou un clic passe à la suivante. */
export function showDialog(who: string, lines: string[]): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    const box = h('div', 'dialog');
    const render = () => {
      box.innerHTML = `<div class="who">${who}</div><div>${renderMath(lines[i])}</div>
        <div class="help">${i < lines.length - 1 ? 'Suite ▸' : 'Fermer ▸'} (Entrée ou clic)</div>`;
    };
    const next = () => {
      i++;
      if (i < lines.length) return render();
      window.removeEventListener('keydown', onKey);
      hideOverlay();
      resolve();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        next();
      }
    };
    box.onclick = next;
    render();
    showOverlay(box, 'dialog');
    // Laisse passer la touche qui a ouvert le dialogue avant d'écouter.
    setTimeout(() => window.addEventListener('keydown', onKey), 150);
  });
}
