import type { Skill } from '../types';
import { fixedChoice, num, skill } from './outils';

/** 3e : algorithmique et programmation (boucles, conditions, variables, tracés « à la Scratch »). */

const POLYGONES: Record<number, string> = { 3: 'un triangle équilatéral', 4: 'un carré', 5: 'un pentagone régulier', 6: 'un hexagone régulier', 8: 'un octogone régulier' };

const boucle = skill('3e-algo-boucle', 'Suivre une boucle « répéter »', (rng, level) => {
  const start = rng.int(level === 1 ? 0 : -5, 10);
  const n = rng.int(2, level === 1 ? 4 : 5);
  const a = rng.int(2, 3);
  const b = rng.int(1, 9);
  const kind = level === 1 ? 'add' : rng.pick(['add', 'affine', 'double'] as const);
  let x = start;
  const steps: number[] = [];
  for (let i = 0; i < n; i++) {
    x = kind === 'add' ? x + b : kind === 'affine' ? a * x + b : 2 * x - b;
    steps.push(x);
  }
  const body = kind === 'add' ? `ajouter $${b}$ à $x$` : kind === 'affine' ? `donner à $x$ la valeur $${a}x + ${b}$` : `donner à $x$ la valeur $2x - ${b}$`;
  return {
    prompt: `Un programme met $x$ à $${start}$, puis répète $${n}$ fois : « ${body} ». Que vaut $x$ à la fin ?`,
    answer: num(x),
    hint: 'Fais un tableau avec la valeur de $x$ après chaque tour de boucle.',
    correction: [`Valeurs successives de $x$ : $${[start, ...steps].join(' \\to ')}$.`, `À la fin, $x = ${x}$.`],
  };
});

const condition = skill('3e-algo-condition', 'Suivre une instruction conditionnelle', (rng, level) => {
  const seuil = rng.int(5, 15);
  const a = rng.int(2, 5);
  const b = rng.int(1, 9);
  const x = rng.int(level === 3 ? -5 : 0, 25);
  const strict = rng.next() < 0.5;
  // Niveau 3 : la valeur de départ tombe souvent pile sur le seuil, pour travailler > et ≥.
  const v = level >= 2 && rng.next() < 0.4 ? seuil : x;
  const ok = strict ? v > seuil : v >= seuil;
  const r = ok ? a * v : v + b;
  return {
    prompt: `Programme : « Si le nombre choisi est ${strict ? 'supérieur' : 'supérieur ou égal'} à $${seuil}$${strict ? ' (strictement)' : ''}, alors le multiplier par $${a}$ ; sinon, lui ajouter $${b}$. » Quel résultat obtient-on avec $${v}$ ?`,
    answer: num(r),
    hint: 'Vérifie d’abord la condition, puis applique une seule des deux branches.',
    correction: [
      `$${v} ${ok ? (strict ? '>' : '\\geq') : strict ? '\\leq' : '<'} ${seuil}$ : la condition est ${ok ? 'vraie' : 'fausse'}.`,
      ok ? `$${v} \\times ${a} = ${r}$` : `$${v} + ${b} = ${r}$`,
    ],
  };
});

const figure = skill('3e-algo-figure', 'Prévoir la figure tracée par un lutin', (rng, level) => {
  const n = rng.pick([3, 4, 5, 6, 8]);
  const l = rng.int(3, 12) * 10;
  const angle = 360 / n;
  if (level === 1 || rng.next() < 0.4) {
    const options = Object.values(POLYGONES).slice(0, 4);
    if (!options.includes(POLYGONES[n])) options[3] = POLYGONES[n];
    const shuffled = rng.shuffle(options);
    return {
      prompt: `Un lutin exécute : « Répéter $${n}$ fois : avancer de $${l}$ pas, tourner de $${angle}^\\circ$. » Quelle figure trace-t-il ?`,
      answer: fixedChoice(shuffled, shuffled.indexOf(POLYGONES[n])),
      hint: 'Le nombre de répétitions donne le nombre de côtés ; tous les côtés ont la même longueur.',
      correction: [`$${n}$ côtés de $${l}$ pas, et le lutin a tourné de $${n} \\times ${angle}^\\circ = 360^\\circ$ : c'est ${POLYGONES[n]}.`],
    };
  }
  const ask = level === 3 ? 'angle' : 'perimetre';
  return ask === 'angle'
    ? {
        prompt: `On veut qu'un lutin trace ${POLYGONES[n]} avec « Répéter $${n}$ fois : avancer de $${l}$ pas, tourner de ? degrés ». De combien de degrés doit-il tourner à chaque fois ?`,
        answer: num(angle),
        hint: 'Après avoir tracé toute la figure, le lutin a fait un tour complet : $360^\\circ$.',
        correction: [`$360^\\circ \\div ${n} = ${angle}^\\circ$`],
      }
    : {
        prompt: `Un lutin exécute : « Répéter $${n}$ fois : avancer de $${l}$ pas, tourner de $${angle}^\\circ$. » Quelle est la longueur totale du tracé, en pas ?`,
        answer: num(n * l),
        hint: 'Additionne les longueurs parcourues à chaque répétition.',
        correction: [`$${n} \\times ${l} = ${n * l}$ pas`],
      };
});

const variables = skill('3e-algo-variables', 'Suivre l’évolution de plusieurs variables', (rng, level) => {
  const a0 = rng.int(1, 9);
  const b0 = rng.int(1, 9);
  let a = a0;
  let b = b0;
  const lines: string[] = [];
  const ops = level === 1 ? 2 : level === 2 ? 3 : 4;
  const program: string[] = [];
  for (let i = 0; i < ops; i++) {
    const op = rng.pick(['a+b', 'b*2', 'a-b', 'swap'] as const);
    if (op === 'a+b') {
      a = a + b;
      program.push('$a$ prend la valeur $a + b$');
    } else if (op === 'b*2') {
      b = 2 * b;
      program.push('$b$ prend la valeur $2b$');
    } else if (op === 'a-b') {
      b = a - b;
      program.push('$b$ prend la valeur $a - b$');
    } else {
      [a, b] = [b, a];
      program.push('on échange les valeurs de $a$ et $b$');
    }
    lines.push(`Après « ${program[i]} » : $a = ${a}$, $b = ${b}$.`);
  }
  return {
    prompt: `Au départ, $a = ${a0}$ et $b = ${b0}$. Puis : ${program.map((p, i) => `(${i + 1}) ${p}`).join(' ; ')}. Que vaut $a + b$ à la fin ?`,
    answer: num(a + b),
    hint: 'Les instructions s’exécutent dans l’ordre, et chacune utilise les valeurs actuelles des variables.',
    correction: [...lines, `$a + b = ${a + b}$`],
  };
});

export const ALGORITHMIQUE_3E: Skill[] = [boucle, condition, figure, variables];
