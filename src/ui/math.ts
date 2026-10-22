import katex from 'katex';
import 'katex/dist/katex.min.css';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Transforme un texte contenant du LaTeX entre $…$ en HTML. */
export function renderMath(text: string): string {
  return text
    .split('$')
    .map((part, i) => (i % 2 ? katex.renderToString(part, { throwOnError: false }) : escapeHtml(part)))
    .join('');
}

export { escapeHtml };
