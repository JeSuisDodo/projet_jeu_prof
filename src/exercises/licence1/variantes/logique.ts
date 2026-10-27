import { type Fait, type Variantes, qcmBanque, vraiFaux, vraiFauxBanque } from '../../licenceVariantes';
import { binom, gcd, num, poly, setTex, texChoice } from '../util';

/** Variantes du chapitre « Logique et ensembles » (inspirées des feuilles « Logique » et « Ensembles » de bibmath). */

const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

/** Implications du cours, pour la contraposée et la réciproque. */
const IMPLICATIONS: [string, string, string, string][] = [
  ['n^2 \\text{ est pair}', 'n \\text{ est pair}', 'n^2 \\text{ est impair}', 'n \\text{ est impair}'],
  ['x > 2', 'x^2 > 4', 'x \\leq 2', 'x^2 \\leq 4'],
  ['f \\text{ est dérivable}', 'f \\text{ est continue}', 'f \\text{ n’est pas dérivable}', 'f \\text{ n’est pas continue}'],
  ['(u_n) \\text{ converge}', '(u_n) \\text{ est bornée}', '(u_n) \\text{ diverge}', '(u_n) \\text{ n’est pas bornée}'],
  ['ab = 0', 'a = 0 \\text{ ou } b = 0', 'ab \\neq 0', 'a \\neq 0 \\text{ et } b \\neq 0'],
  ['x = y', 'f(x) = f(y)', 'x \\neq y', 'f(x) \\neq f(y)'],
];

const TAUTOLOGIES: Fait[] = [
  { s: '$(P \\Rightarrow Q) \\Leftrightarrow (\\lnot Q \\Rightarrow \\lnot P)$ est toujours vraie.', v: true, why: 'C’est le principe de contraposition.' },
  { s: '$(P \\Rightarrow Q) \\Leftrightarrow (Q \\Rightarrow P)$ est toujours vraie.', v: false, why: 'Avec $P$ faux et $Q$ vrai, $P \\Rightarrow Q$ est vraie mais $Q \\Rightarrow P$ est fausse : une implication n’équivaut pas à sa réciproque.' },
  { s: '$\\lnot(P \\land Q) \\Leftrightarrow (\\lnot P \\lor \\lnot Q)$ est toujours vraie.', v: true, why: 'C’est une loi de De Morgan.' },
  { s: '$\\lnot(P \\lor Q) \\Leftrightarrow (\\lnot P \\lor \\lnot Q)$ est toujours vraie.', v: false, why: 'La loi de De Morgan donne $\\lnot(P \\lor Q) \\Leftrightarrow (\\lnot P \\land \\lnot Q)$ : avec $P$ vrai et $Q$ faux, les deux membres diffèrent.' },
  { s: '$(P \\Rightarrow Q) \\Leftrightarrow (\\lnot P \\lor Q)$ est toujours vraie.', v: true, why: 'Une implication n’est fausse que si $P$ est vraie et $Q$ fausse, comme $\\lnot P \\lor Q$.' },
  { s: '$\\lnot(P \\Rightarrow Q) \\Leftrightarrow (\\lnot P \\Rightarrow \\lnot Q)$ est toujours vraie.', v: false, why: 'La négation de $P \\Rightarrow Q$ est $P \\land \\lnot Q$.' },
  { s: '$P \\lor \\lnot P$ est toujours vraie.', v: true, why: 'C’est le tiers exclu.' },
  { s: '$(P \\land (P \\Rightarrow Q)) \\Rightarrow Q$ est toujours vraie.', v: true, why: 'C’est le modus ponens.' },
  { s: '$(Q \\land (P \\Rightarrow Q)) \\Rightarrow P$ est toujours vraie.', v: false, why: 'Avec $P$ faux et $Q$ vrai, l’hypothèse est vraie et la conclusion fausse.' },
  { s: '$P \\land (Q \\lor R) \\Leftrightarrow (P \\land Q) \\lor (P \\land R)$ est toujours vraie.', v: true, why: '« et » est distributif sur « ou ».' },
];

const ENSEMBLES: Fait[] = [
  { s: '$A \\cup (B \\cap C) = (A \\cup B) \\cap (A \\cup C)$ pour tous ensembles $A, B, C$.', v: true, why: 'La réunion est distributive sur l’intersection.' },
  { s: '$A \\setminus (B \\cup C) = (A \\setminus B) \\cup (A \\setminus C)$ pour tous ensembles $A, B, C$.', v: false, why: 'On a $A \\setminus (B \\cup C) = (A \\setminus B) \\cap (A \\setminus C)$ ; avec $A = \\{1, 2\\}$, $B = \\{1\\}$, $C = \\{2\\}$ on trouve $\\varnothing$ d’un côté et $A$ de l’autre.' },
  { s: '$\\overline{A \\cap B} = \\overline{A} \\cup \\overline{B}$.', v: true, why: 'C’est une loi de De Morgan.' },
  { s: 'Si $A \\cup B = A \\cup C$, alors $B = C$.', v: false, why: 'Contre-exemple : $A = \\{1\\}$, $B = \\{1\\}$, $C = \\varnothing$.' },
  { s: 'Si $A \\cup B = A \\cup C$ et $A \\cap B = A \\cap C$, alors $B = C$.', v: true, why: 'Pour $x \\in B$ : si $x \\in A$, $x \\in A \\cap B = A \\cap C$ ; sinon $x \\in A \\cup C$ et $x \\notin A$, donc $x \\in C$. Par symétrie $B = C$.' },
  { s: '$\\mathcal{P}(A \\cup B) = \\mathcal{P}(A) \\cup \\mathcal{P}(B)$ pour tous ensembles $A, B$.', v: false, why: 'Avec $A = \\{1\\}$ et $B = \\{2\\}$, la partie $\\{1, 2\\}$ est dans $\\mathcal{P}(A \\cup B)$ mais ni dans $\\mathcal{P}(A)$ ni dans $\\mathcal{P}(B)$.' },
  { s: '$\\mathcal{P}(A \\cap B) = \\mathcal{P}(A) \\cap \\mathcal{P}(B)$ pour tous ensembles $A, B$.', v: true, why: 'Une partie est incluse dans $A \\cap B$ si et seulement si elle est incluse dans $A$ et dans $B$.' },
  { s: '$(A \\times B) \\cap (C \\times D) = (A \\cap C) \\times (B \\cap D)$.', v: true, why: '$(x, y)$ est dans les deux produits si et seulement si $x \\in A \\cap C$ et $y \\in B \\cap D$.' },
  { s: '$A \\subset B \\iff A \\cap B = A$.', v: true, why: 'Si $A \\subset B$, tout élément de $A$ est dans $A \\cap B$ ; réciproquement $A = A \\cap B \\subset B$.' },
  { s: '$A \\,\\Delta\\, B = \\varnothing \\iff A = B$.', v: true, why: '$A \\,\\Delta\\, B = (A \\setminus B) \\cup (B \\setminus A)$ est vide si et seulement si $A \\subset B$ et $B \\subset A$.' },
];

export const LOGIQUE_VARIANTES: Variantes = {
  'l1-negation-quantificateurs': [
    // Contraposée, réciproque ou négation d'une implication : erreur classique de confusion.
    (rng, level) => {
      const [p, q, np, nq] = rng.pick(IMPLICATIONS);
      const ask = rng.pick(level === 1 ? (['contraposée'] as const) : (['contraposée', 'réciproque', 'négation'] as const));
      const forms = {
        contraposée: `${nq} \\Rightarrow ${np}`,
        réciproque: `${q} \\Rightarrow ${p}`,
        négation: `${p} \\text{ et } ${nq}`,
      };
      const decoys = [`${np} \\Rightarrow ${nq}`, ...Object.values(forms)];
      return {
        prompt: `Quelle est la ${ask} de l’implication $${p} \\Rightarrow ${q}$ ?`,
        answer: texChoice(rng, forms[ask], decoys),
        hint: 'Contraposée de $P \\Rightarrow Q$ : $\\lnot Q \\Rightarrow \\lnot P$. Réciproque : $Q \\Rightarrow P$. Négation : $P$ et $\\lnot Q$.',
        correction: [`La ${ask} est $${forms[ask]}$.`, '$\\lnot P \\Rightarrow \\lnot Q$ (l’« inverse ») est une erreur fréquente : elle équivaut à la réciproque, pas à l’implication.'],
      };
    },
    // Vrai ou faux d'une phrase quantifiée concrète.
    (rng, level) => {
      const b = rng.int(-6, 6);
      const c = rng.int(-4, 9);
      const disc = b * b - 4 * c;
      const kind = rng.int(0, level === 1 ? 1 : 3);
      if (kind === 0)
        return vraiFaux(
          `$\\forall x \\in \\mathbb{R},\\ ${poly([1, b, c])} > 0$.`,
          disc < 0,
          [`Le discriminant vaut $${disc}$ : ${disc < 0 ? 'le trinôme ne s’annule pas et reste du signe de $1$, donc positif.' : 'le trinôme s’annule (ou change de signe), donc il n’est pas toujours strictement positif.'}`],
          'Un trinôme $x^2 + bx + c$ est toujours strictement positif si et seulement si son discriminant est négatif.',
        );
      if (kind === 1) {
        const k = rng.int(2, 60);
        const r = Math.round(Math.sqrt(k));
        return vraiFaux(`$\\exists n \\in \\mathbb{N},\\ n^2 = ${k}$.`, r * r === k, [r * r === k ? `$n = ${r}$ convient.` : `$${Math.floor(Math.sqrt(k))}^2 < ${k} < ${Math.floor(Math.sqrt(k)) + 1}^2$ : $${k}$ n’est pas un carré.`]);
      }
      const facts: [string, boolean, string][] = [
        ['$\\forall x \\in \\mathbb{R},\\ \\exists y \\in \\mathbb{R},\\ y > x$.', true, '$y = x + 1$ convient.'],
        ['$\\exists y \\in \\mathbb{R},\\ \\forall x \\in \\mathbb{R},\\ y > x$.', false, 'Un tel $y$ serait strictement plus grand que lui-même (prendre $x = y$).'],
        ['$\\forall n \\in \\mathbb{N},\\ \\exists m \\in \\mathbb{N},\\ m < n$.', false, 'Pour $n = 0$, aucun entier naturel n’est plus petit.'],
        ['$\\exists m \\in \\mathbb{N},\\ \\forall n \\in \\mathbb{N},\\ m \\leq n$.', true, '$m = 0$ convient.'],
        ['$\\forall x > 0,\\ \\exists n \\in \\mathbb{N},\\ n x > 1$.', true, 'C’est la propriété d’Archimède : $n = \\lfloor 1/x \\rfloor + 1$ convient.'],
        ['$\\exists x \\in \\mathbb{R},\\ \\forall y \\in \\mathbb{R},\\ xy = y$.', true, '$x = 1$ convient.'],
        ['$\\forall y \\in \\mathbb{R},\\ \\exists x \\in \\mathbb{R},\\ x^2 = y$.', false, 'Pour $y = -1$, aucun réel n’a un carré négatif.'],
      ];
      const [s, v, why] = rng.pick(facts);
      return vraiFaux(s, v, [why], 'L’ordre des quantificateurs compte : « $\\forall x, \\exists y$ » permet à $y$ de dépendre de $x$.');
    },
  ],
  'l1-table-verite': [
    (rng) => vraiFauxBanque(rng, TAUTOLOGIES, 'Teste les quatre valeurs possibles de $(P, Q)$.'),
    (rng) => qcmBanque(rng, TAUTOLOGIES, rng.next() < 0.5),
    // Nombre de lignes vraies d'une table de vérité.
    (rng, level) => {
      const forms: [string, (p: boolean, q: boolean, r: boolean) => boolean, number][] = [
        ['P \\Rightarrow Q', (p, q) => !p || q, 2],
        ['P \\Leftrightarrow Q', (p, q) => p === q, 2],
        ['P \\lor \\lnot Q', (p, q) => p || !q, 2],
        ['\\lnot P \\land Q', (p, q) => !p && q, 2],
        ['(P \\Rightarrow Q) \\land (Q \\Rightarrow P)', (p, q) => p === q, 2],
        ['(P \\land Q) \\Rightarrow R', (p, q, r) => !(p && q) || r, 3],
        ['P \\Rightarrow (Q \\lor R)', (p, q, r) => !p || q || r, 3],
        ['(P \\lor Q) \\land \\lnot R', (p, q, r) => (p || q) && !r, 3],
        ['(P \\Rightarrow Q) \\lor R', (p, q, r) => !p || q || r, 3],
        ['P \\Leftrightarrow (Q \\land R)', (p, q, r) => p === (q && r), 3],
      ];
      const pool = level === 1 ? forms.filter((f) => f[2] === 2) : forms;
      const [t, f, n] = rng.pick(pool);
      let count = 0;
      for (let i = 0; i < 2 ** n; i++) if (f(!!(i & 1), !!(i & 2), !!(i & 4))) count++;
      return {
        prompt: `Dans la table de vérité de $${t}$ (${2 ** n} lignes, une par choix des valeurs de ${n === 2 ? '$P$ et $Q$' : '$P$, $Q$ et $R$'}), combien de lignes donnent « vrai » ?`,
        answer: num(count),
        hint: 'Écris la table complète, ou compte les lignes fausses : il y en a souvent moins.',
        correction: [`On examine les $${2 ** n}$ lignes : $${count}$ donnent « vrai » et $${2 ** n - count}$ donnent « faux ».`],
      };
    },
  ],
  'l1-cardinal-union': [
    // Entiers divisibles par a ou par b (crible avec le ppcm).
    (rng, level) => {
      const pairs = level === 1 ? [[2, 3], [2, 5], [3, 5], [3, 4]] : [[4, 6], [6, 10], [6, 9], [4, 10], [3, 7], [5, 7], [6, 15]];
      const [a, b] = rng.pick(pairs);
      const N = level === 1 ? rng.pick([30, 50, 60, 100]) : rng.int(5, 30) * 10 + rng.int(0, 9);
      const m = lcm(a, b);
      const both = Math.floor(N / m);
      const union = Math.floor(N / a) + Math.floor(N / b) - both;
      const neither = rng.next() < 0.4;
      return {
        prompt: neither ? `Parmi les entiers de $1$ à $${N}$, combien ne sont divisibles ni par $${a}$ ni par $${b}$ ?` : `Parmi les entiers de $1$ à $${N}$, combien sont divisibles par $${a}$ ou par $${b}$ ?`,
        answer: num(neither ? N - union : union),
        hint: `Être divisible par $${a}$ et par $${b}$, c’est être divisible par leur ppcm $${m}$.`,
        correction: [
          `$\\lfloor ${N}/${a} \\rfloor = ${Math.floor(N / a)}$, $\\lfloor ${N}/${b} \\rfloor = ${Math.floor(N / b)}$, $\\lfloor ${N}/${m} \\rfloor = ${both}$.`,
          `Divisibles par l’un ou l’autre : $${Math.floor(N / a)} + ${Math.floor(N / b)} - ${both} = ${union}$.`,
          ...(neither ? [`Ni l’un ni l’autre : $${N} - ${union} = ${N - union}$.`] : []),
        ],
      };
    },
    // Complémentaire dans un ensemble de référence.
    (rng) => {
      const n = rng.int(25, 40);
      const a = rng.int(8, 18);
      const b = rng.int(8, 18);
      const inter = rng.int(2, Math.min(a, b) - 2);
      const out = n - (a + b - inter);
      return {
        prompt: `Une classe de $${n}$ élèves : $${a}$ jouent d’un instrument, $${b}$ font du sport et $${inter}$ font les deux. Combien d’élèves ne font ni l’un ni l’autre ?`,
        answer: num(out),
        hint: '$|\\overline{A} \\cap \\overline{B}| = |E| - |A \\cup B|$.',
        correction: [`$|A \\cup B| = ${a} + ${b} - ${inter} = ${a + b - inter}$`, `$${n} - ${a + b - inter} = ${out}$`],
      };
    },
    // Question inverse : retrouver |A ∩ B| à partir de |A ∪ B|, puis |A \ B|.
    (rng) => {
      const a = rng.int(10, 30);
      const b = rng.int(10, 30);
      const inter = rng.int(1, Math.min(a, b) - 1);
      return {
        prompt: `$|A| = ${a}$, $|B| = ${b}$ et $|A \\cup B| = ${a + b - inter}$. Combien d’éléments a $A \\setminus B$ ?`,
        answer: num(a - inter),
        hint: 'Trouve d’abord $|A \\cap B|$, puis utilise $|A \\setminus B| = |A| - |A \\cap B|$.',
        correction: [`$|A \\cap B| = ${a} + ${b} - ${a + b - inter} = ${inter}$`, `$|A \\setminus B| = ${a} - ${inter} = ${a - inter}$`],
      };
    },
  ],
  'l1-parties': [
    (rng, level) => {
      const n = rng.int(3, level === 1 ? 6 : 9);
      const kinds = [
        { q: 'contiennent l’élément $1$', v: 2 ** (n - 1), why: `On choisit librement les $${n - 1}$ autres éléments : $2^{${n - 1}}$.` },
        { q: 'sont non vides', v: 2 ** n - 1, why: `$2^{${n}} - 1$ : on retire la partie vide.` },
        { q: 'ne contiennent ni $1$ ni $2$', v: 2 ** (n - 2), why: `Ce sont les parties de $\\{3, \\dots, ${n}\\}$ : $2^{${n - 2}}$.` },
        { q: 'ont au plus $2$ éléments', v: 1 + n + binom(n, 2), why: `$\\binom{${n}}{0} + \\binom{${n}}{1} + \\binom{${n}}{2} = ${1 + n + binom(n, 2)}$.` },
        { q: 'contiennent $1$ mais pas $2$', v: 2 ** (n - 2), why: `$1$ est imposé, $2$ interdit, les $${n - 2}$ autres sont libres : $2^{${n - 2}}$.` },
      ];
      const k = rng.pick(level === 1 ? kinds.slice(0, 2) : kinds);
      return {
        prompt: `$E = \\{1, \\dots, ${n}\\}$. Combien de parties de $E$ ${k.q} ?`,
        answer: num(k.v),
        hint: 'Une partie, c’est un choix « dedans / dehors » pour chaque élément.',
        correction: [k.why],
      };
    },
    // Couples de parties emboîtées : 3^n.
    (rng, level) => {
      const n = rng.int(2, level === 3 ? 7 : 5);
      const disj = level > 1 && rng.next() < 0.5;
      return {
        prompt: disj
          ? `$E$ a $${n}$ éléments. Combien y a-t-il de couples $(A, B)$ de parties de $E$ tels que $A \\cap B = \\varnothing$ ?`
          : `$E$ a $${n}$ éléments. Combien y a-t-il de couples $(A, B)$ de parties de $E$ tels que $A \\subset B$ ?`,
        answer: num(3 ** n),
        hint: 'Pour chaque élément de $E$, compte les situations possibles par rapport à $A$ et $B$.',
        correction: [
          disj ? 'Chaque élément est dans $A$, dans $B$, ou dans aucun des deux : $3$ choix.' : 'Chaque élément est dans $A$ (donc dans $B$), dans $B$ seulement, ou hors de $B$ : $3$ choix.',
          `Il y a donc $3^{${n}} = ${3 ** n}$ couples.`,
        ],
      };
    },
    // Question inverse : retrouver n à partir du nombre de parties.
    (rng) => {
      const n = rng.int(3, 10);
      const pairsOnly = rng.next() < 0.5;
      return {
        prompt: pairsOnly ? `Un ensemble fini a exactement $${binom(n, 2)}$ parties à deux éléments. Combien a-t-il d’éléments ?` : `Un ensemble fini a exactement $${2 ** n}$ parties. Combien a-t-il d’éléments ?`,
        answer: num(n),
        hint: pairsOnly ? 'Résous $\\binom{n}{2} = \\frac{n(n-1)}{2}$.' : 'Un ensemble à $n$ éléments a $2^n$ parties.',
        correction: [pairsOnly ? `$\\frac{n(n-1)}{2} = ${binom(n, 2)} \\iff n = ${n}$` : `$2^n = ${2 ** n} \\iff n = ${n}$`],
      };
    },
  ],
  'l1-operations-ensembles': [
    // Différence symétrique.
    (rng) => {
      const all = Array.from({ length: 10 }, (_, i) => i + 1);
      const A = rng.shuffle(all).slice(0, rng.int(3, 6));
      const B = rng.shuffle(all).slice(0, rng.int(3, 6));
      const delta = all.filter((x) => A.includes(x) !== B.includes(x));
      return {
        prompt: `$A = ${setTex(A)}$ et $B = ${setTex(B)}$. Donne les éléments de la différence symétrique $A \\,\\Delta\\, B = (A \\setminus B) \\cup (B \\setminus A)$.`,
        answer: { kind: 'set', values: delta.map((v) => ({ n: v, d: 1 })) },
        hint: 'Garde les éléments qui sont dans exactement un des deux ensembles.',
        correction: [`$A \\,\\Delta\\, B = ${setTex(delta)}$`],
      };
    },
    (rng) => vraiFauxBanque(rng, ENSEMBLES, 'Fais un dessin (diagramme de Venn) ou teste sur de petits ensembles.'),
    (rng) => qcmBanque(rng, ENSEMBLES, rng.next() < 0.5),
    // Multiples : intersection et réunion dans {1, …, N}.
    (rng) => {
      const [p, q] = rng.pick([[2, 3], [2, 5], [3, 4], [4, 6], [6, 9]]);
      const N = rng.int(20, 60);
      const inter = Math.floor(N / lcm(p, q));
      const ask = rng.pick(['inter', 'diff'] as const);
      const value = ask === 'inter' ? inter : Math.floor(N / p) - inter;
      return {
        prompt: `Dans $E = \\{1, \\dots, ${N}\\}$, $A$ est l’ensemble des multiples de $${p}$ et $B$ celui des multiples de $${q}$. Combien d’éléments a $${ask === 'inter' ? 'A \\cap B' : 'A \\setminus B'}$ ?`,
        answer: num(value),
        hint: `$A \\cap B$ est l’ensemble des multiples de $\\operatorname{ppcm}(${p}, ${q}) = ${lcm(p, q)}$.`,
        correction: [`$|A \\cap B| = \\lfloor ${N}/${lcm(p, q)} \\rfloor = ${inter}$`, ...(ask === 'diff' ? [`$|A \\setminus B| = \\lfloor ${N}/${p} \\rfloor - ${inter} = ${value}$`] : [])],
      };
    },
  ],
};

/** Pour les tests : les banques d'affirmations. */
export const BANQUES_LOGIQUE = { TAUTOLOGIES, ENSEMBLES };
