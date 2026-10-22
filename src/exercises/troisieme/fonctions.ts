import { frac, fracLatex } from '../fraction';
import type { Skill } from '../types';
import { choiceTex, fixedChoice, fraction, num, par, poly, skill } from './outils';

/** 3e : notion de fonction (image, antécédent, tableau de valeurs, vocabulaire) et fonctions linéaires / affines. */

const image = skill('3e-image', 'Calculer l’image d’un nombre', (rng, level) => {
  const a = level === 1 ? 0 : rng.nonZero(-3, 3);
  const b = rng.nonZero(-6, 6);
  const c = rng.int(-9, 9);
  const x = level === 1 ? rng.int(0, 6) : rng.nonZero(-5, 5);
  const f = level === 1 ? poly([b, c]) : poly([a, b, c]);
  const v = a * x * x + b * x + c;
  return {
    prompt: `On considère la fonction $f : x \\mapsto ${f}$. Calcule l'image de $${x}$ par $f$.`,
    answer: num(v),
    hint: `L'image de $${x}$ est $f(${x})$ : remplace $x$ par $${par(x)}$ dans l'expression.`,
    correction: [
      level === 1
        ? `$f(${x}) = ${b} \\times ${par(x)} ${c < 0 ? '-' : '+'} ${Math.abs(c)}$`
        : `$f(${x}) = ${a} \\times ${par(x)}^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)} \\times ${par(x)} ${c < 0 ? '-' : '+'} ${Math.abs(c)}$`,
      `$f(${x}) = ${v}$`,
    ],
  };
});

const antecedent = skill('3e-antecedent', 'Calculer un antécédent par une fonction affine', (rng, level) => {
  const a = level === 1 ? rng.int(2, 5) : rng.nonZero(-7, 7);
  const b = rng.int(-9, 9);
  const target = level === 3 ? rng.int(-20, 20) : a * rng.int(-6, 6) + b;
  const sol = frac(target - b, a);
  return {
    prompt: `Soit $f(x) = ${poly([a, b])}$. Quel est l'antécédent de $${target}$ par $f$ ?${level === 3 ? ' (fraction acceptée)' : ''}`,
    answer: { kind: 'number', value: sol },
    hint: `Un antécédent de $${target}$ est un nombre $x$ tel que $f(x) = ${target}$ : résous l'équation.`,
    correction: [`$${poly([a, b])} = ${target}$`, `$${poly([a, 0])} = ${target - b}$`, `$x = ${fracLatex(sol)}$`],
  };
});

const tableau = skill('3e-tableau-valeurs', 'Lire un tableau de valeurs', (rng, level) => {
  const xs = [-2, -1, 0, 1, 2, 3, 4];
  const a = rng.nonZero(-2, 2);
  const b = rng.int(-3, 3);
  const c = rng.int(-5, 5);
  const ys = xs.map((x) => a * x * x + b * x + c);
  const row = (label: string, v: number[]) => `${label} & ${v.join(' & ')}`;
  const table = `\\begin{array}{|c|${'c|'.repeat(xs.length)}}\\hline ${row('x', xs)} \\\\ \\hline ${row('f(x)', ys)} \\\\ \\hline\\end{array}`;
  const askImage = level === 1 || rng.next() < 0.4;
  if (askImage) {
    const i = rng.int(0, xs.length - 1);
    return {
      prompt: `Voici un tableau de valeurs d'une fonction $f$ : $${table}$ Quelle est l'image de $${xs[i]}$ par $f$ ?`,
      answer: num(ys[i]),
      hint: 'L’image de $x$ se lit sur la deuxième ligne, sous $x$.',
      correction: [`Sous $${xs[i]}$, on lit $${ys[i]}$ : $f(${xs[i]}) = ${ys[i]}$.`],
    };
  }
  const y = rng.pick(ys);
  const ants = xs.filter((_, i) => ys[i] === y);
  return {
    prompt: `Voici un tableau de valeurs d'une fonction $f$ : $${table}$ Donne tous les antécédents de $${y}$ lisibles dans le tableau, séparés par « ; ».`,
    answer: { kind: 'set', values: ants.map((v) => frac(v)) },
    hint: 'Les antécédents se lisent sur la première ligne, au-dessus de chaque case où apparaît la valeur.',
    correction: [`$${y}$ apparaît sous $${ants.join('$ et $')}$.`, `Antécédent${ants.length > 1 ? 's' : ''} de $${y}$ : $${ants.join(' ; ')}$.`],
  };
});

const vocabulaire = skill('3e-vocabulaire-fonction', 'Utiliser le vocabulaire des fonctions', (rng, level) => {
  const x = rng.int(-9, 9);
  let y = rng.int(-9, 9);
  if (y === x) y += 3;
  const kind = level === 1 ? 'egalite' : rng.pick(['egalite', 'point'] as const);
  const statements = [
    `$${y}$ est l'image de $${x}$ par $f$`,
    `$${x}$ est l'image de $${y}$ par $f$`,
    `$${y}$ est un antécédent de $${x}$ par $f$`,
    `$f(${y}) = ${x}$`,
  ];
  const shuffled = rng.shuffle(statements);
  const given = kind === 'egalite' ? `$f(${x}) = ${y}$` : `le point $A(${x}\\,;\\,${y})$ est sur la courbe de $f$`;
  return {
    prompt: `On sait que ${given}. Laquelle de ces phrases est vraie ?`,
    answer: fixedChoice(shuffled, shuffled.indexOf(statements[0])),
    hint: '$f(a) = b$ se lit « $b$ est l’image de $a$ » ou « $a$ est un antécédent de $b$ ». Un point de la courbe a pour coordonnées $(x\\,;\\,f(x))$.',
    correction: [
      ...(kind === 'point' ? [`$A$ est sur la courbe, donc $f(${x}) = ${y}$.`] : []),
      `$f(${x}) = ${y}$ : $${y}$ est l'image de $${x}$, et $${x}$ est un antécédent de $${y}$.`,
    ],
  };
});

const pointCourbe = skill('3e-point-courbe', 'Savoir si un point est sur une courbe', (rng, level) => {
  const a = level === 1 ? 0 : rng.nonZero(-2, 2);
  const b = rng.nonZero(-5, 5);
  const c = rng.int(-6, 6);
  const x = rng.nonZero(-4, 4);
  const v = a * x * x + b * x + c;
  const yes = rng.next() < 0.5;
  // Leurre fréquent : se tromper de signe ou oublier le carré d'un nombre négatif.
  const y = yes ? v : rng.pick([v + rng.nonZero(-3, 3), -v === v ? v + 2 : -v, a * -x * x + b * x + c === v ? v + 1 : a * -x * x + b * x + c]);
  const on = y === v;
  const f = a === 0 ? poly([b, c]) : poly([a, b, c]);
  return {
    prompt: `Le point $M(${x}\\,;\\,${y})$ appartient-il à la courbe de $f(x) = ${f}$ ?`,
    answer: fixedChoice(['Oui', 'Non'], on ? 0 : 1),
    hint: 'Calcule $f$ de l’abscisse du point et compare avec son ordonnée.',
    correction: [`$f(${x}) = ${v}$`, on ? `$f(${x}) = ${y}$ : $M$ est sur la courbe.` : `$${v} \\neq ${y}$ : $M$ n'est pas sur la courbe.`],
  };
});

export const FONCTIONS_3E: Skill[] = [image, antecedent, tableau, vocabulaire, pointCourbe];

/* ---------- Fonctions linéaires et affines ---------- */

const lineaire = skill('3e-lineaire', 'Trouver le coefficient d’une fonction linéaire', (rng, level) => {
  const a = level === 1 ? rng.int(2, 9) : level === 2 ? rng.nonZero(-9, 9) : rng.pick([0.5, 1.5, 2.5, -0.5, -1.5, 1.2, 0.8, -2.5]);
  const x = rng.int(2, 9);
  const y = Math.round(a * x * 10) / 10;
  const yt = String(y).replace('.', '{,}');
  return {
    prompt: `$f$ est une fonction linéaire telle que $f(${x}) = ${yt}$. Quel est son coefficient ?`,
    answer: { kind: 'number', value: frac(Math.round(y * 10), x * 10) },
    hint: 'Une fonction linéaire s’écrit $f(x) = ax$ : $a = \\frac{f(x)}{x}$.',
    correction: [`$f(x) = ax$, donc $a \\times ${x} = ${yt}$.`, `$a = \\frac{${yt}}{${x}} = ${String(a).replace('.', '{,}')}$`],
  };
});

const deuxPoints = skill('3e-affine-deux-points', 'Déterminer une fonction affine à partir de deux images', (rng, level) => {
  const a = level === 1 ? rng.int(1, 5) : rng.nonZero(-6, 6);
  const b = rng.int(-9, 9);
  const x1 = level === 1 ? 0 : rng.int(-4, 3);
  const x2 = x1 + rng.int(1, level === 3 ? 5 : 3);
  const y1 = a * x1 + b;
  const y2 = a * x2 + b;
  return {
    prompt: `$f$ est une fonction affine avec $f(${x1}) = ${y1}$ et $f(${x2}) = ${y2}$. On écrit $f(x) = ax + b$ : donne $a$ et $b$.`,
    answer: { kind: 'pair', values: [frac(a), frac(b)], labels: ['a', 'b'] },
    hint: '$a = \\frac{f(x_2) - f(x_1)}{x_2 - x_1}$, puis on trouve $b$ en remplaçant dans $f(x_1) = ax_1 + b$.',
    correction: [
      `$a = \\frac{${y2} - ${par(y1)}}{${x2} - ${par(x1)}} = \\frac{${y2 - y1}}{${x2 - x1}} = ${a}$`,
      `$${y1} = ${a} \\times ${par(x1)} + b$, donc $b = ${y1} - ${par(a * x1)} = ${b}$.`,
      `$f(x) = ${poly([a, b])}$`,
    ],
  };
});

const lecture = skill('3e-affine-coefficients', 'Repérer coefficient directeur et ordonnée à l’origine', (rng, level) => {
  const a = rng.nonZero(-9, 9);
  const m = rng.nonZero(-5, 5);
  const b = level === 3 ? a * m : rng.nonZero(-9, 9);
  // Niveau 2 : ordre inhabituel « b + ax » ; niveau 3 : forme factorisée a(x + m) à développer.
  const ax = `${Math.abs(a) === 1 ? '' : Math.abs(a)}x`;
  const full = level === 1 ? poly([a, b]) : level === 2 ? `${b} ${a < 0 ? '-' : '+'} ${ax}` : `${a === -1 ? '-' : a === 1 ? '' : a}(${poly([1, m])})`;
  return {
    prompt: `Pour $f(x) = ${full}$, donne le coefficient directeur $a$ et l'ordonnée à l'origine $b$.`,
    answer: { kind: 'pair', values: [frac(a), frac(b)], labels: ['a', 'b'] },
    hint: 'Écris $f(x)$ sous la forme $ax + b$ : $a$ est le nombre devant $x$ (avec son signe), $b$ le nombre seul.',
    correction: [`$f(x) = ${poly([a, b])}$`, `$a = ${a}$ et $b = ${b}$.`],
  };
});

const reconnaitre = skill('3e-reconnaitre-affine', 'Reconnaître une fonction affine ou linéaire', (rng, level) => {
  const kind = rng.pick(['affine', 'lineaire'] as const);
  const a = rng.int(2, 9);
  const b = rng.int(1, 9);
  const lin = [`${a}x`, `-${a}x`, `\\frac{x}{${a}}`];
  const affOnly = [`${a}x + ${b}`, `${b} - ${a}x`, `${a}(x + ${b})`];
  const neither = [`x^2 + ${b}`, `\\frac{${a}}{x}`, `${a}x^2`, `\\sqrt{x} + ${b}`, `x(x - ${b})`];
  const pickF = (list: string[]) => rng.pick(list);
  // Linéaire ⇒ affine : au niveau 3, la bonne réponse « affine » peut être une linéaire.
  const correct = kind === 'lineaire' ? pickF(lin) : level === 3 && rng.next() < 0.4 ? pickF(lin) : pickF(affOnly);
  const decoys = kind === 'lineaire' ? [pickF(affOnly), ...rng.shuffle(neither).slice(0, 3)] : rng.shuffle(neither).slice(0, 3);
  return {
    prompt: `Laquelle de ces fonctions est ${kind === 'lineaire' ? 'linéaire' : 'affine'} ?`,
    answer: choiceTex(rng, `f(x) = ${correct}`, decoys.map((d) => `f(x) = ${d}`), () => `f(x) = x^3 - ${rng.int(1, 9)}`),
    hint: 'Affine : $f(x) = ax + b$. Linéaire : $f(x) = ax$ (cas particulier d’affine avec $b = 0$).',
    correction: [`$f(x) = ${correct}$ s'écrit ${kind === 'lineaire' ? 'sous la forme $ax$' : 'sous la forme $ax + b$'}.`, 'Les autres contiennent $x^2$, $\\frac{1}{x}$ ou $\\sqrt{x}$.'],
  };
});

const imageAffine = skill('3e-affine-image', 'Calculer avec une fonction affine', (rng, level) => {
  const a = level === 1 ? rng.int(2, 6) : rng.nonZero(-8, 8);
  const b = rng.int(-10, 10);
  const x = level === 3 ? rng.pick([0.5, 1.5, -0.5, 2.5, -1.5]) : rng.int(-6, 6);
  const v = a * x + b;
  const xt = String(x).replace('.', '{,}');
  return {
    prompt: `Soit $g(x) = ${poly([a, b])}$. Calcule $g(${xt})$.`,
    answer: fraction(Math.round(v * 2), 2),
    hint: `Remplace $x$ par $${xt}$.`,
    correction: [`$g(${xt}) = ${a} \\times ${x < 0 ? `(${xt})` : xt} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${String(v).replace('.', '{,}')}$`],
  };
});

export const FONCTIONS_AFFINES_3E: Skill[] = [imageAffine, lineaire, lecture, deuxPoints, reconnaitre];
