import { frac, fracLatex } from '../fraction';
import type { Skill } from '../types';
import { enrich, variant } from '../variantes';
import { dec, fixedChoice, fracOf } from './outils';

/** Chapitre 13 de 2nde : probabilités et échantillonnage. */

/** « a/b = forme simplifiée », sans répéter la fraction quand elle est déjà irréductible. */
function ratio(n: number, d: number): string {
  const f = fracLatex(frac(n, d));
  const raw = `\\frac{${n}}{${d}}`;
  return raw === f ? raw : `${raw} = ${f}`;
}

const urne: Skill = {
  id: '2nde-proba-simple',
  name: 'Calculer une probabilité simple',
  generate(rng, level) {
    const colors = ['rouges', 'bleues', 'vertes'];
    const counts = colors.map(() => rng.int(1, level === 1 ? 6 : 12));
    const total = counts.reduce((a, b) => a + b, 0);
    const i = rng.int(0, 2);
    const not = level === 3 && rng.next() < 0.5;
    const favorable = not ? total - counts[i] : counts[i];
    const p = frac(favorable, total);
    const color = colors[i].replace(/s$/, '');
    return {
      skill: '2nde-proba-simple',
      level,
      prompt: `Une urne contient $${counts[0]}$ boules rouges, $${counts[1]}$ bleues et $${counts[2]}$ vertes. On tire une boule au hasard. Quelle est la probabilité qu'elle ${not ? 'ne soit pas' : 'soit'} ${color} ?`,
      answer: { kind: 'number', value: p },
      hint: 'En situation d’équiprobabilité : $P(A) = \\frac{\\text{nombre d’issues favorables}}{\\text{nombre total d’issues}}$.',
      correction: [
        `Il y a $${total}$ boules en tout, dont $${favorable}$ ${not ? `qui ne sont pas ${colors[i]}` : colors[i]}.`,
        `$P = ${ratio(favorable, total)}$`,
      ],
    };
  },
};

const contraire: Skill = {
  id: '2nde-proba-contraire',
  name: 'Utiliser l’événement contraire',
  generate(rng, level) {
    const p = level === 1 ? rng.int(1, 9) / 10 : rng.int(1, 99) / 100;
    return {
      skill: '2nde-proba-contraire',
      level,
      prompt: `On sait que $P(A) = ${dec(p)}$. Que vaut $P(\\overline{A})$ ?`,
      answer: { kind: 'number', value: fracOf(1 - p) },
      hint: '$P(\\overline{A}) = 1 - P(A)$',
      correction: [`$P(\\overline{A}) = 1 - ${dec(p)} = ${dec(1 - p)}$`],
    };
  },
};

const reunion: Skill = {
  id: '2nde-proba-reunion',
  name: 'Calculer la probabilité d’une réunion',
  generate(rng, level) {
    // On tire P(A ∩ B) puis les deux probabilités, en centièmes.
    const inter = level === 1 ? 0 : rng.int(1, 20);
    const pa = inter + rng.int(5, 35);
    const pb = inter + rng.int(5, 35);
    const union = pa + pb - inter;
    const askInter = level === 3 && rng.next() < 0.5;
    const h = (v: number) => dec(v / 100);
    return {
      skill: '2nde-proba-reunion',
      level,
      prompt: askInter
        ? `On sait que $P(A) = ${h(pa)}$, $P(B) = ${h(pb)}$ et $P(A \\cup B) = ${h(union)}$. Que vaut $P(A \\cap B)$ ?`
        : inter === 0
          ? `$A$ et $B$ sont incompatibles, avec $P(A) = ${h(pa)}$ et $P(B) = ${h(pb)}$. Que vaut $P(A \\cup B)$ ?`
          : `On sait que $P(A) = ${h(pa)}$, $P(B) = ${h(pb)}$ et $P(A \\cap B) = ${h(inter)}$. Que vaut $P(A \\cup B)$ ?`,
      answer: { kind: 'number', value: frac(askInter ? inter : union, 100) },
      hint: '$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$',
      correction: askInter
        ? [`$P(A \\cap B) = P(A) + P(B) - P(A \\cup B) = ${h(pa)} + ${h(pb)} - ${h(union)} = ${h(inter)}$`]
        : [`$P(A \\cup B) = ${h(pa)} + ${h(pb)} - ${h(inter)} = ${h(union)}$`],
    };
  },
};

const tableau: Skill = {
  id: '2nde-tableau-double',
  name: 'Lire un tableau à double entrée',
  generate(rng, level) {
    const c = [rng.int(5, 40), rng.int(5, 40), rng.int(5, 40), rng.int(5, 40)];
    const [fl, fn, gl, gn] = c;
    const total = fl + fn + gl + gn;
    const table = `\\begin{array}{|l|c|c|c|} \\hline & \\text{Latin} & \\text{Pas latin} & \\text{Total} \\\\ \\hline \\text{Filles} & ${fl} & ${fn} & ${fl + fn} \\\\ \\hline \\text{Garçons} & ${gl} & ${gn} & ${gl + gn} \\\\ \\hline \\text{Total} & ${fl + gl} & ${fn + gn} & ${total} \\\\ \\hline \\end{array}`;
    const questions = [
      { q: 'soit une fille', fav: fl + fn, why: 'filles' },
      { q: 'fasse du latin', fav: fl + gl, why: 'latinistes' },
      { q: 'soit une fille qui fait du latin', fav: fl, why: 'filles latinistes' },
      { q: 'soit un garçon qui ne fait pas de latin', fav: gn, why: 'garçons non latinistes' },
      { q: 'soit une fille ou fasse du latin', fav: fl + fn + gl, why: 'filles ou latinistes' },
    ];
    const pool = level === 1 ? questions.slice(0, 2) : level === 2 ? questions.slice(0, 4) : questions;
    const pick = rng.pick(pool);
    const p = frac(pick.fav, total);
    return {
      skill: '2nde-tableau-double',
      level,
      prompt: `Dans un lycée, on a relevé qui fait du latin : $${table}$ On choisit un élève au hasard. Quelle est la probabilité qu'il ${pick.q} ?`,
      answer: { kind: 'number', value: p },
      hint: 'Repère dans le tableau le nombre d’élèves concernés, puis divise par l’effectif total.',
      correction: [`Il y a $${pick.fav}$ ${pick.why} sur $${total}$ élèves.`, `$P = ${ratio(pick.fav, total)}$`],
    };
  },
};

const des: Skill = {
  id: '2nde-deux-des',
  name: 'Lancer deux dés',
  generate(rng, level) {
    const kind = level === 1 ? 'somme' : rng.pick(['somme', 'double', 'produit'] as const);
    let fav = 0;
    let event: string;
    if (kind === 'somme') {
      const s = rng.int(2, 12);
      event = `la somme des deux dés soit égale à $${s}$`;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (a + b === s) fav++;
    } else if (kind === 'double') {
      event = 'les deux dés donnent le même nombre';
      fav = 6;
    } else {
      const parity = rng.next() < 0.5;
      event = `le produit des deux dés soit ${parity ? 'pair' : 'impair'}`;
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if ((a * b) % 2 === (parity ? 0 : 1)) fav++;
    }
    const p = frac(fav, 36);
    return {
      skill: '2nde-deux-des',
      level,
      prompt: `On lance deux dés équilibrés à six faces. Quelle est la probabilité que ${event} ?`,
      answer: { kind: 'number', value: p },
      hint: 'Il y a $6 \\times 6 = 36$ issues équiprobables : dresse le tableau des 36 couples.',
      correction: [`Sur les $36$ couples possibles, $${fav}$ réalisent l'événement.`, `$P = ${ratio(fav, 36)}$`],
    };
  },
};

const echantillon: Skill = {
  id: '2nde-echantillonnage',
  name: 'Juger un échantillon',
  generate(rng, level) {
    const n = rng.pick([100, 400, 625, 2500]);
    const margin = 1 / Math.sqrt(n);
    const p = rng.pick([0.2, 0.3, 0.4, 0.5, 0.6]);
    if (level === 1) {
      const k = Math.round(n * rng.int(10, 70) / 100);
      return {
        skill: '2nde-echantillonnage',
        level,
        prompt: `Sur un échantillon de $${n}$ graines plantées, $${k}$ ont germé. Quelle est la fréquence de germination ?`,
        answer: { kind: 'number', value: frac(k, n) },
        hint: 'Fréquence = effectif ÷ taille de l’échantillon.',
        correction: [`$f = \\frac{${k}}{${n}} = ${dec(k / n)}$`],
      };
    }
    const conform = rng.next() < 0.5;
    // Fréquence observée, en centièmes, nettement dedans ou dehors de [p - 1/√n ; p + 1/√n].
    const offset = conform ? rng.int(0, Math.floor(margin * 100) - 1) : Math.ceil(margin * 100) + rng.int(1, 6);
    const f = Math.round((p + rng.sign() * offset / 100) * 100) / 100;
    const k = Math.round(f * n);
    return {
      skill: '2nde-echantillonnage',
      level,
      prompt: `Un fabricant affirme que $${dec(p * 100)}\\,\\%$ de ses ampoules durent plus de 5 ans. Sur un échantillon de $${n}$ ampoules, $${k}$ ont duré plus de 5 ans. Au seuil de 95 %, cet échantillon est-il compatible avec l'affirmation ?`,
      answer: fixedChoice(['Oui', 'Non'], conform ? 0 : 1),
      hint: 'Pour un échantillon de taille $n$, environ 95 % des fréquences observées tombent dans $\\left[p - \\frac{1}{\\sqrt{n}}\\,;\\,p + \\frac{1}{\\sqrt{n}}\\right]$.',
      correction: [
        `$f = \\frac{${k}}{${n}} = ${dec(k / n)}$ et $\\frac{1}{\\sqrt{${n}}} = ${dec(margin)}$.`,
        `L'intervalle est $[${dec(p - margin)}\\,;\\,${dec(p + margin)}]$.`,
        conform ? `$${dec(k / n)}$ est dans l'intervalle : l'échantillon est compatible.` : `$${dec(k / n)}$ est en dehors : l'affirmation est mise en doute.`,
      ],
    };
  },
};

/* ---------- Variantes : d'autres façons de poser les mêmes notions ---------- */

/** Événements d'un jeu de 32 cartes (7 à As, quatre couleurs), avec leur nombre d'issues. */
const CARTES: [string, number][] = [
  ['un roi', 4],
  ['un cœur', 8],
  ['une figure (valet, dame ou roi)', 12],
  ['une carte rouge', 16],
  ['un as ou un roi', 8],
  ['le roi de cœur', 1],
  ['un cœur ou un roi', 11],
  ['une carte noire qui n’est pas une figure', 10],
];

const urneVariantes = [
  variant('cartes', (rng, level) => {
    const [ev, fav] = rng.pick(level === 1 ? CARTES.slice(0, 4) : CARTES);
    return {
      prompt: `On tire une carte au hasard dans un jeu de $32$ cartes (de 7 à l'as, dans les quatre couleurs). Quelle est la probabilité de tirer ${ev} ?`,
      answer: { kind: 'number', value: frac(fav, 32) },
      hint: 'Compte les cartes favorables : chaque couleur a 8 cartes (7, 8, 9, 10, valet, dame, roi, as).',
      correction: [`Il y a $${fav}$ cartes favorables sur $32$.`, `$P = ${ratio(fav, 32)}$`],
    };
  }),
  variant('composition', (rng, level) => {
    const total = rng.pick(level === 1 ? [10, 20, 30] : [12, 18, 24, 40, 45, 60]);
    let rouges: number;
    do rouges = rng.int(1, total - 1);
    while (frac(rouges, total).d === total && level > 1);
    const p = frac(rouges, total);
    return {
      prompt: `Une urne contient $${total}$ jetons. La probabilité de tirer un jeton rouge est $${fracLatex(p)}$. Combien y a-t-il de jetons rouges ?`,
      answer: { kind: 'number', value: frac(rouges) },
      hint: 'Nombre de jetons rouges = probabilité × nombre total.',
      correction: [`$${fracLatex(p)} \\times ${total} = ${rouges}$`],
    };
  }),
];

const contraireVariantes = [
  variant('au-moins-une', (rng, level) => {
    const p = level === 1 ? rng.int(5, 9) / 10 : rng.int(51, 99) / 100;
    return {
      prompt: `La probabilité qu'une journée se passe sans aucune panne est $${dec(p)}$. Quelle est la probabilité qu'il y ait au moins une panne dans la journée ?`,
      answer: { kind: 'number', value: fracOf(1 - p) },
      hint: '« Au moins une panne » est l’événement contraire de « aucune panne ».',
      correction: [`$P = 1 - ${dec(p)} = ${dec(1 - p)}$`],
    };
  }),
  variant('pourcentage', (rng) => {
    const pct = rng.int(5, 95);
    return {
      prompt: `Dans un lycée, $${pct}\\,\\%$ des élèves sont internes. On choisit un élève au hasard. Quelle est la probabilité qu'il ne soit pas interne ? (Donne un nombre décimal.)`,
      answer: { kind: 'number', value: frac(100 - pct, 100) },
      hint: 'Convertis le pourcentage en probabilité, puis prends le contraire.',
      correction: [`$P(I) = ${dec(pct / 100)}$`, `$P(\\overline{I}) = 1 - ${dec(pct / 100)} = ${dec(1 - pct / 100)}$`],
    };
  }),
];

const reunionVariantes = [
  variant('ni-l-un-ni-l-autre', (rng) => {
    const both = rng.int(5, 20);
    const a = both + rng.int(10, 40);
    const b = both + rng.int(5, 30);
    const none = 100 - (a + b - both);
    return {
      prompt: `Dans un lycée, $${a}\\,\\%$ des élèves font du sport en club, $${b}\\,\\%$ font de la musique et $${both}\\,\\%$ font les deux. Quelle est la probabilité qu'un élève choisi au hasard ne fasse ni l'un ni l'autre ?`,
      answer: { kind: 'number', value: frac(none, 100) },
      hint: 'Calcule d’abord $P(S \\cup M)$, puis prends le contraire.',
      correction: [`$P(S \\cup M) = ${dec(a / 100)} + ${dec(b / 100)} - ${dec(both / 100)} = ${dec((a + b - both) / 100)}$`, `$P = 1 - ${dec((a + b - both) / 100)} = ${dec(none / 100)}$`],
    };
  }),
  variant('incompatibles', (rng) => {
    const pa = rng.int(2, 8) / 10;
    const pb = rng.int(2, 8) / 10;
    const ok = pa + pb <= 1 + 1e-9;
    return {
      prompt: `On sait que $P(A) = ${dec(pa)}$ et $P(B) = ${dec(pb)}$. Les événements $A$ et $B$ peuvent-ils être incompatibles ?`,
      answer: fixedChoice(['Oui', 'Non'], ok ? 0 : 1),
      hint: 'S’ils étaient incompatibles, on aurait $P(A \\cup B) = P(A) + P(B)$, et une probabilité ne dépasse jamais 1.',
      correction: [`$P(A) + P(B) = ${dec(pa + pb)}$`, ok ? 'Cette somme ne dépasse pas 1 : c’est possible.' : 'Cette somme dépasse 1 : $A$ et $B$ ne peuvent pas être incompatibles.'],
    };
  }),
];

const tableauVariantes = [
  variant('completer', (rng) => {
    const fl = rng.int(5, 40);
    const fn = rng.int(5, 40);
    const gl = rng.int(5, 40);
    const gn = rng.int(5, 40);
    const total = fl + fn + gl + gn;
    const table = `\\begin{array}{|l|c|c|c|} \\hline & \\text{Externe} & \\text{Demi-pension} & \\text{Total} \\\\ \\hline \\text{Seconde} & ${fl} & ? & ${fl + fn} \\\\ \\hline \\text{Première} & ${gl} & ${gn} & ${gl + gn} \\\\ \\hline \\text{Total} & ${fl + gl} & ${fn + gn} & ${total} \\\\ \\hline \\end{array}`;
    return {
      prompt: `Dans ce tableau, une case a été effacée : $${table}$ On choisit un élève au hasard. Quelle est la probabilité qu'il soit en seconde et demi-pensionnaire ?`,
      answer: { kind: 'number', value: frac(fn, total) },
      hint: 'Retrouve d’abord la case manquante grâce aux totaux.',
      correction: [`Case manquante : $${fl + fn} - ${fl} = ${fn}$.`, `$P = ${ratio(fn, total)}$`],
    };
  }),
  variant('pourcentages', (rng) => {
    const fl = rng.int(5, 30);
    const fn = rng.int(5, 30);
    const gl = rng.int(5, 30);
    const gn = 100 - fl - fn - gl;
    const table = `\\begin{array}{|l|c|c|} \\hline & \\text{Vaccinés} & \\text{Non vaccinés} \\\\ \\hline \\text{Malades} & ${fl}\\,\\% & ${fn}\\,\\% \\\\ \\hline \\text{Non malades} & ${gl}\\,\\% & ${gn}\\,\\% \\\\ \\hline \\end{array}`;
    const ask = rng.pick(['vaccinée', 'malade'] as const);
    const p = ask === 'vaccinée' ? fl + gl : fl + fn;
    return {
      prompt: `Le tableau donne la répartition (en pourcentage) d'une population : $${table}$ On choisit une personne au hasard. Quelle est la probabilité qu'elle soit ${ask} ?`,
      answer: { kind: 'number', value: frac(p, 100) },
      hint: ask === 'vaccinée' ? 'Additionne la colonne des vaccinés.' : 'Additionne la ligne des malades.',
      correction: [`$${ask === 'vaccinée' ? `${fl} + ${gl}` : `${fl} + ${fn}`} = ${p}$ %`, `$P = ${dec(p / 100)}$`],
    };
  }),
];

const desVariantes = [
  variant('piece-et-de', (rng) => {
    const face = rng.pick(['pile', 'face']);
    const kind = rng.pick(['pair', 'un multiple de 3', 'supérieur ou égal à 5', 'égal à 6'] as const);
    const fav = kind === 'pair' ? 3 : kind === 'un multiple de 3' ? 2 : kind === 'supérieur ou égal à 5' ? 2 : 1;
    return {
      prompt: `On lance une pièce équilibrée puis un dé équilibré à six faces. Quelle est la probabilité d'obtenir ${face} et un nombre ${kind} ?`,
      answer: { kind: 'number', value: frac(fav, 12) },
      hint: 'Il y a $2 \\times 6 = 12$ issues équiprobables.',
      correction: [`Issues favorables : ${face} avec un nombre ${kind}, soit $${fav}$ issue${fav > 1 ? 's' : ''} sur $12$.`, `$P = ${ratio(fav, 12)}$`],
    };
  }),
  variant('somme-au-moins', (rng) => {
    const s = rng.int(4, 11);
    const atLeast = rng.next() < 0.5;
    let fav = 0;
    for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) if (atLeast ? a + b >= s : a + b <= s) fav++;
    return {
      prompt: `On lance deux dés équilibrés à six faces. Quelle est la probabilité que la somme soit ${atLeast ? 'supérieure ou égale' : 'inférieure ou égale'} à $${s}$ ?`,
      answer: { kind: 'number', value: frac(fav, 36) },
      hint: 'Dresse le tableau des 36 sommes possibles, puis compte.',
      correction: [`$${fav}$ cases du tableau conviennent sur $36$.`, `$P = ${ratio(fav, 36)}$`],
    };
  }),
];

const echantillonVariantes = [
  variant('borne', (rng) => {
    const n = rng.pick([100, 400, 625, 2500, 10000]);
    const p = rng.pick([0.2, 0.3, 0.45, 0.5, 0.6, 0.75]);
    const low = rng.next() < 0.5;
    const v = Math.round((p + (low ? -1 : 1) / Math.sqrt(n)) * 1e4) / 1e4;
    return {
      prompt: `Pour une proportion $p = ${dec(p)}$ et des échantillons de taille $n = ${n}$, quelle est la borne ${low ? 'inférieure' : 'supérieure'} de l'intervalle $\\left[p - \\frac{1}{\\sqrt{n}}\\,;\\,p + \\frac{1}{\\sqrt{n}}\\right]$ ?`,
      answer: { kind: 'number', value: fracOf(v) },
      hint: 'Calcule $\\frac{1}{\\sqrt{n}}$ : $n$ est un carré parfait.',
      correction: [`$\\frac{1}{\\sqrt{${n}}} = ${dec(1 / Math.sqrt(n))}$`, `$${dec(p)} ${low ? '-' : '+'} ${dec(1 / Math.sqrt(n))} = ${dec(v)}$`],
    };
  }),
  variant('taille', (rng) => {
    const m = rng.pick([0.1, 0.05, 0.04, 0.02, 0.01]);
    const n = Math.round(1 / (m * m));
    return {
      prompt: `Quelle taille d'échantillon $n$ faut-il pour que $\\frac{1}{\\sqrt{n}} = ${dec(m)}$ ?`,
      answer: { kind: 'number', value: frac(n) },
      hint: '$\\sqrt{n} = \\frac{1}{' + dec(m) + '}$, puis élève au carré.',
      correction: [`$\\sqrt{n} = ${dec(1 / m)}$ donc $n = ${n}$.`],
    };
  }),
];

export const PROBABILITES_SKILLS: Skill[] = [
  enrich(urne, urneVariantes),
  enrich(contraire, contraireVariantes),
  enrich(reunion, reunionVariantes),
  enrich(tableau, tableauVariantes),
  enrich(des, desVariantes),
  enrich(echantillon, echantillonVariantes),
];
