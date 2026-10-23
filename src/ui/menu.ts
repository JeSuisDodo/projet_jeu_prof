import { allChapters } from '../content';
import { creatureSvg } from '../game/creatureArt';
import { h } from './overlay';

/**
 * Menu principal : un décor animé (ciel, étoiles, symboles qui montent, mer, créatures qui
 * passent) derrière les écrans d'accueil. Le décor reste affiché pendant les fenêtres de compte
 * et disparaît au lancement du jeu.
 */

const SYMBOLS = ['π', 'Σ', '√', 'Δ', '∫', '%', '÷', '×', 'x²', 'ƒ', '∞', '≈', '½', 'θ', 'eˣ', '∈'];

export const ROLE_ICONS = {
  eleve: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 24 32 12l26 12-26 12z" fill="currentColor"/><path d="M16 29v11c0 5 7 9 16 9s16-4 16-9V29l-16 7z" fill="currentColor" opacity=".7"/><path d="M54 25v15" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="54" cy="43" r="3.5" fill="currentColor"/></svg>`,
  prof: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="8" y="10" width="48" height="32" rx="3" fill="currentColor" opacity=".25" stroke="currentColor" stroke-width="3"/><path d="M15 33l8-8 7 5 10-11 8 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 42l-6 14M40 42l6 14M32 42v8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
};

let root: HTMLElement | null = null;
let content: HTMLElement;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function backdrop(): HTMLElement {
  const sky = h('div', 'menu-sky');
  const stars = h('div', 'menu-stars');
  for (let i = 0; i < 46; i++) {
    const s = h('span');
    s.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 62)}%;animation-delay:${rand(0, 4).toFixed(2)}s;--size:${rand(1.5, 3.5).toFixed(1)}px`;
    stars.append(s);
  }
  const symbols = h('div', 'menu-symbols layer');
  for (let i = 0; i < 18; i++) {
    const s = h('span', '', SYMBOLS[i % SYMBOLS.length]);
    s.style.cssText = `left:${rand(2, 96)}%;font-size:${rand(18, 42).toFixed(0)}px;animation-duration:${rand(14, 26).toFixed(1)}s;animation-delay:-${rand(0, 26).toFixed(1)}s`;
    symbols.append(s);
  }
  const island = h(
    'div',
    'menu-island layer',
    `<svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <path d="M20 120 Q60 70 120 64 Q150 30 200 38 Q250 18 290 52 Q350 58 385 120z" fill="#2d6a4f"/>
      <path d="M120 64 Q150 30 200 38 Q250 18 290 52 Q260 46 240 56 Q205 46 180 60 Q150 56 120 64z" fill="#52b788"/>
      <circle cx="96" cy="84" r="9" fill="#1b4332"/><circle cx="314" cy="80" r="11" fill="#1b4332"/><circle cx="330" cy="88" r="8" fill="#1b4332"/>
    </svg>`,
  );
  const sea = h('div', 'menu-sea');
  for (let i = 0; i < 3; i++) {
    sea.append(
      h(
        'div',
        `wave wave-${i}`,
        `<svg viewBox="0 0 800 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 30 Q50 10 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 V60 H0z"/></svg>`,
      ),
    );
  }
  // Une petite parade de créatures prises au hasard dans toutes les îles.
  const parade = h('div', 'menu-parade');
  const pool = allChapters().flatMap((c) => c.creatures);
  for (let i = 0; i < 7 && pool.length; i++) {
    const c = pool[Math.floor(Math.random() * pool.length)];
    const el = h('button', 'menu-creature', creatureSvg(c));
    el.title = c.name;
    el.setAttribute('aria-label', c.name);
    el.tabIndex = -1;
    el.style.cssText = `--speed:${rand(28, 46).toFixed(1)}s;--delay:-${rand(0, 46).toFixed(1)}s;--size:${rand(54, 84).toFixed(0)}px;--lane:${rand(0, 34).toFixed(0)}px`;
    // Un clic fait sauter la créature.
    el.onclick = () => {
      el.classList.remove('hop');
      void el.offsetWidth;
      el.classList.add('hop');
    };
    parade.append(el);
  }
  const wrap = h('div', 'menu-backdrop');
  wrap.append(sky, stars, symbols, island, parade, sea);
  return wrap;
}

/** Affiche le décor du menu (une seule fois) et renvoie la zone de contenu. */
export function openMenu(): HTMLElement {
  if (root) return content;
  root = h('div', 'menu');
  root.id = 'menu';
  content = h('div', 'menu-content');
  root.append(backdrop(), content);
  // Léger effet de profondeur quand la souris bouge.
  root.addEventListener('pointermove', (e) => {
    root!.style.setProperty('--px', (e.clientX / innerWidth - 0.5).toFixed(3));
    root!.style.setProperty('--py', (e.clientY / innerHeight - 0.5).toFixed(3));
  });
  document.body.append(root);
  return content;
}

/** Remplace l'écran du menu (titre, cartes…) ; vide pour ne laisser que le décor. */
export function setMenuScreen(...nodes: HTMLElement[]): void {
  openMenu();
  content.replaceChildren(...nodes);
}

/** Le jeu démarre : le menu s'efface en fondu. */
export function closeMenu(): void {
  if (!root) return;
  const el = root;
  root = null;
  el.classList.add('leaving');
  setTimeout(() => el.remove(), 600);
}

/** Titre animé lettre par lettre. */
export function menuTitle(text = 'Mathoria'): HTMLElement {
  const title = h('h1', 'menu-title');
  title.setAttribute('aria-label', text);
  [...text].forEach((ch, i) => {
    const s = h('span', '', ch);
    s.style.animationDelay = `${i * 0.08}s, ${0.8 + i * 0.12}s`;
    s.setAttribute('aria-hidden', 'true');
    title.append(s);
  });
  return title;
}
