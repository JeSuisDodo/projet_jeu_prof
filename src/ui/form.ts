import { AccountError, AccountNotice } from '../online/types';
import { h } from './overlay';

/** Champ de formulaire avec son étiquette. */
export function field(label: string, type: 'text' | 'email' | 'password', name: string, attrs: Record<string, string> = {}): { wrap: HTMLElement; input: HTMLInputElement } {
  const wrap = h('label', 'field');
  wrap.append(h('span', '', label));
  const input = document.createElement('input');
  input.type = type;
  input.name = name;
  for (const [k, v] of Object.entries(attrs)) input.setAttribute(k, v);
  wrap.append(input);
  return { wrap, input };
}

/** Zone de message sous un formulaire : erreur en rouge, information en vert. */
export const messageBox = () => {
  const el = h('p', 'form-message');
  el.setAttribute('role', 'alert');
  return el;
};

export function say(box: HTMLElement, text: string, kind: 'error' | 'info' = 'error'): void {
  box.textContent = text;
  box.className = `form-message ${text ? kind : ''}`;
}

/**
 * Lance une action de compte : bouton désactivé pendant l'attente, message d'erreur lisible
 * en cas d'échec. Rend true si l'action a réussi.
 */
export async function attempt(button: HTMLButtonElement, box: HTMLElement, action: () => Promise<void>): Promise<boolean> {
  button.disabled = true;
  button.classList.add('loading');
  say(box, '');
  try {
    await action();
    return true;
  } catch (e) {
    if (!(e instanceof AccountError)) console.error(e);
    say(box, e instanceof AccountError ? e.message : 'Une erreur inattendue est survenue. Réessaie dans un instant.', e instanceof AccountNotice ? 'info' : 'error');
    return false;
  } finally {
    button.disabled = false;
    button.classList.remove('loading');
  }
}

export function button(label: string, className = '', onClick?: () => void): HTMLButtonElement {
  const b = h('button', className, label) as HTMLButtonElement;
  b.type = 'button';
  if (onClick) b.onclick = onClick;
  return b;
}
