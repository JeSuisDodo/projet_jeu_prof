import { choiceTex, dec, decimal, euros, fl, gcd, ouiNon, par, poly, prenom } from '../../college';
import { frac } from '../../fraction';
import type { Answer } from '../../types';
import type { Variant } from '../../variantes';

/** 3e : nouvelles formes pour le calcul littéral et les équations (développer, factoriser, problèmes mis en équation). */

const aff = (a: number, b: number) => poly([a, b]);
const pair = (a: number, b: number, labels: [string, string]): Answer => ({ kind: 'pair', values: [frac(a), frac(b)], labels });
/** « + 3 » ou « - 3 ». */
const sg = (v: number) => `${v < 0 ? '-' : '+'} ${Math.abs(v)}`;

const DEV_SIMPLE: Variant[] = [
  {
    name: 'deux-produits',
    make: (rng, level) => {
      const k = rng.int(2, 6);
      const m = level === 1 ? rng.int(2, 5) : rng.nonZero(-5, 5);
      const [a, b, c, d] = [rng.int(1, 4), rng.nonZero(-6, 6), rng.int(1, 4), rng.nonZero(-6, 6)];
      const A = k * a + m * c;
      const B = k * b + m * d;
      const expr = `${k}(${aff(a, b)}) ${m < 0 ? '-' : '+'} ${Math.abs(m)}(${aff(c, d)})`;
      return {
        prompt: `Développe et réduis $${expr}$. On obtient $ax + b$ : donne $a$ et $b$.`,
        answer: pair(A, B, ['a', 'b']),
        hint: 'Développe chaque produit, en gardant le signe devant le second, puis regroupe les termes en $x$ et les nombres.',
        correction: [`$${expr} = ${poly([k * a, k * b])} ${m * c < 0 ? '-' : '+'} ${poly([Math.abs(m * c), 0])} ${sg(m * d)}$`, `$= ${poly([A, B])}$`],
      };
    },
  },
  {
    name: 'erreur-signe',
    make: (rng) => {
      const k = rng.int(2, 7);
      const b = rng.int(1, 9);
      const right = rng.next() < 0.5;
      const res = right ? poly([-k, k * b]) : poly([-k, -k * b]);
      const who = prenom(rng);
      return {
        prompt: `${who} a écrit : $-${k}(x - ${b}) = ${res}$. Est-ce juste ?`,
        answer: ouiNon(right),
        hint: 'Multiplier par un nombre négatif change le signe de chaque terme de la parenthèse.',
        correction: [`$-${k}(x - ${b}) = -${k} \\times x + (-${k}) \\times (-${b}) = ${poly([-k, k * b])}$.`, right ? 'Le calcul est juste.' : `Le calcul est faux : $(-${k}) \\times (-${b}) = ${k * b}$, positif.`],
      };
    },
  },
];

const DEV_DOUBLE: Variant[] = [
  {
    name: 'coefficient',
    make: (rng, level) => {
      const [a, c] = level === 1 ? [1, 1] : [rng.nonZero(-3, 3), rng.nonZero(-3, 3)];
      const [b, d] = [rng.nonZero(-7, 7), rng.nonZero(-7, 7)];
      const B = a * d + b * c;
      return {
        prompt: `On développe et on réduit $(${aff(a, b)})(${aff(c, d)})$. Quel est le coefficient de $x$ ?`,
        answer: decimal(B),
        hint: 'Les termes en $x$ viennent des deux produits « croisés » : premier terme × nombre, nombre × premier terme.',
        correction: [`Termes en $x$ : $${poly([a, 0])} \\times ${par(d)} + ${par(b)} \\times ${poly([c, 0])} = ${poly([a * d, 0])} ${sg(b * c)}x$`, `Le coefficient de $x$ est $${B}$ (développement : $${poly([a * c, B, b * d])}$).`],
      };
    },
  },
  {
    name: 'aire-rectangle',
    make: (rng) => {
      const a = rng.int(1, 9);
      const b = rng.int(1, 9);
      return {
        prompt: `Un rectangle a pour longueur $x + ${a}$ et pour largeur $x + ${b}$ (en cm). Son aire s’écrit $x^2 + px + q$ : donne $p$ et $q$.`,
        answer: pair(a + b, a * b, ['p', 'q']),
        hint: 'L’aire est le produit $(x + a)(x + b)$ : développe-le.',
        correction: [`$(x + ${a})(x + ${b}) = x^2 + ${b}x + ${a}x + ${a * b}$`, `$= x^2 + ${a + b}x + ${a * b}$ : $p = ${a + b}$ et $q = ${a * b}$.`],
      };
    },
  },
  {
    name: 'difference-produits',
    from: 3,
    make: (rng) => {
      const [a, b, c, d] = [rng.int(1, 3), rng.nonZero(-5, 5), rng.int(1, 3), rng.nonZero(-5, 5)];
      const [e, f] = [rng.int(1, 3), rng.nonZero(-5, 5)];
      // (ax + b)(cx + d) - (ex + f)^2
      const A = a * c - e * e;
      const B = a * d + b * c - 2 * e * f;
      const C = b * d - f * f;
      return {
        prompt: `Développe et réduis $(${aff(a, b)})(${aff(c, d)}) - (${aff(e, f)})^2$.`,
        answer: choiceTex(rng, poly([A, B, C]), [poly([A, B, b * d + f * f]), poly([a * c + e * e, B, C]), poly([A, a * d + b * c + 2 * e * f, C]), poly([A, B - 2 * e * f, C])], () => poly([A, B + rng.nonZero(-3, 3), C])),
        hint: 'Développe le produit et le carré séparément, puis mets le carré développé entre parenthèses avant de soustraire.',
        correction: [`$(${aff(a, b)})(${aff(c, d)}) = ${poly([a * c, a * d + b * c, b * d])}$`, `$(${aff(e, f)})^2 = ${poly([e * e, 2 * e * f, f * f])}$`, `Différence : $${poly([A, B, C])}$`],
      };
    },
  },
];

const IDENTITES: Variant[] = [
  {
    name: 'calcul-mental',
    make: (rng, level) => {
      const base = rng.pick(level === 1 ? [10, 20, 30, 100] : [50, 100, 1000]);
      const k = rng.int(1, level === 1 ? 2 : 5);
      const kind = rng.pick(['plus', 'moins', 'diff'] as const);
      if (kind === 'diff') {
        const v = base * base - k * k;
        return {
          prompt: `Calcule mentalement $${base + k} \\times ${base - k}$ (pense à une identité remarquable).`,
          answer: decimal(v),
          hint: '$(a + b)(a - b) = a^2 - b^2$',
          correction: [`$${base + k} \\times ${base - k} = (${base} + ${k})(${base} - ${k}) = ${base}^2 - ${k}^2 = ${base * base} - ${k * k} = ${v}$`],
        };
      }
      const s = kind === 'plus' ? 1 : -1;
      const n = base + s * k;
      return {
        prompt: `Calcule mentalement $${n}^2$ (pense à une identité remarquable).`,
        answer: decimal(n * n),
        hint: s > 0 ? '$(a + b)^2 = a^2 + 2ab + b^2$' : '$(a - b)^2 = a^2 - 2ab + b^2$',
        correction: [`$${n}^2 = (${base} ${s > 0 ? '+' : '-'} ${k})^2 = ${base * base} ${s > 0 ? '+' : '-'} ${2 * base * k} + ${k * k} = ${n * n}$`],
      };
    },
  },
  {
    name: 'completer',
    make: (rng, level) => {
      const a = level === 1 ? 1 : rng.int(1, 4);
      const b = rng.int(1, 9);
      const s = rng.sign();
      const ax = poly([a, 0]);
      return {
        prompt: `Complète : $(${ax} ${s > 0 ? '+' : '-'} \\ldots)^2 = ${poly([a * a, 2 * s * a * b, b * b])}$. Quel nombre manque-t-il ?`,
        answer: decimal(b),
        hint: 'Le dernier terme est le carré du nombre cherché ; vérifie avec le double produit.',
        correction: [`$${b * b} = ${b}^2$ et $2 \\times ${ax} \\times ${b} = ${poly([2 * a * b, 0])}$ : le nombre est $${b}$.`],
      };
    },
  },
];

const FACTORISER: Variant[] = [
  {
    name: 'facteur-x',
    make: (rng, level) => {
      const a = level === 1 ? 1 : rng.int(1, 5);
      const k = rng.nonZero(-9, 9);
      return {
        prompt: `On factorise $${poly([a, k, 0])} = x(${poly([a, 0])} + \\ldots)$. Quel nombre manque-t-il ?`,
        answer: decimal(k),
        hint: 'Le facteur commun est $x$ : divise chaque terme par $x$.',
        correction: [`$${poly([a, k, 0])} = x \\times ${poly([a, 0])} + x \\times ${par(k)} = x(${poly([a, k])})$`],
      };
    },
  },
  {
    name: 'facteur-binome',
    from: 2,
    make: (rng) => {
      const [p, q] = [rng.int(1, 3), rng.nonZero(-6, 6)];
      const [c, d] = [rng.int(1, 4), rng.nonZero(-6, 6)];
      const [e, f] = [rng.int(1, 4), rng.nonZero(-6, 6)];
      const minus = rng.next() < 0.5;
      const A = minus ? c - e : c + e;
      const B = minus ? d - f : d + f;
      const F = aff(p, q);
      return {
        prompt: `On factorise $(${F})(${aff(c, d)}) ${minus ? '-' : '+'} (${F})(${aff(e, f)}) = (${F})(ax + b)$. Donne $a$ et $b$.`,
        answer: pair(A, B, ['a', 'b']),
        hint: `Le facteur commun est $(${F})$ ; attention au signe ${minus ? 'moins devant la seconde parenthèse' : 'entre les deux produits'}.`,
        correction: [`$= (${F})[(${aff(c, d)}) ${minus ? '-' : '+'} (${aff(e, f)})]$`, `$= (${F})(${poly([A, B])})$`],
      };
    },
  },
  {
    name: 'plus-grand-facteur',
    make: (rng, level) => {
      const k = rng.int(2, level === 1 ? 6 : 12);
      let a: number;
      let b: number;
      do {
        a = rng.int(1, 7);
        b = rng.nonZero(-9, 9);
      } while (gcd(a, b) !== 1);
      return {
        prompt: `On factorise $${poly([k * a, k * b])}$ en $k(ax + b)$ avec le plus grand entier $k$ possible. Que vaut $k$ ?`,
        answer: decimal(k),
        hint: 'Cherche le plus grand diviseur commun des deux coefficients.',
        correction: [`$${poly([k * a, k * b])} = ${k} \\times ${poly([a, 0])} + ${k} \\times ${par(b)} = ${k}(${poly([a, b])})$`, `$${a}$ et $${Math.abs(b)}$ n’ont pas d’autre diviseur commun que $1$ : $k = ${k}$.`],
      };
    },
  },
];

const FACTO_IDENTITE: Variant[] = [
  {
    name: 'coefficients',
    make: (rng, level) => {
      const a = level === 1 ? 1 : rng.int(2, 6);
      const b = rng.int(1, 9);
      return {
        prompt: `On écrit $${poly([a * a, 0, -b * b])} = (ax - b)(ax + b)$ avec $a$ et $b$ positifs. Donne $a$ et $b$.`,
        answer: pair(a, b, ['a', 'b']),
        hint: 'Écris chaque terme comme un carré : $a^2 - b^2 = (a - b)(a + b)$.',
        correction: [`$${poly([a * a, 0, 0])} = (${poly([a, 0])})^2$ et $${b * b} = ${b}^2$.`, `$= (${poly([a, -b])})(${poly([a, b])})$`],
      };
    },
  },
  {
    name: 'carre-parfait',
    from: 2,
    make: (rng, level) => {
      const a = level === 2 ? rng.int(1, 3) : rng.int(2, 5);
      const b = rng.int(1, 7);
      const s = rng.sign();
      const ax = poly([a, 0]);
      return {
        prompt: `On écrit $${poly([a * a, 2 * s * a * b, b * b])} = (${ax} ${s > 0 ? '+' : '-'} c)^2$ avec $c$ positif. Que vaut $c$ ?`,
        answer: decimal(b),
        hint: s > 0 ? 'Reconnais $a^2 + 2ab + b^2 = (a + b)^2$.' : 'Reconnais $a^2 - 2ab + b^2 = (a - b)^2$.',
        correction: [`$${b * b} = ${b}^2$ et $2 \\times ${ax} \\times ${b} = ${poly([2 * a * b, 0])}$.`, `Donc l’expression vaut $(${ax} ${s > 0 ? '+' : '-'} ${b})^2$ : $c = ${b}$.`],
      };
    },
  },
  {
    name: 'calcul-astucieux',
    make: (rng) => {
      const m = rng.int(30, 99);
      const k = rng.int(1, 9);
      const [x, y] = [m + k, m - k];
      return {
        prompt: `Calcule astucieusement $${x}^2 - ${y}^2$.`,
        answer: decimal(x * x - y * y),
        hint: '$a^2 - b^2 = (a - b)(a + b)$',
        correction: [`$${x}^2 - ${y}^2 = (${x} - ${y})(${x} + ${y}) = ${x - y} \\times ${x + y} = ${x * x - y * y}$`],
      };
    },
  },
  {
    name: 'binomes',
    from: 3,
    make: (rng) => {
      const [a, b] = [rng.int(2, 4), rng.nonZero(-6, 6)];
      const c = rng.int(1, 8);
      // (ax + b)^2 - c^2 = (ax + b - c)(ax + b + c)
      const opts = [`(${aff(a, b - c)})(${aff(a, b + c)})`, `(${aff(a, b - c)})^2`, `(${aff(a, b - c * c)})(${aff(a, b + c * c)})`, `(${aff(a, b)} - ${c})^2`];
      return {
        prompt: `Factorise $(${aff(a, b)})^2 - ${c * c}$.`,
        answer: choiceTex(rng, opts[0], opts.slice(1), () => `(${aff(a, b - c - 1)})(${aff(a, b + c)})`),
        hint: `$${c * c} = ${c}^2$ : utilise $A^2 - B^2 = (A - B)(A + B)$ avec $A = ${aff(a, b)}$.`,
        correction: [`$(${aff(a, b)})^2 - ${c}^2 = (${aff(a, b)} - ${c})(${aff(a, b)} + ${c})$`, `$= ${opts[0]}$`],
      };
    },
  },
];

const PROGRAMME: Variant[] = [
  {
    name: 'retrouver-depart',
    make: (rng, level) => {
      const a = rng.int(2, 9);
      const b = rng.int(2, 6);
      const c = rng.int(1, 12);
      const x = level === 1 ? rng.int(1, 12) : rng.int(-8, 15);
      const r = (x + a) * b - c;
      return {
        prompt: `Programme : choisir un nombre, lui ajouter $${a}$, multiplier le résultat par $${b}$, puis soustraire $${c}$. On obtient $${r}$. Quel nombre a-t-on choisi ?`,
        answer: decimal(x),
        hint: 'Remonte le programme à l’envers : ajoute, divise, puis soustrais. Ou résous $(x + ' + a + ') \\times ' + b + ' - ' + c + ' = ' + r + '$.',
        correction: [`$(x + ${a}) \\times ${b} - ${c} = ${r}$`, `$(x + ${a}) \\times ${b} = ${r + c}$, donc $x + ${a} = ${(r + c) / b}$.`, `$x = ${x}$`],
      };
    },
  },
  {
    name: 'conjecture',
    from: 2,
    make: (rng) => {
      const a = rng.int(2, 9);
      const kind = rng.pick(['carre', 'double'] as const);
      if (kind === 'carre') {
        const opts = ['x^2', `x^2 + ${a * a}`, `${2 * a}x`, `x^2 - ${a * a}`, `${a * a}`];
        return {
          prompt: `Programme : choisir un nombre $x$, lui ajouter $${a}$, multiplier le résultat par ($x - ${a}$), puis ajouter $${a * a}$. Quelle expression donne le résultat ?`,
          answer: choiceTex(rng, opts[0], opts.slice(1), () => `x^2 + ${a}`),
          hint: 'Écris le programme avec $x$, puis développe.',
          correction: [`$(x + ${a})(x - ${a}) + ${a * a} = x^2 - ${a * a} + ${a * a} = x^2$`, 'Le programme rend toujours le carré du nombre choisi.'],
        };
      }
      const opts = [`${2 * a}x + ${a * a}`, `${a * a}`, 'x^2', `${a}x + ${a * a}`, `2x + ${a * a}`];
      return {
        prompt: `Programme : choisir un nombre $x$, ajouter $${a}$, élever au carré, puis soustraire le carré du nombre choisi. Quelle expression donne le résultat ?`,
        answer: choiceTex(rng, opts[0], opts.slice(1), () => `${2 * a}x`),
        hint: 'Le résultat est $(x + ' + a + ')^2 - x^2$ : développe.',
        correction: [`$(x + ${a})^2 - x^2 = x^2 + ${2 * a}x + ${a * a} - x^2 = ${2 * a}x + ${a * a}$`],
      };
    },
  },
];

const EQUATION: Variant[] = [
  {
    name: 'fraction',
    make: (rng, level) => {
      const a = rng.int(2, level === 1 ? 5 : 9);
      const x = a * rng.int(level === 1 ? 1 : -6, 8);
      const b = rng.nonZero(-9, 9);
      const c = x / a + b;
      return {
        prompt: `Résous l’équation $\\frac{x}{${a}} ${sg(b)} = ${c}$.`,
        answer: decimal(x),
        hint: `Isole $\\frac{x}{${a}}$, puis multiplie par $${a}$.`,
        correction: [`$\\frac{x}{${a}} = ${c} ${sg(-b)} = ${c - b}$`, `$x = ${c - b} \\times ${a} = ${x}$`],
      };
    },
  },
  {
    name: 'deux-parentheses',
    from: 2,
    make: (rng, level) => {
      let a: number;
      let c: number;
      do {
        a = rng.int(2, 7);
        c = rng.int(1, 7);
      } while (a === c);
      const b = rng.nonZero(-6, 6);
      const d = rng.nonZero(-6, 6);
      // a(x + b) = c(x + d) → x = (cd - ab)/(a - c)
      const sol = frac(c * d - a * b, a - c);
      return {
        prompt: `Résous l’équation $${a}(${aff(1, b)}) = ${c === 1 ? '' : c}(${aff(1, d)})$.${level === 3 ? ' Donne la solution sous forme de fraction si besoin.' : ''}`,
        answer: { kind: 'number', value: sol },
        hint: 'Développe chaque membre, puis regroupe les $x$ d’un côté.',
        correction: [`$${poly([a, a * b])} = ${poly([c, c * d])}$`, `$${poly([a - c, 0])} = ${c * d - a * b}$`, `$x = ${fl(c * d - a * b, a - c)}$`],
      };
    },
  },
  {
    name: 'egalite-expressions',
    make: (rng, level) => {
      let a: number;
      let c: number;
      do {
        a = rng.int(1, 9);
        c = rng.int(1, 9);
      } while (a === c);
      const x = rng.int(level === 1 ? 0 : -6, 9);
      const b = rng.int(-10, 10);
      const d = (a - c) * x + b;
      return {
        prompt: `Pour quelle valeur de $x$ les expressions $A = ${aff(a, b)}$ et $B = ${aff(c, d)}$ prennent-elles la même valeur ?`,
        answer: decimal(x),
        hint: 'Résous l’équation $A = B$.',
        correction: [`$${aff(a, b)} = ${aff(c, d)}$`, `$${poly([a - c, 0])} = ${d - b}$`, `$x = ${x}$ ; alors $A = B = ${a * x + b}$.`],
      };
    },
  },
];

const PRODUIT_NUL: Variant[] = [
  {
    name: 'facteur-x',
    make: (rng, level) => {
      const a = level === 1 ? 1 : rng.int(1, 4);
      const k = rng.nonZero(-9, 9) * a;
      return {
        prompt: `Résous l’équation $${poly([a, -k, 0])} = 0$. Donne les solutions séparées par « ; ».`,
        answer: { kind: 'set', values: [frac(0), frac(k, a)] },
        hint: 'Factorise par $x$, puis utilise la règle du produit nul.',
        correction: [`$${poly([a, -k, 0])} = x(${poly([a, -k])})$`, `$x = 0$ ou $${poly([a, -k])} = 0$, soit $x = ${fl(k, a)}$.`],
      };
    },
  },
  {
    name: 'difference-carres',
    from: 2,
    make: (rng) => {
      const a = rng.nonZero(-6, 6);
      const b = rng.int(1, 8);
      const sols = [frac(-a - b), frac(-a + b)];
      return {
        prompt: `Résous l’équation $(${aff(1, a)})^2 - ${b * b} = 0$. Donne les solutions séparées par « ; ».`,
        answer: { kind: 'set', values: sols },
        hint: 'Factorise d’abord avec $A^2 - B^2 = (A - B)(A + B)$.',
        correction: [`$(${aff(1, a)} - ${b})(${aff(1, a)} + ${b}) = 0$`, `$(${aff(1, a - b)})(${aff(1, a + b)}) = 0$`, `$x = ${-a + b}$ ou $x = ${-a - b}$`],
      };
    },
  },
  {
    name: 'est-solution',
    make: (rng) => {
      const b = rng.nonZero(-9, 9);
      const d = rng.nonZero(-9, 9);
      const yes = rng.next() < 0.5;
      const t = yes ? -b : rng.pick([b, -d + 1, -b + 1].filter((v) => v !== -b && v !== -d));
      return {
        prompt: `Le nombre $${t}$ est-il solution de l’équation $(${aff(1, b)})(${aff(1, d)}) = 0$ ?`,
        answer: ouiNon((t + b) * (t + d) === 0),
        hint: 'Remplace $x$ par le nombre : le produit est-il nul ?',
        correction: [`$(${par(t)} ${sg(b)})(${par(t)} ${sg(d)}) = ${t + b} \\times ${par(t + d)} = ${(t + b) * (t + d)}$`, (t + b) * (t + d) === 0 ? 'Le produit est nul : c’est une solution.' : 'Le produit n’est pas nul : ce n’est pas une solution.'],
      };
    },
  },
];

const CARRE: Variant[] = [
  {
    name: 'nombre-solutions',
    make: (rng) => {
      const kind = rng.pick(['pos', 'neg', 'zero', 'pos'] as const);
      const r = rng.int(1, 12);
      const k = kind === 'pos' ? r * r + rng.int(0, 1) * rng.int(1, 5) : kind === 'neg' ? -r : 0;
      const n = k > 0 ? 2 : k === 0 ? 1 : 0;
      return {
        prompt: `Combien de solutions l’équation $x^2 = ${k}$ a-t-elle ?`,
        answer: { kind: 'choice', options: ['Aucune', 'Une seule', 'Deux'], correct: n === 0 ? 0 : n === 1 ? 1 : 2 },
        hint: 'Un carré est toujours positif ou nul.',
        correction: [k > 0 ? `$${k} > 0$ : deux solutions, $\\sqrt{${k}}$ et $-\\sqrt{${k}}$.` : k === 0 ? 'Seul $0$ a pour carré $0$.' : `Un carré ne peut pas valoir $${k}$, nombre négatif : aucune solution.`],
      };
    },
  },
  {
    name: 'decale',
    from: 2,
    make: (rng) => {
      const a = rng.nonZero(-7, 7);
      const b = rng.int(1, 9);
      return {
        prompt: `Résous l’équation $(${aff(1, -a)})^2 = ${b * b}$. Donne les solutions séparées par « ; ».`,
        answer: { kind: 'set', values: [frac(a - b), frac(a + b)] },
        hint: `$X^2 = ${b * b}$ donne $X = ${b}$ ou $X = -${b}$.`,
        correction: [`$${aff(1, -a)} = ${b}$ ou $${aff(1, -a)} = -${b}$`, `$x = ${a + b}$ ou $x = ${a - b}$`],
      };
    },
  },
  {
    name: 'coefficient',
    from: 2,
    make: (rng) => {
      const k = rng.int(2, 5);
      const r = rng.int(1, 8);
      return {
        prompt: `Résous l’équation $${k}x^2 = ${k * r * r}$. Donne les solutions séparées par « ; ».`,
        answer: { kind: 'set', values: [frac(r), frac(-r)] },
        hint: `Divise d’abord par $${k}$.`,
        correction: [`$x^2 = ${r * r}$`, `$x = ${r}$ ou $x = -${r}$`],
      };
    },
  },
];

const INEQUATION: Variant[] = [
  {
    name: 'plus-petit-entier',
    make: (rng, level) => {
      const a = level === 1 ? rng.int(2, 6) : rng.int(2, 9);
      const b = rng.int(-10, 10);
      const c = rng.int(-15, 25);
      // ax + b > c ⇔ x > (c - b)/a
      const bound = (c - b) / a;
      const n = Math.floor(bound) + 1;
      return {
        prompt: `Quel est le plus petit nombre entier solution de l’inéquation $${aff(a, b)} > ${c}$ ?`,
        answer: decimal(n),
        hint: 'Résous l’inéquation, puis cherche le premier entier qui convient.',
        correction: [`$${poly([a, 0])} > ${c - b}$, donc $x > ${fl(c - b, a)}$.`, `Le plus petit entier strictement supérieur à $${fl(c - b, a)}$ est $${n}$.`],
      };
    },
  },
  {
    name: 'tester',
    make: (rng, level) => {
      const a = level === 1 ? rng.int(1, 6) : rng.nonZero(-6, 6);
      const b = rng.int(-9, 9);
      const c = rng.int(-9, 15);
      const t = rng.int(-5, 6);
      const sign = rng.pick(['<', '\\leq', '>', '\\geq'] as const);
      const lhs = a * t + b;
      const ok = sign === '<' ? lhs < c : sign === '\\leq' ? lhs <= c : sign === '>' ? lhs > c : lhs >= c;
      return {
        prompt: `Le nombre $${t}$ est-il solution de l’inéquation $${aff(a, b)} ${sign} ${c}$ ?`,
        answer: ouiNon(ok),
        hint: 'Remplace $x$ par le nombre et compare.',
        correction: [`Pour $x = ${t}$ : $${a === 1 ? '' : a === -1 ? '-' : `${a} \\times `}${par(t)} ${sg(b)} = ${lhs}$.`, `$${lhs} ${sign} ${c}$ est ${ok ? 'vrai' : 'faux'} : $${t}$ ${ok ? 'est' : 'n’est pas'} solution.`],
      };
    },
  },
  {
    name: 'probleme-tarif',
    from: 2,
    make: (rng) => {
      const fixe = rng.int(10, 30);
      const p1 = rng.int(4, 8);
      const p2 = p1 + rng.int(2, 5);
      // Tarif A : fixe + p1 n ; tarif B : p2 n. A moins cher si fixe + p1 n < p2 n ⇔ n > fixe/(p2 - p1)
      const n = Math.floor(fixe / (p2 - p1)) + 1;
      return {
        prompt: `Une salle de sport propose deux tarifs : A, un abonnement de $${fixe}$ € puis $${p1}$ € par séance ; B, $${p2}$ € par séance sans abonnement. À partir de combien de séances le tarif A est-il strictement moins cher ?`,
        answer: decimal(n),
        hint: `Avec $n$ séances : tarif A $${fixe} + ${p1}n$, tarif B $${p2}n$. Résous $${fixe} + ${p1}n < ${p2}n$.`,
        correction: [`$${fixe} + ${p1}n < ${p2}n \\iff ${fixe} < ${p2 - p1}n \\iff n > ${fl(fixe, p2 - p1)}$`, `Le plus petit entier qui convient est $${n}$.`],
      };
    },
  },
];

const MISE_EN_EQUATION: Variant[] = [
  {
    name: 'ages-futurs',
    make: (rng, level) => {
      const k = rng.pick(level === 1 ? [2] : [2, 3]);
      let n: number;
      let f: number;
      do {
        n = rng.int(2, 15);
        f = rng.int(4, 12);
      } while (k * (f + n) - n - f < 22 || k * (f + n) - n - f > 40);
      const p = k * (f + n) - n;
      const who = prenom(rng);
      return {
        prompt: `${who} a $${f}$ ans et son père $${p}$ ans. Dans combien d’années le père aura-t-il exactement ${k === 2 ? 'le double' : 'le triple'} de l’âge de ${who} ?`,
        answer: decimal(n),
        hint: `Dans $x$ années : $${p} + x = ${k}(${f} + x)$.`,
        correction: [`$${p} + x = ${k}(${f} + x)$`, `$${p} + x = ${k * f} + ${k}x$, donc $${p - k * f} = ${k - 1 === 1 ? '' : k - 1}x$.`, `$x = ${n}$ : dans $${n}$ ans.`],
      };
    },
  },
  {
    name: 'rencontre',
    make: (rng, level) => {
      const v1 = rng.int(6, 12) * 10;
      const v2 = rng.int(5, 11) * 10;
      const tMin = rng.pick(level === 1 ? [60, 120, 30] : [30, 45, 60, 90, 75, 120]);
      const d = ((v1 + v2) * tMin) / 60;
      return {
        prompt: `Deux trains partent au même moment de deux villes distantes de $${dec(d)}$ km et roulent l’un vers l’autre, à $${v1}$ km/h et $${v2}$ km/h. Au bout de combien de minutes se croisent-ils ?`,
        answer: decimal(tMin),
        hint: 'Chaque heure, la distance qui les sépare diminue de la somme des deux vitesses.',
        correction: [`En $t$ heures, ils parcourent ensemble $(${v1} + ${v2})t = ${v1 + v2}t$ km.`, `$${v1 + v2}t = ${dec(d)}$, donc $t = ${dec(tMin / 60)}$ h, soit $${tMin}$ min.`],
      };
    },
  },
  {
    name: 'poursuite',
    from: 2,
    make: (rng) => {
      const v2 = rng.int(4, 6);
      const v1 = rng.pick([15, 18, 20, 24]);
      const tMin = rng.pick([10, 15, 20, 30, 40]);
      const avance = ((v1 - v2) * tMin) / 60;
      return {
        prompt: `Un piéton marche à $${v2}$ km/h. Un cycliste, parti du même point, le suit à $${v1}$ km/h alors que le piéton a déjà $${dec(avance)}$ km d’avance. Au bout de combien de minutes le cycliste rattrape-t-il le piéton ?`,
        answer: decimal(tMin),
        hint: 'Le cycliste rattrape chaque heure la différence des deux vitesses.',
        correction: [`L’écart diminue de $${v1} - ${v2} = ${v1 - v2}$ km par heure.`, `$${v1 - v2}t = ${dec(avance)}$, donc $t = ${dec(tMin / 60)}$ h $= ${tMin}$ min.`],
      };
    },
  },
  {
    name: 'livres',
    from: 2,
    make: (rng) => {
      const e1 = rng.pick([2, 3]);
      const e2 = e1 + rng.int(1, 3);
      const x = rng.int(5, 30);
      const y = rng.int(5, 30);
      const N = x + y;
      const L = e1 * x + e2 * y;
      return {
        prompt: `Une étagère porte $${N}$ livres : des minces de $${e1}$ cm d’épaisseur et des épais de $${e2}$ cm. Ils occupent $${L}$ cm. Combien y a-t-il de livres épais ?`,
        answer: decimal(y),
        hint: `Appelle $y$ le nombre de livres épais : il y a $${N} - y$ livres minces.`,
        correction: [`$${e1}(${N} - y) + ${e2}y = ${L}$`, `$${e1 * N} + ${e2 - e1}y = ${L}$, donc $${e2 - e1 === 1 ? '' : e2 - e1}y = ${L - e1 * N}$.`, `$y = ${y}$ livres épais (et $${x}$ minces).`],
      };
    },
  },
  {
    name: 'consommations',
    from: 2,
    make: (rng) => {
      const choc = rng.int(10, 30) / 10;
      const ecart = rng.pick([0.5, 1, 0.2, 0.8]);
      const soda = Math.round((choc + ecart) * 10) / 10;
      const [ns, nc] = [rng.int(2, 4), rng.int(2, 5)];
      const total = Math.round((ns * soda + nc * choc) * 100) / 100;
      return {
        prompt: `$${ns}$ sodas et $${nc}$ chocolats chauds coûtent $${euros(total)}$ €. Un soda coûte $${euros(ecart)}$ € de plus qu’un chocolat. Quel est le prix d’un chocolat, en € ?`,
        answer: decimal(choc),
        hint: `Appelle $x$ le prix d’un chocolat : un soda coûte $x + ${euros(ecart)}$.`,
        correction: [`$${ns}(x + ${euros(ecart)}) + ${nc}x = ${euros(total)}$`, `$${ns + nc}x + ${euros(ns * ecart)} = ${euros(total)}$, donc $${ns + nc}x = ${euros(total - ns * ecart)}$.`, `$x = ${euros(choc)}$ €`],
      };
    },
  },
  {
    name: 'banquet',
    from: 3,
    make: (rng) => {
      // n convives, prix p ; avec g invités gratuits, chacun des n - g autres paie q : n p = (n - g) q.
      const cases = [
        [10, 2, 40, 50],
        [12, 3, 30, 40],
        [15, 3, 40, 50],
        [20, 4, 24, 30],
        [18, 3, 25, 30],
        [16, 4, 30, 40],
      ];
      const [n, g, p, q] = rng.pick(cases);
      return {
        prompt: `Un groupe réserve un repas : au départ chacun devait payer $${p}$ €. Finalement $${g}$ personnes sont invitées et ne paient pas, et chacun des autres paie $${q}$ € pour la même facture. Combien de personnes participent au repas ?`,
        answer: decimal(n),
        hint: `Avec $n$ personnes : la facture vaut $${p}n$, et aussi $${q}(n - ${g})$.`,
        correction: [`$${p}n = ${q}(n - ${g})$`, `$${p}n = ${q}n - ${q * g}$, donc $${q - p}n = ${q * g}$.`, `$n = ${n}$ personnes.`],
      };
    },
  },
];

export const ALGEBRE_3E: Record<string, Variant[]> = {
  '3e-developper-simple': DEV_SIMPLE,
  '3e-developper-double': DEV_DOUBLE,
  '3e-identites': IDENTITES,
  '3e-factoriser': FACTORISER,
  '3e-factoriser-identite': FACTO_IDENTITE,
  '3e-programme-calcul': PROGRAMME,
  '3e-equation': EQUATION,
  '3e-produit-nul': PRODUIT_NUL,
  '3e-equation-carre': CARRE,
  '3e-inequation': INEQUATION,
  '3e-mise-en-equation': MISE_EN_EQUATION,
};
