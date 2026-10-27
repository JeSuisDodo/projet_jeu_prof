import { dec, decimal, fl, fraction, makeChoice, prenom, round, vraiFaux } from '../../college';
import type { Variant } from '../../variantes';

/** 3e : nouvelles formes pour les statistiques, les probabilités et l'algorithmique. */

const list = (v: number[]) => v.join(' \\,;\\, ');

const MOYENNE: Variant[] = [
  {
    name: 'note-manquante',
    make: (rng, level) => {
      const n = rng.int(3, level === 1 ? 4 : 6);
      const target = rng.int(10, 15);
      let notes: number[];
      let last: number;
      do {
        notes = Array.from({ length: n - 1 }, () => rng.int(6, 18));
        last = target * n - notes.reduce((s, x) => s + x, 0);
      } while (last < 0 || last > 20);
      const who = prenom(rng);
      return {
        prompt: `${who} a eu les notes $${list(notes)}$. Quelle note doit-on avoir au prochain contrôle pour que la moyenne des $${n}$ notes soit exactement $${target}$ ?`,
        answer: decimal(last),
        hint: `La somme des $${n}$ notes doit valoir $${n} \\times ${target} = ${n * target}$.`,
        correction: [`Somme actuelle : $${notes.join(' + ')} = ${notes.reduce((s, x) => s + x, 0)}$.`, `Note nécessaire : $${n * target} - ${notes.reduce((s, x) => s + x, 0)} = ${last}$.`],
      };
    },
  },
  {
    name: 'ajout-valeur',
    from: 2,
    make: (rng) => {
      const n = rng.int(4, 9);
      const m = rng.int(8, 15);
      const v = rng.int(0, 20);
      const total = n * m + v;
      const nm = round(total / (n + 1), 2);
      const exact = Number.isInteger((total * 100) / (n + 1));
      return {
        prompt: `Une série de $${n}$ valeurs a pour moyenne $${m}$. On ajoute la valeur $${v}$. Quelle est la nouvelle moyenne${exact ? '' : ', arrondie au centième'} ?`,
        answer: decimal(nm),
        hint: 'Retrouve d’abord la somme des valeurs : moyenne × effectif.',
        correction: [`Somme : $${n} \\times ${m} = ${n * m}$, puis $${n * m} + ${v} = ${total}$.`, `Nouvelle moyenne : $\\frac{${total}}{${n + 1}} ${exact ? '=' : '\\approx'} ${dec(nm)}$`],
      };
    },
  },
];

const PONDEREE: Variant[] = [
  {
    name: 'tableau-effectifs',
    make: (rng, level) => {
      const k = level === 1 ? 3 : 4;
      const vals = Array.from({ length: k }, (_, i) => i);
      const eff = vals.map(() => rng.int(1, 8));
      const N = eff.reduce((s, x) => s + x, 0);
      const S = vals.reduce((s, x, i) => s + x * eff[i], 0);
      const m = round(S / N, 1);
      const exact = Number.isInteger((S * 10) / N);
      const table = `\\begin{array}{|c|${'c|'.repeat(k)}}\\hline \\text{Buts} & ${vals.join(' & ')} \\\\ \\hline \\text{Matchs} & ${eff.join(' & ')} \\\\ \\hline\\end{array}`;
      return {
        prompt: `Une équipe a noté le nombre de buts marqués par match : $${table}$ Quel est le nombre moyen de buts par match${exact ? '' : ', arrondi au dixième'} ?`,
        answer: decimal(m),
        hint: 'Moyenne $= \\frac{\\text{somme des valeurs} \\times \\text{effectifs}}{\\text{effectif total}}$.',
        correction: [`$${vals.map((v, i) => `${v} \\times ${eff[i]}`).join(' + ')} = ${S}$ buts en $${N}$ matchs.`, `$\\frac{${S}}{${N}} ${exact ? '=' : '\\approx'} ${dec(m)}$`],
      };
    },
  },
];

const MEDIANE: Variant[] = [
  {
    name: 'effectif-pair',
    make: (rng) => {
      const n = rng.pick([6, 8, 10]);
      const vals = Array.from({ length: n }, () => rng.int(1, 20)).sort((a, b) => a - b);
      const shuffled = rng.shuffle(vals);
      const med = (vals[n / 2 - 1] + vals[n / 2]) / 2;
      return {
        prompt: `Quelle est la médiane de cette série de $${n}$ valeurs : $${list(shuffled)}$ ?`,
        answer: decimal(med),
        hint: 'Range les valeurs dans l’ordre ; avec un effectif pair, la médiane est la moyenne des deux valeurs du milieu.',
        correction: [`Série rangée : $${list(vals)}$.`, `Valeurs du milieu : $${vals[n / 2 - 1]}$ et $${vals[n / 2]}$ ; médiane $= ${dec(med)}$.`],
      };
    },
  },
  {
    name: 'mediane-ou-moyenne',
    from: 2,
    make: (rng) => {
      const base = Array.from({ length: 6 }, () => rng.int(1200, 1800));
      const big = rng.int(8000, 20000);
      const vals = [...base, big].sort((a, b) => a - b);
      const mean = vals.reduce((s, x) => s + x, 0) / vals.length;
      const med = vals[3];
      return {
        prompt: `Dans une petite entreprise, les salaires mensuels (en €) sont : $${list(vals)}$. Quelle affirmation est vraie ?`,
        answer: makeChoice(rng, 'La moyenne est plus grande que la médiane', ['La médiane est plus grande que la moyenne', 'La moyenne et la médiane sont égales', 'La médiane est le plus grand salaire'], () => 'On ne peut pas savoir'),
        hint: 'Un salaire très élevé tire la moyenne vers le haut, mais ne change presque pas la médiane.',
        correction: [`Médiane : $${med}$ € ; moyenne : $\\approx ${Math.round(mean)}$ €.`, 'La moyenne, sensible aux valeurs extrêmes, est plus grande que la médiane.'],
      };
    },
  },
];

const ETENDUE: Variant[] = [
  {
    name: 'valeur-manquante',
    make: (rng) => {
      const min = rng.int(2, 30);
      const e = rng.int(5, 40);
      const vals = [min, min + e, ...Array.from({ length: 4 }, () => min + rng.int(1, e - 1))];
      const shown = rng.shuffle(vals.filter((v) => v !== min + e));
      return {
        prompt: `Une série contient les valeurs $${list(shown)}$ et une valeur $x$, la plus grande de toutes. L’étendue de la série est $${e}$. Que vaut $x$ ?`,
        answer: decimal(min + e),
        hint: 'Étendue $=$ plus grande valeur $-$ plus petite valeur.',
        correction: [`La plus petite valeur est $${min}$.`, `$x - ${min} = ${e}$, donc $x = ${min + e}$.`],
      };
    },
  },
];

const FREQUENCE: Variant[] = [
  {
    name: 'effectif',
    make: (rng) => {
      const N = rng.pick([20, 25, 40, 50, 200, 500]);
      const f = rng.pick([10, 20, 30, 40, 60, 5, 15, 35]);
      const e = (N * f) / 100;
      return {
        prompt: `Dans un sondage auprès de $${N}$ personnes, la fréquence de la réponse « oui » est $${f}\\,\\%$. Combien de personnes ont répondu « oui » ?`,
        answer: decimal(e),
        hint: 'Effectif $=$ fréquence $\\times$ effectif total.',
        correction: [`$${N} \\times ${dec(f / 100)} = ${dec(e)}$`],
      };
    },
  },
  {
    name: 'decimale',
    make: (rng) => {
      const N = rng.pick([20, 25, 40, 50]);
      const e = rng.int(1, N - 1);
      return {
        prompt: `$${e}$ élèves sur $${N}$ ont un chat. Quelle est la fréquence de ces élèves, en écriture décimale ?`,
        answer: decimal(e / N),
        hint: 'Fréquence $= \\frac{\\text{effectif}}{\\text{effectif total}}$, un nombre entre $0$ et $1$.',
        correction: [`$\\frac{${e}}{${N}} = ${dec(e / N)}$`],
      };
    },
  },
];

const URNE: Variant[] = [
  {
    name: 'composition',
    make: (rng, level) => {
      const [p, q] = rng.pick([[1, 2], [1, 3], [1, 4], [2, 5], [3, 4], [2, 3]]);
      const total = q * rng.int(2, level === 1 ? 4 : 8);
      return {
        prompt: `Une urne contient $${total}$ boules. La probabilité de tirer une boule rouge est $\\frac{${p}}{${q}}$. Combien y a-t-il de boules rouges ?`,
        answer: decimal((total * p) / q),
        hint: 'Nombre de boules rouges $=$ probabilité $\\times$ nombre total de boules.',
        correction: [`$\\frac{${p}}{${q}} \\times ${total} = ${(total * p) / q}$ boules rouges.`],
      };
    },
  },
  {
    name: 'ajouter',
    from: 2,
    make: (rng) => {
      const r = rng.int(1, 6);
      const b = r + rng.int(1, 8);
      return {
        prompt: `Un sac contient $${r}$ jetons rouges et $${b}$ jetons bleus. Combien de jetons rouges faut-il ajouter pour avoir autant de chances de tirer un rouge qu’un bleu ?`,
        answer: decimal(b - r),
        hint: 'Probabilité $\\frac{1}{2}$ : il faut autant de rouges que de bleus.',
        correction: [`Il faut $${b}$ rouges : on en ajoute $${b} - ${r} = ${b - r}$.`],
      };
    },
  },
];

const CONTRAIRE: Variant[] = [
  {
    name: 'au-moins-un',
    from: 2,
    make: (rng) => {
      const kind = rng.pick(['de', 'piece'] as const);
      if (kind === 'de') {
        return {
          prompt: 'On lance deux fois un dé équilibré à $6$ faces. Quelle est la probabilité d’obtenir au moins un $6$ ?',
          answer: fraction(11, 36),
          hint: 'L’événement contraire est « aucun $6$ ».',
          correction: ['$P(\\text{aucun } 6) = \\frac{5}{6} \\times \\frac{5}{6} = \\frac{25}{36}$', '$P(\\text{au moins un } 6) = 1 - \\frac{25}{36} = \\frac{11}{36}$'],
        };
      }
      const n = rng.int(2, 4);
      return {
        prompt: `On lance $${n}$ fois une pièce équilibrée. Quelle est la probabilité d’obtenir au moins une fois Pile ?`,
        answer: fraction(2 ** n - 1, 2 ** n),
        hint: 'L’événement contraire est « que des Face ».',
        correction: [`$P(\\text{que des Face}) = \\left(\\frac{1}{2}\\right)^{${n}} = \\frac{1}{${2 ** n}}$`, `$P(\\text{au moins un Pile}) = 1 - \\frac{1}{${2 ** n}} = ${fl(2 ** n - 1, 2 ** n)}$`],
      };
    },
  },
  {
    name: 'pourcentage',
    make: (rng) => {
      const p = rng.pick([5, 12, 25, 30, 45, 62, 80, 93]);
      return {
        prompt: `La météo annonce $${p}\\,\\%$ de risque de pluie demain. Quelle est la probabilité qu’il ne pleuve pas, en % ?`,
        answer: decimal(100 - p),
        hint: '$P(\\overline{A}) = 1 - P(A)$, ici $100\\,\\% - P(A)$.',
        correction: [`$100 - ${p} = ${100 - p}$ : $${100 - p}\\,\\%$.`],
      };
    },
  },
];

const DE: Variant[] = [
  {
    name: 'multiple',
    make: (rng, level) => {
      const faces = rng.pick(level === 1 ? [6] : [6, 8, 10, 12, 20]);
      const k = rng.pick([2, 3, 4, 5].filter((x) => x < faces));
      const n = Math.floor(faces / k);
      return {
        prompt: `On lance un dé équilibré à $${faces}$ faces numérotées de $1$ à $${faces}$. Quelle est la probabilité d’obtenir un multiple de $${k}$ ?`,
        answer: fraction(n, faces),
        hint: 'Compte les multiples de ' + k + ' entre $1$ et $' + faces + '$.',
        correction: [`Multiples de $${k}$ : $${Array.from({ length: n }, (_, i) => k * (i + 1)).join('$, $')}$, soit $${n}$ issues favorables.`, `$P = \\frac{${n}}{${faces}} = ${fl(n, faces)}$`],
      };
    },
  },
  {
    name: 'equitable',
    from: 2,
    make: (rng) => {
      const items: [string, boolean, string][] = [
        ['On lance un dé à $6$ faces : $A$ gagne sur un nombre pair, $B$ sur un nombre impair. Le jeu est équitable.', true, 'Chacun a $3$ issues sur $6$.'],
        ['On lance un dé à $6$ faces : $A$ gagne sur un $6$, $B$ sur un $1$ ou un $2$. Le jeu est équitable.', false, '$A$ a $\\frac{1}{6}$ de chances, $B$ en a $\\frac{2}{6}$.'],
        ['On lance un dé à $6$ faces : $A$ gagne sur un nombre premier, $B$ sinon. Le jeu est équitable.', true, 'Premiers : $2$, $3$, $5$ (trois issues), sinon $1$, $4$, $6$ (trois issues).'],
        ['On lance un dé à $6$ faces : $A$ gagne sur un multiple de $3$, $B$ sinon. Le jeu est équitable.', false, '$A$ : $3$ et $6$, soit $\\frac{2}{6}$ ; $B$ : $\\frac{4}{6}$.'],
        ['On lance deux pièces : $A$ gagne si elles tombent du même côté, $B$ sinon. Le jeu est équitable.', true, 'PP, FF pour $A$ ; PF, FP pour $B$ : $\\frac{1}{2}$ chacun.'],
      ];
      const [t, ok, why] = rng.pick(items);
      return { prompt: `Vrai ou faux ? ${t}`, answer: vraiFaux(ok), hint: 'Un jeu est équitable si chaque joueur a la même probabilité de gagner.', correction: [`${ok ? 'Vrai' : 'Faux'}. ${why}`] };
    },
  },
];

const DEUX_EPREUVES: Variant[] = [
  {
    name: 'meme-couleur',
    from: 2,
    make: (rng) => {
      const r1 = rng.int(1, 5);
      const b1 = rng.int(1, 5);
      const r2 = rng.int(1, 5);
      const b2 = rng.int(1, 5);
      const n = r1 * r2 + b1 * b2;
      const d = (r1 + b1) * (r2 + b2);
      return {
        prompt: `L’urne $U_1$ contient $${r1}$ boules rouges et $${b1}$ bleues ; l’urne $U_2$ contient $${r2}$ rouges et $${b2}$ bleues. On tire une boule dans chaque urne. Quelle est la probabilité d’obtenir deux boules de la même couleur ?`,
        answer: fraction(n, d),
        hint: 'Fais un arbre : « même couleur » regroupe deux chemins, rouge-rouge et bleu-bleu.',
        correction: [`$P(RR) = \\frac{${r1}}{${r1 + b1}} \\times \\frac{${r2}}{${r2 + b2}} = \\frac{${r1 * r2}}{${d}}$ et $P(BB) = \\frac{${b1 * b2}}{${d}}$.`, `$P = \\frac{${n}}{${d}} = ${fl(n, d)}$`],
      };
    },
  },
  {
    name: 'code',
    make: (rng) => {
      const n = rng.int(2, 4);
      const k = rng.pick([2, 3, 4, 10]);
      return {
        prompt: `Un cadenas a un code de $${n}$ chiffres, chacun choisi entre $${k === 10 ? '0' : '1'}$ et $${k === 10 ? 9 : k}$ (${k} possibilités par chiffre). En essayant un code au hasard, quelle est la probabilité de trouver le bon ?`,
        answer: fraction(1, k ** n),
        hint: 'Compte d’abord le nombre de codes possibles : $' + k + '$ choix pour chaque chiffre.',
        correction: [`Nombre de codes : $${Array.from({ length: n }, () => k).join(' \\times ')} = ${k ** n}$.`, `$P = \\frac{1}{${k ** n}}$`],
      };
    },
  },
];

const FREQ_PROBA: Variant[] = [
  {
    name: 'estimer-composition',
    from: 2,
    make: (rng) => {
      const total = rng.pick([10, 20, 50]);
      const f = rng.pick([0.2, 0.3, 0.4, 0.6, 0.7]);
      const n = rng.pick([500, 1000, 2000]);
      return {
        prompt: `Une urne contient $${total}$ boules, rouges ou noires. On tire une boule avec remise $${n}$ fois et on obtient une boule rouge $${Math.round(n * f)}$ fois. Combien de boules rouges l’urne contient-elle probablement ?`,
        answer: decimal(total * f),
        hint: 'Sur un grand nombre de tirages, la fréquence observée est proche de la probabilité.',
        correction: [`Fréquence observée : $\\frac{${Math.round(n * f)}}{${n}} = ${dec(f)}$.`, `Estimation : $${dec(f)} \\times ${total} = ${dec(total * f)}$ boules rouges.`],
      };
    },
  },
];

const BOUCLE: Variant[] = [
  {
    name: 'tant-que',
    make: (rng, level) => {
      const start = rng.int(1, 5);
      const k = rng.pick(level === 1 ? [2] : [2, 3]);
      const limit = rng.int(20, level === 1 ? 100 : 1000);
      let x = start;
      let c = 0;
      while (x < limit) {
        x *= k;
        c++;
      }
      return {
        prompt: `On part de $x = ${start}$. Tant que $x < ${limit}$, on multiplie $x$ par $${k}$. Combien de multiplications fait-on ?`,
        answer: decimal(c),
        hint: 'Écris les valeurs successives de $x$ jusqu’à dépasser (ou atteindre) la limite.',
        correction: [`Valeurs : $${Array.from({ length: c + 1 }, (_, i) => start * k ** i).join('$, $')}$.`, `On s’arrête quand $x \\geq ${limit}$ : $${c}$ multiplications.`],
      };
    },
  },
  {
    name: 'somme',
    make: (rng, level) => {
      const n = rng.int(4, level === 1 ? 8 : 20);
      const step = rng.pick(level === 1 ? [1] : [1, 2]);
      let s = 0;
      for (let i = 1; i <= n; i++) s += step === 1 ? i : 2 * i - 1;
      return {
        prompt: `Un programme met $s$ à $0$, puis pour $i$ allant de $1$ à $${n}$, ajoute ${step === 1 ? '$i$' : '$2i - 1$'} à $s$. Que vaut $s$ à la fin ?`,
        answer: decimal(s),
        hint: step === 1 ? 'C’est la somme $1 + 2 + \\ldots + ' + n + '$.' : 'C’est la somme des $' + n + '$ premiers nombres impairs.',
        correction: [step === 1 ? `$s = 1 + 2 + \\ldots + ${n} = \\frac{${n} \\times ${n + 1}}{2} = ${s}$` : `$s = 1 + 3 + \\ldots + ${2 * n - 1} = ${n}^2 = ${s}$`],
      };
    },
  },
];

const CONDITION: Variant[] = [
  {
    name: 'syracuse',
    from: 2,
    make: (rng) => {
      const x0 = rng.int(3, 30);
      const steps = rng.int(2, 4);
      let x = x0;
      const seq = [x];
      for (let i = 0; i < steps; i++) {
        x = x % 2 === 0 ? x / 2 : 3 * x + 1;
        seq.push(x);
      }
      return {
        prompt: `Programme : « si le nombre est pair, le diviser par $2$ ; sinon, le multiplier par $3$ et ajouter $1$ ». On part de $${x0}$ et on applique le programme $${steps}$ fois de suite. Quel nombre obtient-on ?`,
        answer: decimal(x),
        hint: 'Teste la parité à chaque étape.',
        correction: [`$${seq.join(' \\to ')}$`],
      };
    },
  },
  {
    name: 'tarif',
    make: (rng) => {
      const age = rng.int(3, 70);
      const [p1, p2, p3] = [rng.int(3, 6), rng.int(8, 12), rng.int(5, 8)];
      const price = age < 12 ? p1 : age >= 65 ? p3 : p2;
      return {
        prompt: `Un cinéma calcule le prix ainsi : « si âge $< 12$, prix $= ${p1}$ ; sinon, si âge $\\geq 65$, prix $= ${p3}$ ; sinon prix $= ${p2}$ ». Quel prix, en €, paie une personne de $${age}$ ans ?`,
        answer: decimal(price),
        hint: 'Teste les conditions dans l’ordre.',
        correction: [age < 12 ? `$${age} < 12$ : prix $${price}$ €.` : age >= 65 ? `$${age} \\geq 65$ : prix $${price}$ €.` : `$${age}$ n’est ni inférieur à $12$ ni supérieur ou égal à $65$ : prix $${price}$ €.`],
      };
    },
  },
];

const FIGURE: Variant[] = [
  {
    name: 'nombre-cotes',
    make: (rng) => {
      const n = rng.pick([3, 4, 5, 6, 8, 9, 10, 12]);
      return {
        prompt: `Un lutin répète « avancer de $50$ pas, tourner de $${360 / n}^\\circ$ » jusqu’à revenir à son point de départ. Combien de côtés a la figure tracée ?`,
        answer: decimal(n),
        hint: 'Après un tour complet, le lutin a tourné de $360^\\circ$ au total.',
        correction: [`$360 \\div ${360 / n} = ${n}$ côtés.`],
      };
    },
  },
];

const VARIABLES: Variant[] = [
  {
    name: 'echange',
    from: 2,
    make: (rng) => {
      const a0 = rng.int(1, 20);
      const b0 = rng.int(1, 20);
      const ask = rng.pick(['a', 'b'] as const);
      return {
        prompt: `Au départ, $a = ${a0}$ et $b = ${b0}$. On exécute : (1) $a \\leftarrow a + b$ ; (2) $b \\leftarrow a - b$ ; (3) $a \\leftarrow a - b$. Que vaut $${ask}$ à la fin ?`,
        answer: decimal(ask === 'a' ? b0 : a0),
        hint: 'Suis les valeurs ligne par ligne, en utilisant à chaque fois les valeurs les plus récentes.',
        correction: [`(1) $a = ${a0 + b0}$ ; (2) $b = ${a0 + b0} - ${b0} = ${a0}$ ; (3) $a = ${a0 + b0} - ${a0} = ${b0}$.`, 'Les deux valeurs ont été échangées.'],
      };
    },
  },
];

export const DONNEES_3E: Record<string, Variant[]> = {
  '3e-moyenne': MOYENNE,
  '3e-moyenne-ponderee': PONDEREE,
  '3e-mediane': MEDIANE,
  '3e-etendue': ETENDUE,
  '3e-frequence': FREQUENCE,
  '3e-proba-urne': URNE,
  '3e-proba-contraire': CONTRAIRE,
  '3e-proba-de': DE,
  '3e-proba-deux-epreuves': DEUX_EPREUVES,
  '3e-proba-frequence': FREQ_PROBA,
  '3e-algo-boucle': BOUCLE,
  '3e-algo-condition': CONDITION,
  '3e-algo-figure': FIGURE,
  '3e-algo-variables': VARIABLES,
};
