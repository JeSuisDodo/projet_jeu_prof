/** La fenêtre unique affichée par-dessus le jeu (combat, carnet, dialogue, accueil). */
const root = () => document.getElementById('overlay') as HTMLDivElement;

let open = false;

export function showOverlay(content: HTMLElement, mode: 'panel' | 'dialog' = 'panel'): void {
  const el = root();
  el.replaceChildren(content);
  el.classList.toggle('dialog-mode', mode === 'dialog');
  el.hidden = false;
  open = true;
}

export function hideOverlay(): void {
  const el = root();
  el.hidden = true;
  el.replaceChildren();
  open = false;
}

export const overlayOpen = () => open;

/** Petit utilitaire pour créer un élément avec du HTML. */
export function h(tag: string, className = '', html = ''): HTMLElement {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html) el.innerHTML = html;
  return el;
}
