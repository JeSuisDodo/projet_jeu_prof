import { factorize, isPrime } from '../../seconde/arithmetique';
import { choiceTex, dec, decimal, fl, fraction, gcd, lcm, makeChoice, ouiNon, prenom, vraiFaux } from '../../college';
import { frac } from '../../fraction';
import type { Answer } from '../../types';
import type { Variant } from '../../variantes';

/** 3e : nouvelles formes d'exercices pour l'arithmétique et les puissances (idées des feuilles de bibmath). */

const factorLatex = (f: [number, number][]) => f.map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join(' \\times ');
const digitSum = (n: number) => String(n).split('').reduce((s, c) => s + Number(c), 0);
const pair = (a: number, b: number, labels: [string, string]): Answer => ({ kind: 'pair', values: [frac(a), frac(b)], labels });

const AFFIRMATIONS_DIVISIBILITE: [string, boolean, string][] = [
  ['Tout nombre divisible par $9$ est divisible par $3$.', true, 'Si $n = 9k$, alors $n = 3 \\times (3k)$.'],
  ['Tout nombre divisible par $3$ est divisible par $9$.', false, 'Contre-exemple : $12$ est divisible par $3$ mais pas par $9$.'],
  ['Un nombre divisible par $2$ et par $3$ est divisible par $6$.', true, '$2$ et $3$ n’ont pas de diviseur commun autre que $1$, donc le nombre est divisible par $2 \\times 3 = 6$.'],
  ['Un nombre divisible par $4$ et par $6$ est divisible par $24$.', false, 'Contre-exemple : $12$ est divisible par $4$ et par $6$, mais pas par $24$.'],
  ['Un nombre qui se termine par $5$ est divisible par $5$.', true, 'Critère : chiffre des unités $0$ ou $5$.'],
  ['Un nombre pair est divisible par $4$.', false, 'Contre-exemple : $6$ est pair mais n’est pas divisible par $4$.'],
  ['La somme de deux nombres impairs est paire.', true, '$(2a + 1) + (2b + 1) = 2(a + b + 1)$.'],
  ['Le produit de deux nombres consécutifs est pair.', true, 'L’un des deux est pair, donc le produit aussi.'],
  ['La somme de trois nombres consécutifs est divisible par $3$.', true, '$n + (n + 1) + (n + 2) = 3(n + 1)$.'],
  ['La somme de deux nombres consécutifs est paire.', false, '$n + (n + 1) = 2n + 1$ est impair.'],
  ['Si un nombre est divisible par $10$, il est divisible par $5$.', true, '$10 = 2 \\times 5$.'],
  ['Un nombre dont la somme des chiffres vaut $12$ est divisible par $9$.', false, '$12$ n’est pas divisible par $9$ (exemple : $48$).'],
];

const DIVISIBILITE: Variant[] = [
  {
    name: 'chiffre-manquant',
    make: (rng, level) => {
      const d = level === 1 ? 3 : rng.pick([3, 9]);
      const digits = [rng.int(1, 9), rng.int(0, 9), rng.int(0, 9), ...(level === 3 ? [rng.int(0, 9)] : [])];
      const pos = rng.int(1, digits.length - 1);
      const s = digits.reduce((acc, c, i) => (i === pos ? acc : acc + c), 0);
      const ok = Array.from({ length: 10 }, (_, c) => c).filter((c) => (s + c) % d === 0);
      const shown = digits.map((c, i) => (i === pos ? '\\star' : String(c))).join('');
      return {
        prompt: `Par quels chiffres peut-on remplacer $\\star$ dans $${shown}$ pour obtenir un nombre divisible par $${d}$ ? Donne-les tous, séparés par « ; ».`,
        answer: { kind: 'set', values: ok.map((c) => ({ n: c, d: 1 })) },
        hint: `Un nombre est divisible par $${d}$ si la somme de ses chiffres l’est.`,
        correction: [`Sans $\\star$, la somme des chiffres vaut $${s}$.`, `Il faut que $${s} + \\star$ soit un multiple de $${d}$ : $\\star \\in \\{${ok.join('\\,;\\,')}\\}$.`],
      };
    },
  },
  {
    name: 'vrai-faux',
    make: (rng) => {
      const [text, ok, why] = rng.pick(AFFIRMATIONS_DIVISIBILITE);
      return { prompt: `Vrai ou faux ? ${text}`, answer: vraiFaux(ok), hint: 'Cherche un contre-exemple, ou écris le nombre sous la forme $k \\times n$.', correction: [`${ok ? 'Vrai' : 'Faux'}. ${why}`] };
    },
  },
  {
    name: 'diviseurs-communs',
    from: 2,
    make: (rng) => {
      const n = rng.int(10, 60) * 6;
      const tests = [2, 3, 4, 5, 9];
      const yes = tests.filter((d) => n % d === 0);
      return {
        prompt: `Parmi $2$, $3$, $4$, $5$ et $9$, par lesquels le nombre $${n}$ est-il divisible ? Donne-les tous, séparés par « ; ».`,
        answer: { kind: 'set', values: yes.map((d) => ({ n: d, d: 1 })) },
        hint: 'Teste chaque critère : chiffre des unités, deux derniers chiffres pour $4$, somme des chiffres pour $3$ et $9$.',
        correction: [`Somme des chiffres : $${digitSum(n)}$ ; deux derniers chiffres : $${String(n).slice(-2)}$.`, `$${n}$ est divisible par $${yes.join('$, $')}$.`],
      };
    },
  },
];

const PREMIER: Variant[] = [
  {
    name: 'compter',
    make: (rng, level) => {
      const a = rng.int(1, level === 1 ? 20 : level === 2 ? 50 : 90);
      const b = a + rng.int(8, 16);
      const list = Array.from({ length: b - a + 1 }, (_, i) => a + i).filter(isPrime);
      return {
        prompt: `Combien y a-t-il de nombres premiers compris entre $${a}$ et $${b}$ (inclus) ?`,
        answer: decimal(list.length),
        hint: 'Un nombre premier a exactement deux diviseurs : $1$ et lui-même. Élimine les pairs, les multiples de $3$, de $5$, de $7$…',
        correction: [list.length ? `Les nombres premiers entre $${a}$ et $${b}$ sont $${list.join('$, $')}$.` : `Il n’y en a aucun.`, `Il y en a $${list.length}$.`],
      };
    },
  },
  {
    name: 'plus-petit-diviseur',
    make: (rng, level) => {
      const p = rng.pick(level === 1 ? [2, 3, 5] : [3, 7, 11, 13]);
      const q = rng.pick([7, 11, 13, 17, 19].filter((x) => x >= p));
      const n = p * q;
      return {
        prompt: `Le nombre $${n}$ n’est pas premier. Quel est son plus petit diviseur premier ?`,
        answer: decimal(p),
        hint: 'Essaie de diviser par $2$, puis $3$, $5$, $7$, $11$… dans l’ordre.',
        correction: [`$${n} = ${p} \\times ${q}$ et aucun nombre premier plus petit que $${p}$ ne divise $${n}$.`, `Son plus petit diviseur premier est $${p}$.`],
      };
    },
  },
  {
    name: 'piege-impair',
    from: 2,
    make: (rng) => {
      const n = rng.pick([51, 57, 87, 91, 111, 119, 133, 143, 161, 187, 203, 209, 221]);
      const f = factorize(n);
      return {
        prompt: `${prenom(rng)} affirme : « $${n}$ est impair et ne se termine pas par $5$, donc il est premier. » Ce raisonnement est-il juste ?`,
        answer: ouiNon(false),
        hint: 'Être impair ne suffit pas : teste les divisions par $3$, $7$, $11$, $13$…',
        correction: [`$${n} = ${factorLatex(f)}$, donc $${n}$ n’est pas premier : le raisonnement est faux.`],
      };
    },
  },
];

const DECOMPOSITION: Variant[] = [
  {
    name: 'recomposer',
    make: (rng, level) => {
      const e = [rng.int(level === 1 ? 1 : 0, 3), rng.int(level === 1 ? 0 : 1, 2), rng.int(0, level === 3 ? 2 : 1)];
      const f: [number, number][] = ([[2, e[0]], [3, e[1]], [5, e[2]]] as [number, number][]).filter(([, x]) => x > 0);
      if (f.length === 0) f.push([7, 1]);
      const n = f.reduce((acc, [p, x]) => acc * p ** x, 1);
      return {
        prompt: `Quel nombre a pour décomposition en facteurs premiers $${factorLatex(f)}$ ?`,
        answer: decimal(n),
        hint: 'Calcule chaque puissance, puis multiplie.',
        correction: [`$${factorLatex(f)} = ${f.map(([p, x]) => p ** x).join(' \\times ')} = ${n}$`],
      };
    },
  },
  {
    name: 'nombre-diviseurs',
    from: 2,
    make: (rng) => {
      const e = [rng.int(1, 4), rng.int(0, 2), rng.int(0, 2)];
      const f: [number, number][] = ([[2, e[0]], [3, e[1]], [5, e[2]]] as [number, number][]).filter(([, x]) => x > 0);
      const n = f.reduce((acc, [p, x]) => acc * p ** x, 1);
      const count = f.reduce((acc, [, x]) => acc * (x + 1), 1);
      return {
        prompt: `On sait que $${n} = ${factorLatex(f)}$. Combien le nombre $${n}$ a-t-il de diviseurs ?`,
        answer: decimal(count),
        hint: 'Un diviseur s’écrit en prenant chaque facteur premier avec un exposant compris entre $0$ et son exposant dans la décomposition.',
        correction: [`Pour chaque facteur premier, l’exposant peut prendre ${f.map(([p, x]) => `$${x + 1}$ valeurs ($${p}$)`).join(', ')}.`, `Nombre de diviseurs : $${f.map(([, x]) => x + 1).join(' \\times ')} = ${count}$.`],
      };
    },
  },
  {
    name: 'carre-parfait',
    from: 3,
    make: (rng) => {
      const e = [rng.int(1, 4), rng.int(0, 3), rng.int(0, 2)];
      const f: [number, number][] = ([[2, e[0]], [3, e[1]], [5, e[2]]] as [number, number][]).filter(([, x]) => x > 0);
      const n = f.reduce((acc, [p, x]) => acc * p ** x, 1);
      const odd = f.filter(([, x]) => x % 2 === 1).map(([p]) => p);
      const k = odd.reduce((a, p) => a * p, 1);
      return {
        prompt: `Par quel plus petit entier naturel non nul faut-il multiplier $${n}$ pour obtenir le carré d’un entier ?`,
        answer: decimal(k),
        hint: 'Un carré parfait a tous les exposants pairs dans sa décomposition en facteurs premiers.',
        correction: [`$${n} = ${factorLatex(f)}$.`, odd.length ? `Les exposants impairs portent sur $${odd.join('$, $')}$ : on multiplie par $${odd.join(' \\times ')} = ${k}$.` : `Tous les exposants sont déjà pairs : on multiplie par $1$.`, `$${n} \\times ${k} = ${n * k} = ${Math.round(Math.sqrt(n * k))}^2$.`],
      };
    },
  },
];

const IRREDUCTIBLE: Variant[] = [
  {
    name: 'est-irreductible',
    make: (rng, level) => {
      const yes = rng.next() < 0.5;
      let n: number;
      let d: number;
      do {
        n = rng.int(2, level === 1 ? 30 : 99);
        d = rng.int(n + 1, level === 1 ? 60 : 150);
      } while ((gcd(n, d) === 1) !== yes);
      const g = gcd(n, d);
      return {
        prompt: `La fraction $\\frac{${n}}{${d}}$ est-elle irréductible ?`,
        answer: ouiNon(yes),
        hint: 'Une fraction est irréductible quand son numérateur et son dénominateur n’ont que $1$ comme diviseur commun.',
        correction: [yes ? `$${n}$ et $${d}$ n’ont pas de diviseur commun autre que $1$ : la fraction est irréductible.` : `$${n}$ et $${d}$ sont divisibles par $${g}$ : $\\frac{${n}}{${d}} = ${fl(n, d)}$, elle n’est pas irréductible.`],
      };
    },
  },
  {
    name: 'pgcd',
    make: (rng, level) => {
      const g = rng.int(2, level === 1 ? 9 : 25);
      let a: number;
      let b: number;
      do {
        a = rng.int(2, 12);
        b = rng.int(2, 12);
      } while (a === b || gcd(a, b) !== 1);
      return {
        prompt: `Quel est le plus grand diviseur commun de $${a * g}$ et $${b * g}$ ?`,
        answer: decimal(g),
        hint: 'Décompose les deux nombres en facteurs premiers et garde les facteurs communs, ou utilise l’algorithme d’Euclide.',
        correction: [`$${a * g} = ${g} \\times ${a}$ et $${b * g} = ${g} \\times ${b}$, où $${a}$ et $${b}$ n’ont pas de diviseur commun autre que $1$.`, `Le plus grand diviseur commun est $${g}$.`],
      };
    },
  },
  {
    name: 'euclide',
    from: 3,
    make: (rng) => {
      const g = rng.int(3, 30);
      let a: number;
      let b: number;
      do {
        a = rng.int(10, 40);
        b = rng.int(3, a - 1);
      } while (gcd(a, b) !== 1);
      const steps: string[] = [];
      let x = a * g;
      let y = b * g;
      while (y) {
        steps.push(`$${x} = ${y} \\times ${Math.floor(x / y)} + ${x % y}$`);
        [x, y] = [y, x % y];
      }
      return {
        prompt: `Avec l’algorithme d’Euclide, calcule le plus grand diviseur commun de $${a * g}$ et $${b * g}$.`,
        answer: decimal(g),
        hint: 'Divise le plus grand par le plus petit, puis recommence avec le diviseur et le reste, jusqu’à un reste nul.',
        correction: [...steps, `Le dernier reste non nul est $${g}$.`],
      };
    },
  },
];

const PARTAGE: Variant[] = [
  {
    name: 'carrelage',
    make: (rng, level) => {
      const g = rng.pick(level === 1 ? [5, 10, 12] : [6, 8, 12, 15, 18, 24]);
      let a: number;
      let b: number;
      do {
        a = rng.int(3, 12);
        b = rng.int(2, a - 1);
      } while (gcd(a, b) !== 1);
      return {
        prompt: `On veut carreler un sol rectangulaire de $${a * g}$ cm sur $${b * g}$ cm avec des carreaux carrés identiques, sans découpe, les plus grands possible. Quel est le côté d’un carreau, en cm ?`,
        answer: decimal(g),
        hint: 'Le côté doit diviser les deux dimensions : c’est leur plus grand diviseur commun.',
        correction: [`$${a * g} = ${g} \\times ${a}$ et $${b * g} = ${g} \\times ${b}$, avec $${a}$ et $${b}$ sans diviseur commun autre que $1$.`, `Le côté est $${g}$ cm (il faudra $${a} \\times ${b} = ${a * b}$ carreaux).`],
      };
    },
  },
  {
    name: 'contenu-lot',
    from: 2,
    make: (rng) => {
      const g = rng.int(4, 18);
      let a: number;
      let b: number;
      do {
        a = rng.int(2, 9);
        b = rng.int(2, 9);
      } while (a === b || gcd(a, b) !== 1);
      const who = prenom(rng);
      return {
        prompt: `${who} a $${a * g}$ billes rouges et $${b * g}$ billes bleues. On fait le plus grand nombre possible de sachets identiques en utilisant toutes les billes. Combien de billes rouges y a-t-il dans chaque sachet ?`,
        answer: decimal(a),
        hint: 'Le nombre de sachets est le plus grand diviseur commun des deux nombres de billes.',
        correction: [`Nombre de sachets : plus grand diviseur commun de $${a * g}$ et $${b * g}$, soit $${g}$.`, `Billes rouges par sachet : $${a * g} \\div ${g} = ${a}$.`],
      };
    },
  },
];

const MULTIPLES: Variant[] = [
  {
    name: 'engrenage',
    make: (rng, level) => {
      let a: number;
      let b: number;
      do {
        a = rng.int(level === 1 ? 4 : 8, level === 1 ? 12 : 40);
        b = rng.int(level === 1 ? 4 : 8, level === 1 ? 12 : 40);
      } while (a === b || gcd(a, b) === 1 || gcd(a, b) === Math.min(a, b));
      const m = lcm(a, b);
      return {
        prompt: `Deux roues dentées s’engrènent : la première a $${a}$ dents, la seconde $${b}$. Combien de tours doit faire la première roue pour que les deux roues reviennent pour la première fois à leur position de départ ?`,
        answer: decimal(m / a),
        hint: 'Le nombre de dents passées doit être un multiple commun de $' + a + '$ et de $' + b + '$ : prends le plus petit.',
        correction: [`Plus petit multiple commun de $${a}$ et $${b}$ : $${m}$ dents.`, `La première roue fait $${m} \\div ${a} = ${m / a}$ tours.`],
      };
    },
  },
  {
    name: 'piles',
    make: (rng, level) => {
      let a: number;
      let b: number;
      do {
        a = rng.int(2, level === 1 ? 10 : 25);
        b = rng.int(2, level === 1 ? 10 : 25);
      } while (a === b || (level >= 2 && gcd(a, b) === 1));
      const m = lcm(a, b);
      return {
        prompt: `On empile des cubes de $${a}$ cm d’un côté et des cubes de $${b}$ cm de l’autre. À partir de quelle hauteur, en cm, les deux piles peuvent-elles avoir exactement la même hauteur (hauteur non nulle) ?`,
        answer: decimal(m),
        hint: 'La hauteur commune doit être un multiple de chacune des deux arêtes.',
        correction: [`Multiples de $${a}$ : $${[1, 2, 3, 4].map((k) => a * k).join('$, $')}$…`, `Le plus petit multiple commun de $${a}$ et $${b}$ est $${m}$ : hauteur $${m}$ cm.`],
      };
    },
  },
];

const PUISSANCE_CALCUL: Variant[] = [
  {
    name: 'puissance-de-dix',
    make: (rng, level) => {
      const n = level === 1 ? rng.int(1, 6) : rng.nonZero(-6, 6);
      const written = n >= 0 ? `1${'0'.repeat(n)}`.replace(/(\d)(?=(\d{3})+$)/g, '$1\\,') : `0{,}${'0'.repeat(-n - 1)}1`;
      return {
        prompt: `On écrit $${written} = 10^{n}$. Quelle est la valeur de $n$ ?`,
        answer: decimal(n),
        hint: n >= 0 ? 'Compte le nombre de zéros après le $1$.' : 'Compte la position du chiffre $1$ après la virgule.',
        correction: [`$${written} = 10^{${n}}$, donc $n = ${n}$.`],
      };
    },
  },
  {
    name: 'signe',
    make: (rng, level) => {
      const a = rng.int(2, level === 1 ? 3 : 5);
      const n = rng.int(2, 4);
      const inside = rng.next() < 0.5;
      const k = inside ? n + rng.int(0, 1) : n;
      const expr = inside ? `(-${a})^{${k}}` : `-${a}^{${k}}`;
      const v = inside ? (-a) ** k : -(a ** k);
      const factors = Array.from({ length: k }, () => (inside ? `(-${a})` : String(a))).join(' \\times ');
      return {
        prompt: `Calcule $${expr}$.`,
        answer: decimal(v),
        hint: 'Attention : $(-a)^n$ et $-a^n$ ne sont pas la même chose. L’exposant ne porte que sur ce qui est juste devant lui.',
        correction: [inside ? `$${expr} = ${factors} = ${v}$` : `$${expr} = -(${factors}) = ${v}$`],
      };
    },
  },
  {
    name: 'comparer',
    from: 2,
    make: (rng) => {
      const pairs: [string, number][] = rng.shuffle([
        ['2^{10}', 1024],
        ['10^{3}', 1000],
        ['3^{6}', 729],
        ['5^{4}', 625],
        ['4^{5}', 1024],
        ['9^{3}', 729],
        ['6^{4}', 1296],
        ['11^{3}', 1331],
        ['7^{3}', 343],
        ['2^{9}', 512],
      ]);
      // On garde quatre valeurs distinctes.
      const kept: [string, number][] = [];
      for (const p of pairs) if (!kept.some((k) => k[1] === p[1]) && kept.length < 4) kept.push(p);
      const best = kept.reduce((m, p) => (p[1] > m[1] ? p : m));
      return {
        prompt: 'Lequel de ces nombres est le plus grand ?',
        answer: makeChoice(rng, `$${best[0]}$`, kept.filter((k) => k !== best).map((k) => `$${k[0]}$`), () => '$1$'),
        hint: 'Calcule chaque puissance : l’exposant le plus grand ne donne pas forcément le plus grand nombre.',
        correction: [kept.map(([e, v]) => `$${e} = ${v}$`).join(', '), `Le plus grand est $${best[0]}$.`],
      };
    },
  },
];

const REGLES: Variant[] = [
  {
    name: 'erreur-classique',
    make: (rng, level) => {
      const a = rng.int(2, level === 1 ? 5 : 9);
      const m = rng.int(2, 6);
      const n = rng.int(2, 6);
      const op = rng.pick(['produit', 'puissance'] as const);
      const good = op === 'produit' ? `${a}^{${m + n}}` : `${a}^{${m * n}}`;
      const decoys = op === 'produit' ? [`${a}^{${m * n}}`, `${a * a}^{${m + n}}`, `${a * a}^{${m * n}}`, `${2 * a}^{${m + n}}`] : [`${a}^{${m + n}}`, `${a}^{${m ** n}}`, `${a * m}^{${n}}`];
      const expr = op === 'produit' ? `${a}^{${m}} \\times ${a}^{${n}}` : `(${a}^{${m}})^{${n}}`;
      return {
        prompt: `À quoi est égal $${expr}$ ?`,
        answer: choiceTex(rng, good, decoys, () => `${a}^{${m + n + rng.int(1, 3)}}`),
        hint: op === 'produit' ? '$a^m \\times a^n = a^{m+n}$ : on ajoute les exposants.' : '$(a^m)^n = a^{m \\times n}$ : on multiplie les exposants.',
        correction: [op === 'produit' ? `$${expr} = ${a}^{${m} + ${n}} = ${good}$` : `$${expr} = ${a}^{${m} \\times ${n}} = ${good}$`],
      };
    },
  },
  {
    name: 'lettre',
    from: 2,
    make: (rng) => {
      const p = rng.int(2, 8);
      const q = rng.int(2, 6);
      const r = rng.int(1, p + q - 1);
      const n = p + q - r;
      const v = rng.pick(['a', 'x', 'y']);
      return {
        prompt: `Pour $${v} \\neq 0$, on écrit $\\frac{${v}^{${p}} \\times ${v}^{${q}}}{${v}^{${r}}} = ${v}^{n}$. Que vaut $n$ ?`,
        answer: decimal(n),
        hint: 'Au numérateur, on ajoute les exposants ; pour un quotient, on les soustrait.',
        correction: [`$${v}^{${p}} \\times ${v}^{${q}} = ${v}^{${p + q}}$`, `$\\frac{${v}^{${p + q}}}{${v}^{${r}}} = ${v}^{${p + q} - ${r}} = ${v}^{${n}}$`, `$n = ${n}$`],
      };
    },
  },
];

const NOTATION: Variant[] = [
  {
    name: 'produit',
    from: 2,
    make: (rng) => {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const m = rng.nonZero(-6, 8);
      const n = rng.nonZero(-6, 8);
      const prod = a * b;
      const big = prod >= 10;
      const mant = big ? prod / 10 : prod;
      const exp = m + n + (big ? 1 : 0);
      return {
        prompt: `Donne la notation scientifique $a \\times 10^{p}$ de $(${a} \\times 10^{${m}}) \\times (${b} \\times 10^{${n}})$ : quelles sont les valeurs de $a$ et $p$ ?`,
        answer: { kind: 'pair', values: [frac(Math.round(mant * 10), 10), frac(exp)], labels: ['a', 'p'] },
        hint: 'Multiplie les nombres entre eux et les puissances de $10$ entre elles, puis vérifie que $1 \\leq a < 10$.',
        correction: [`$${a} \\times ${b} = ${prod}$ et $10^{${m}} \\times 10^{${n}} = 10^{${m + n}}$.`, big ? `$${prod} \\times 10^{${m + n}} = ${dec(mant)} \\times 10^{${exp}}$` : `$${prod} \\times 10^{${m + n}}$ est déjà en notation scientifique.`],
      };
    },
  },
  {
    name: 'grandeur-reelle',
    make: (rng) => {
      const cases: [string, number, number][] = [
        ['La distance de la Terre au Soleil est d’environ $150\\,000\\,000$ km.', 1.5, 8],
        ['La vitesse de la lumière est d’environ $300\\,000\\,000$ m/s.', 3, 8],
        ['Un globule rouge mesure environ $0{,}000\\,007$ m de diamètre.', 7, -6],
        ['La Terre compte environ $8\\,000\\,000\\,000$ habitants.', 8, 9],
        ['Un cheveu a une épaisseur d’environ $0{,}000\\,08$ m.', 8, -5],
        ['La masse d’un grain de sable est d’environ $0{,}000\\,35$ g.', 3.5, -4],
        ['Le diamètre de la Lune est d’environ $3\\,500\\,000$ m.', 3.5, 6],
        ['Une bactérie mesure environ $0{,}000\\,002$ m.', 2, -6],
      ];
      const [text, a, p] = rng.pick(cases);
      return {
        prompt: `${text} Écris ce nombre en notation scientifique $a \\times 10^{p}$ : donne $a$ et $p$.`,
        answer: { kind: 'pair', values: [frac(Math.round(a * 10), 10), frac(p)], labels: ['a', 'p'] },
        hint: 'Déplace la virgule pour obtenir un nombre $a$ entre $1$ et $10$ ; $p$ compte les rangs de déplacement (négatif pour un petit nombre).',
        correction: [`Le nombre s’écrit $${dec(a)} \\times 10^{${p}}$.`],
      };
    },
  },
];

const RACINE: Variant[] = [
  {
    name: 'simplifier',
    from: 2,
    make: (rng, level) => {
      const b = rng.pick([2, 3, 5, 6, 7]);
      const a = rng.int(2, level === 2 ? 5 : 9);
      const n = a * a * b;
      return {
        prompt: `Écris $\\sqrt{${n}}$ sous la forme $a\\sqrt{b}$ avec $a$ et $b$ entiers et $b$ le plus petit possible : donne $a$ et $b$.`,
        answer: pair(a, b, ['a', 'b']),
        hint: 'Cherche le plus grand carré parfait qui divise le nombre sous la racine : $\\sqrt{k^2 \\times b} = k\\sqrt{b}$.',
        correction: [`$${n} = ${a * a} \\times ${b}$`, `$\\sqrt{${n}} = \\sqrt{${a * a}} \\times \\sqrt{${b}} = ${a}\\sqrt{${b}}$`],
      };
    },
  },
  {
    name: 'somme-radicaux',
    from: 3,
    make: (rng) => {
      const b = rng.pick([2, 3, 5]);
      const ks = [rng.int(1, 3), rng.int(2, 4), rng.int(1, 3)];
      const cs = [rng.nonZero(-3, 3), rng.nonZero(-3, 3), rng.nonZero(-3, 3)];
      const total = ks.reduce((s, k, i) => s + cs[i] * k, 0);
      const termTex = (c: number, k: number, first: boolean) => {
        const coef = Math.abs(c) === 1 ? '' : String(Math.abs(c));
        return `${c < 0 ? (first ? '-' : ' - ') : first ? '' : ' + '}${coef}\\sqrt{${k * k * b}}`;
      };
      const expr = cs.map((c, i) => termTex(c, ks[i], i === 0)).join('');
      return {
        prompt: `On écrit $${expr} = a\\sqrt{${b}}$. Que vaut $a$ ?`,
        answer: decimal(total),
        hint: `Simplifie chaque racine pour faire apparaître $\\sqrt{${b}}$.`,
        correction: [ks.map((k) => `$\\sqrt{${k * k * b}} = ${k === 1 ? '' : k}\\sqrt{${b}}$`).join(', '), `$${expr} = (${cs.map((c, i) => `${i ? (c < 0 ? ' - ' : ' + ') : c < 0 ? '-' : ''}${Math.abs(c) * ks[i]}`).join('')})\\sqrt{${b}} = ${total}\\sqrt{${b}}$`],
      };
    },
  },
  {
    name: 'produit-racines',
    make: (rng, level) => {
      const b = rng.pick([2, 3, 5, 6]);
      const m = rng.int(1, level === 1 ? 2 : 4);
      const n = rng.int(1, level === 1 ? 3 : 5);
      const x = m * m * b;
      const y = n * n * b;
      return {
        prompt: `Calcule $\\sqrt{${x}} \\times \\sqrt{${y}}$.`,
        answer: decimal(m * n * b),
        hint: '$\\sqrt{a} \\times \\sqrt{b} = \\sqrt{a \\times b}$ pour $a$ et $b$ positifs.',
        correction: [`$\\sqrt{${x}} \\times \\sqrt{${y}} = \\sqrt{${x * y}}$`, `$${x * y} = ${m * n * b}^2$, donc le résultat est $${m * n * b}$.`],
      };
    },
  },
  {
    name: 'vrai-faux',
    make: (rng) => {
      const a = rng.int(2, 9);
      const b = rng.int(2, 9);
      const items: [string, boolean, string][] = [
        [`\\sqrt{${a * a} + ${b * b}} = ${a + b}`, false, `$\\sqrt{${a * a + b * b}} \\neq ${a + b}$ car $${a + b}^2 = ${(a + b) ** 2}$.`],
        [`\\sqrt{${a * a} \\times ${b * b}} = ${a * b}`, true, `$\\sqrt{${a * a * b * b}} = ${a * b}$ car $${a * b}^2 = ${a * a * b * b}$.`],
        [`(\\sqrt{${a}})^2 = ${a}`, true, 'Par définition, $(\\sqrt{a})^2 = a$ pour $a \\geq 0$.'],
        [`\\sqrt{${a * a}} = ${2 * a}`, false, `$\\sqrt{${a * a}} = ${a}$, pas $${2 * a}$.`],
        [`\\sqrt{\\frac{${a * a}}{${b * b}}} = \\frac{${a}}{${b}}`, true, `$\\frac{${a}}{${b}}$ est positif et son carré vaut $\\frac{${a * a}}{${b * b}}$.`],
      ];
      const [s, ok, why] = rng.pick(items);
      return { prompt: `Vrai ou faux : $${s}$ ?`, answer: vraiFaux(ok), hint: 'La racine carrée d’un produit est le produit des racines, mais pas pour une somme.', correction: [`${ok ? 'Vrai' : 'Faux'} : ${why}`] };
    },
  },
];

const PRIORITES: Variant[] = [
  {
    name: 'moins-un',
    make: (rng, level) => {
      const exps = Array.from({ length: level === 1 ? 2 : 3 }, () => rng.int(1, 12));
      const signs = exps.map(() => rng.sign());
      const vals = exps.map((e, i) => signs[i] * (-1) ** e);
      const total = vals.reduce((s, v) => s + v, 0);
      const expr = exps.map((e, i) => `${i === 0 ? (signs[i] < 0 ? '-' : '') : signs[i] < 0 ? ' - ' : ' + '}(-1)^{${e}}`).join('');
      return {
        prompt: `Calcule $${expr}$.`,
        answer: decimal(total),
        hint: '$(-1)^n$ vaut $1$ si $n$ est pair et $-1$ si $n$ est impair.',
        correction: [exps.map((e) => `$(-1)^{${e}} = ${(-1) ** e}$`).join(', '), `Le résultat est $${total}$.`],
      };
    },
  },
  {
    name: 'quotient-puissances',
    from: 2,
    make: (rng) => {
      const [p1, p2] = [rng.int(3, 7), rng.int(1, 3)];
      const [q1, q2] = [rng.int(2, 4), rng.int(1, 2)];
      const v = 2 ** (p1 - p2) * 3 ** (q1 - q2);
      return {
        prompt: `Calcule $\\frac{2^{${p1}} \\times 3^{${q1}}}{2^{${p2}} \\times 3^{${q2}}}$.`,
        answer: decimal(v),
        hint: 'Simplifie séparément les puissances de $2$ et celles de $3$.',
        correction: [`$\\frac{2^{${p1}}}{2^{${p2}}} = 2^{${p1 - p2}}$ et $\\frac{3^{${q1}}}{3^{${q2}}} = 3^{${q1 - q2}}$.`, `$2^{${p1 - p2}} \\times 3^{${q1 - q2}} = ${2 ** (p1 - p2)} \\times ${3 ** (q1 - q2)} = ${v}$`],
      };
    },
  },
  {
    name: 'fraction-puissance',
    from: 3,
    make: (rng) => {
      const a = rng.int(2, 5);
      let b: number;
      do b = rng.int(2, 5);
      while (gcd(a, b) !== 1);
      const n = rng.int(2, 3);
      const c = rng.nonZero(-3, 3);
      // (a/b)^n + c
      const num0 = a ** n + c * b ** n;
      const den = b ** n;
      return {
        prompt: `Calcule $\\left(\\frac{${a}}{${b}}\\right)^{${n}} ${c < 0 ? '-' : '+'} ${Math.abs(c)}$ et donne le résultat sous forme de fraction irréductible.`,
        answer: fraction(num0, den),
        hint: '$\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}$, puis mets au même dénominateur.',
        correction: [`$\\left(\\frac{${a}}{${b}}\\right)^{${n}} = \\frac{${a ** n}}{${den}}$`, `$\\frac{${a ** n}}{${den}} ${c < 0 ? '-' : '+'} ${Math.abs(c)} = \\frac{${a ** n} ${c < 0 ? '-' : '+'} ${Math.abs(c) * den}}{${den}} = ${fl(num0, den)}$`],
      };
    },
  },
];

export const NOMBRES_3E: Record<string, Variant[]> = {
  '3e-divisibilite': DIVISIBILITE,
  '3e-premier': PREMIER,
  '3e-decomposition': DECOMPOSITION,
  '3e-irreductible': IRREDUCTIBLE,
  '3e-partage': PARTAGE,
  '3e-multiples-communs': MULTIPLES,
  '3e-puissance-calcul': PUISSANCE_CALCUL,
  '3e-regles-puissances': REGLES,
  '3e-notation-scientifique': NOTATION,
  '3e-racine-carree': RACINE,
  '3e-puissances-priorites': PRIORITES,
};
