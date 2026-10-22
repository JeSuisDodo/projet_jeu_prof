import type { CreatureDef, CreatureShape } from '../content/types';

/**
 * Dessine une créature en SVG à partir de sa silhouette, de sa teinte et de son symbole.
 * Les petits détails (oreilles, cornes, taches, forme des yeux) dépendent de l'identifiant :
 * deux créatures de même silhouette ne se ressemblent pas, et une créature est toujours dessinée
 * de la même façon.
 */

const INK = '#2b1d16';

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

const hsl = (h: number, s: number, l: number) => `hsl(${Math.round(((h % 360) + 360) % 360)} ${s}% ${l}%)`;

const escapeXml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

interface Kit {
  /** Identifiant sûr pour les dégradés (plusieurs créatures sont affichées ensemble dans le carnet). */
  id: string;
  body: string;
  dark: string;
  light: string;
  belly: string;
  accent: string;
  /** Pierre teintée des golems. */
  stone: string;
  stoneDark: string;
  /** Tirage déterministe entre 0 et n-1. */
  pick: (n: number, salt: number) => number;
}

const eye = (x: number, y: number, r: number, style: number) => {
  if (style === 1)
    // Yeux rieurs, fermés en arc.
    return `<path d="M${x - r} ${y + 1} q${r} ${-r * 1.4} ${2 * r} 0" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const iris = style === 2 ? '#c92a2a' : '#212529';
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2"/>
    <circle cx="${x + r * 0.2}" cy="${y + r * 0.1}" r="${r * 0.6}" fill="${iris}"/>
    <circle cx="${x - r * 0.15}" cy="${y - r * 0.3}" r="${r * 0.25}" fill="#fff"/>`;
};

const mouth = (x: number, y: number, style: number) =>
  style === 0
    ? `<path d="M${x - 4} ${y} q4 4 8 0" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`
    : style === 1
      ? `<path d="M${x - 5} ${y} q5 6 10 0 z" fill="#c92a2a" stroke="${INK}" stroke-width="2"/>`
      : `<path d="M${x - 5} ${y} l2.5 3 2.5-3 2.5 3 2.5-3" stroke="${INK}" stroke-width="1.8" fill="none" stroke-linejoin="round"/>`;

/** Symbole du chapitre, gravé sur le ventre ou la poitrine. */
const symbol = (k: Kit, text: string | undefined, x: number, y: number, size = 18) =>
  text
    ? `<text x="${x}" y="${y}" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-style="italic"
        font-size="${text.length > 2 ? size * 0.7 : size}" text-anchor="middle" dominant-baseline="central"
        fill="${k.dark}" stroke="#fff" stroke-width="0.8" paint-order="stroke">${escapeXml(text)}</text>`
    : '';

const SHAPES: Record<CreatureShape, (k: Kit, sym?: string) => string> = {
  blob: (k, sym) => {
    const ears = k.pick(3, 1);
    return `
      ${ears === 0 ? `<path d="M40 38 L34 14 L54 32 Z M80 38 L86 14 L66 32 Z" fill="${k.dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` : ''}
      ${ears === 1 ? `<path d="M60 30 Q58 14 66 8" stroke="${INK}" stroke-width="3" fill="none"/><circle cx="67" cy="8" r="5" fill="${k.accent}" stroke="${INK}" stroke-width="2.5"/>` : ''}
      <ellipse cx="44" cy="104" rx="10" ry="6" fill="${k.dark}" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="76" cy="104" rx="10" ry="6" fill="${k.dark}" stroke="${INK}" stroke-width="3"/>
      <path d="M22 80 Q20 34 60 30 Q100 34 98 80 Q96 104 60 104 Q24 104 22 80 Z" fill="url(#${k.id}-b)" stroke="${INK}" stroke-width="3.5"/>
      ${ears === 2 ? `<circle cx="34" cy="56" r="5" fill="${k.light}" opacity=".7"/><circle cx="88" cy="70" r="4" fill="${k.light}" opacity=".7"/><circle cx="80" cy="46" r="3" fill="${k.light}" opacity=".7"/>` : ''}
      <ellipse cx="60" cy="82" rx="22" ry="16" fill="${k.belly}"/>
      ${eye(48, 56, 7, k.pick(3, 2))}${eye(72, 56, 7, k.pick(3, 2))}
      ${mouth(60, 68, k.pick(3, 3))}
      ${symbol(k, sym, 60, 84)}`;
  },
  oiseau: (k, sym) => `
      <path d="M50 100 l-6 10 M50 100 l2 11 M70 100 l-2 11 M70 100 l6 10" stroke="#e67700" stroke-width="4" stroke-linecap="round"/>
      <path d="M86 74 L112 62 L104 80 L114 90 L88 88 Z" fill="${k.dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${k.pick(2, 1) ? `<path d="M52 26 Q46 6 58 4 Q56 16 62 22 Q66 8 76 10 Q66 18 66 28 Z" fill="${k.accent}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` : ''}
      <ellipse cx="60" cy="68" rx="32" ry="36" fill="url(#${k.id}-b)" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="60" cy="80" rx="20" ry="20" fill="${k.belly}"/>
      <path d="M30 60 Q8 64 12 90 Q26 84 36 82 Z" fill="${k.dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M90 60 Q112 56 110 80 Q98 78 86 80 Z" fill="${k.dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${eye(48, 50, 7, k.pick(3, 2))}${eye(72, 50, 7, k.pick(3, 2))}
      <path d="M54 60 L66 60 L60 70 Z" fill="#fab005" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
      ${symbol(k, sym, 60, 84, 16)}`,
  bete: (k, sym) => {
    const horns = k.pick(3, 1);
    return `
      <path d="M96 70 Q116 60 110 40 Q106 54 92 60" fill="${k.dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="30" y="80" width="12" height="26" rx="5" fill="${k.dark}" stroke="${INK}" stroke-width="3"/>
      <rect x="80" y="80" width="12" height="26" rx="5" fill="${k.dark}" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="62" cy="74" rx="38" ry="24" fill="url(#${k.id}-b)" stroke="${INK}" stroke-width="3.5"/>
      <rect x="44" y="84" width="12" height="22" rx="5" fill="${k.body}" stroke="${INK}" stroke-width="3"/>
      <rect x="66" y="84" width="12" height="22" rx="5" fill="${k.body}" stroke="${INK}" stroke-width="3"/>
      <ellipse cx="62" cy="82" rx="22" ry="11" fill="${k.belly}"/>
      ${horns === 0 ? `<path d="M22 30 L16 8 L32 24 Z M48 26 L54 6 L58 26 Z" fill="#f1f3f5" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` : ''}
      ${horns === 1 ? `<path d="M20 34 Q12 14 26 14 Q24 24 30 30 Z M52 30 Q58 10 66 22 Q58 24 56 32 Z" fill="${k.dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` : ''}
      <circle cx="38" cy="48" r="24" fill="url(#${k.id}-b)" stroke="${INK}" stroke-width="3.5"/>
      ${horns === 2 ? `<path d="M22 30 Q30 20 38 30 Q46 20 54 30" stroke="${k.accent}" stroke-width="5" fill="none" stroke-linecap="round"/>` : ''}
      <ellipse cx="30" cy="58" rx="12" ry="8" fill="${k.belly}" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="26" cy="55" rx="2.5" ry="2" fill="${INK}"/><ellipse cx="34" cy="55" rx="2.5" ry="2" fill="${INK}"/>
      ${eye(30, 40, 5.5, k.pick(3, 2))}${eye(48, 40, 5.5, k.pick(3, 2))}
      ${symbol(k, sym, 72, 70, 16)}`;
  },
  plante: (k, sym) => `
      <path d="M44 86 Q38 100 26 112 M60 86 L60 114 M76 86 Q82 100 94 112" stroke="${INK}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M44 86 Q38 100 26 112 M60 86 L60 114 M76 86 Q82 100 94 112" stroke="#c08552" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M60 76 Q56 56 60 40" stroke="${INK}" stroke-width="9" fill="none"/>
      <path d="M60 76 Q56 56 60 40" stroke="#37b24d" stroke-width="5" fill="none"/>
      <path d="M58 58 Q30 36 14 50 Q34 68 58 62 Z" fill="#51cf66" stroke="${INK}" stroke-width="3"/>
      <path d="M62 52 Q90 28 106 42 Q86 62 62 56 Z" fill="#51cf66" stroke="${INK}" stroke-width="3"/>
      ${Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return `<ellipse cx="${60 + Math.cos(a) * 20}" cy="${28 + Math.sin(a) * 20}" rx="10" ry="7" transform="rotate(${(i * 45).toFixed(0)} ${60 + Math.cos(a) * 20} ${28 + Math.sin(a) * 20})" fill="${k.body}" stroke="${INK}" stroke-width="2.5"/>`;
      }).join('')}
      <circle cx="60" cy="28" r="16" fill="url(#${k.id}-b2)" stroke="${INK}" stroke-width="3"/>
      ${eye(54, 26, 4, k.pick(3, 2))}${eye(66, 26, 4, k.pick(3, 2))}
      <path d="M56 34 q4 3 8 0" stroke="${INK}" stroke-width="2" fill="none"/>
      <path d="M28 72 Q60 64 92 72 L86 88 Q60 94 34 88 Z" fill="${k.dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${symbol(k, sym, 60, 80, 14)}`,
  golem: (k, sym) => `
      <rect x="8" y="46" width="20" height="40" rx="8" fill="${k.stone}" stroke="${INK}" stroke-width="3.5"/>
      <rect x="92" y="46" width="20" height="40" rx="8" fill="${k.stone}" stroke="${INK}" stroke-width="3.5"/>
      <rect x="34" y="90" width="20" height="20" rx="5" fill="${k.stoneDark}" stroke="${INK}" stroke-width="3.5"/>
      <rect x="66" y="90" width="20" height="20" rx="5" fill="${k.stoneDark}" stroke="${INK}" stroke-width="3.5"/>
      <rect x="24" y="38" width="72" height="60" rx="16" fill="url(#${k.id}-g)" stroke="${INK}" stroke-width="3.5"/>
      <rect x="38" y="8" width="44" height="34" rx="10" fill="${k.stoneDark}" stroke="${INK}" stroke-width="3.5"/>
      <rect x="30" y="44" width="26" height="12" rx="6" fill="#adb5bd" opacity=".6"/>
      <circle cx="52" cy="24" r="5" fill="${k.accent}"/><circle cx="68" cy="24" r="5" fill="${k.accent}"/>
      <circle cx="51" cy="23" r="1.6" fill="#fff"/><circle cx="67" cy="23" r="1.6" fill="#fff"/>
      <path d="M30 84 l8 6 M90 82 l-8 8" stroke="${k.accent}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="60" cy="70" r="17" fill="${k.dark}" stroke="${k.accent}" stroke-width="3"/>
      ${symbol(k, sym ?? '★', 60, 70, 20).replace(`fill="${k.dark}"`, `fill="${k.light}"`)}`,
  poisson: (k, sym) => `
      <path d="M84 64 L112 42 L108 64 L112 88 Z" fill="${k.dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 34 Q60 16 76 30 Z" fill="${k.dark}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="54" cy="64" rx="40" ry="30" fill="url(#${k.id}-b)" stroke="${INK}" stroke-width="3.5"/>
      <path d="M40 76 Q54 92 72 78" fill="${k.belly}"/>
      <path d="M56 70 Q64 84 52 92 Q48 80 56 70 Z" fill="${k.dark}" stroke="${INK}" stroke-width="2.5"/>
      ${k.pick(2, 1) ? `<path d="M64 40 q6 24 0 48 M74 44 q5 20 0 40" stroke="${k.light}" stroke-width="3" fill="none" opacity=".7"/>` : ''}
      ${eye(32, 56, 8, k.pick(3, 2))}
      ${mouth(22, 72, k.pick(3, 3))}
      <circle cx="18" cy="30" r="5" fill="none" stroke="#a5d8ff" stroke-width="2"/><circle cx="26" cy="16" r="3" fill="none" stroke="#a5d8ff" stroke-width="2"/>
      ${symbol(k, sym, 58, 62, 16)}`,
  spectre: (k, sym) => `
      <path d="M26 96 Q24 26 60 22 Q96 26 94 96 L86 88 L78 100 L68 90 L60 102 L52 90 L42 100 L34 88 Z" fill="url(#${k.id}-b)" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" opacity=".95"/>
      <path d="M26 62 Q10 56 8 70 Q18 70 26 74 M94 62 Q110 56 112 70 Q102 70 94 74" fill="${k.body}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      ${k.pick(2, 1) ? `<path d="M44 26 Q60 4 76 26" fill="${k.accent}" stroke="${INK}" stroke-width="2.5"/>` : ''}
      <ellipse cx="47" cy="50" rx="8" ry="10" fill="${INK}"/><ellipse cx="73" cy="50" rx="8" ry="10" fill="${INK}"/>
      <circle cx="45" cy="47" r="3" fill="${k.accent}"/><circle cx="71" cy="47" r="3" fill="${k.accent}"/>
      ${mouth(60, 66, k.pick(3, 3))}
      ${symbol(k, sym, 60, 82, 16)}`,
  insecte: (k, sym) => `
      <path d="M44 34 Q36 12 24 10 M76 34 Q84 12 96 10" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="24" cy="10" r="4" fill="${k.accent}" stroke="${INK}" stroke-width="2"/><circle cx="96" cy="10" r="4" fill="${k.accent}" stroke="${INK}" stroke-width="2"/>
      ${[56, 72, 88]
        .map((y) => `<path d="M30 ${y} L12 ${y + 8} M90 ${y} L108 ${y + 8}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`)
        .join('')}
      <ellipse cx="60" cy="76" rx="32" ry="30" fill="url(#${k.id}-b)" stroke="${INK}" stroke-width="3.5"/>
      <path d="M60 48 L60 104" stroke="${INK}" stroke-width="2.5"/>
      ${k.pick(2, 1) ? `<circle cx="46" cy="70" r="5" fill="${k.dark}"/><circle cx="76" cy="84" r="6" fill="${k.dark}"/><circle cx="70" cy="62" r="4" fill="${k.dark}"/>` : `<path d="M34 72 Q60 64 86 72 M36 88 Q60 80 84 88" stroke="${k.light}" stroke-width="3" fill="none"/>`}
      <circle cx="60" cy="42" r="18" fill="${k.dark}" stroke="${INK}" stroke-width="3.5"/>
      ${eye(53, 40, 5, k.pick(3, 2))}${eye(67, 40, 5, k.pick(3, 2))}
      ${mouth(60, 50, k.pick(3, 3))}
      ${symbol(k, sym, 46, 92, 14)}`,
};

/** SVG complet (viewBox 0 0 120 120) d'une créature : son dessin fait main s'il existe. */
export function creatureSvg(def: Pick<CreatureDef, 'id' | 'look' | 'svg'>): string {
  if (def.svg) return def.svg;
  const seed = hash(def.id);
  const hue = def.look.hue;
  const kit: Kit = {
    id: `c${seed.toString(36)}`,
    body: hsl(hue, 70, 55),
    dark: hsl(hue, 60, 34),
    light: hsl(hue, 85, 78),
    belly: hsl(hue + 25, 80, 88),
    accent: hsl(hue + 150, 85, 58),
    stone: hsl(hue, 20, 48),
    stoneDark: hsl(hue, 22, 30),
    pick: (n, salt) => (hash(`${def.id}:${salt}`) % n),
  };
  const defs = `<defs>
    <radialGradient id="${kit.id}-b" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${kit.light}"/><stop offset="1" stop-color="${kit.body}"/></radialGradient>
    <radialGradient id="${kit.id}-b2" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff3bf"/><stop offset="1" stop-color="${kit.light}"/></radialGradient>
    <linearGradient id="${kit.id}-g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${hsl(hue, 22, 60)}"/><stop offset="1" stop-color="${hsl(hue, 22, 34)}"/></linearGradient>
  </defs>`;
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${defs}
    <ellipse cx="60" cy="112" rx="36" ry="6" fill="#000" opacity="0.18"/>
    ${SHAPES[def.look.shape](kit, def.look.symbol)}</svg>`;
}
