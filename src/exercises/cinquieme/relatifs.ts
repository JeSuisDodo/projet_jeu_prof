import { frac } from '../fraction';
import type { Rng } from '../rng';
import type { Level, Skill } from '../types';
import { dec, distinctInts, latexChoice, num, par } from './outils';

/** 5e : nombres relatifs (comparaison, addition, soustraction) et repérage dans le plan. */

/** Relatif au hasard : entier aux niveaux 1-2, décimal au dixième au niveau 3. */
function relatif(rng: Rng, level: Level): number {
  if (level === 3) return rng.nonZero(-99, 99) / 10;
  const max = level === 1 ? 10 : 30;
  return rng.nonZero(-max, max);
}

/** « (+3) » ou « (-5) » : l'écriture des relatifs dans les calculs de 5e. */
const signedPar = (v: number) => `(${v < 0 ? '-' : '+'}${dec(Math.abs(v))})`;

const comparer: Skill = {
  id: '5e-relatifs-comparer',
  name: 'Comparer des nombres relatifs',
  generate(rng, level) {
    let values: number[];
    if (level === 1) values = distinctInts(rng, 4, -12, 12);
    else if (level === 2) values = distinctInts(rng, 4, -60, 60).map((v) => v / 2);
    else {
      // Des décimaux proches, souvent négatifs : -2,5 ; -2,05 ; -2,15…
      const base = rng.int(-9, -1);
      values = distinctInts(rng, 4, -60, 60).map((v) => base + v / 100);
    }
    const smallest = rng.next() < 0.5;
    const target = smallest ? Math.min(...values) : Math.max(...values);
    const sorted = [...values].sort((a, b) => a - b);
    return {
      skill: '5e-relatifs-comparer',
      level,
      prompt: `Quel est le plus ${smallest ? 'petit' : 'grand'} de ces nombres ?`,
      answer: latexChoice(rng, dec(target), values.filter((v) => v !== target).map(dec), () => dec(target + 1)),
      hint: 'Entre deux nombres négatifs, le plus petit est celui qui a la plus grande distance à zéro.',
      correction: [`Rangés dans l'ordre croissant : $${sorted.map(dec).join(' < ')}$.`, `Le plus ${smallest ? 'petit' : 'grand'} est $${dec(target)}$.`],
    };
  },
};

const addition: Skill = {
  id: '5e-relatifs-addition',
  name: 'Additionner des nombres relatifs',
  generate(rng, level) {
    const a = relatif(rng, level);
    let b = relatif(rng, level);
    if (level > 1 && rng.next() < 0.6 && Math.sign(a) === Math.sign(b)) b = -b;
    const s = Math.round((a + b) * 10) / 10;
    const same = Math.sign(a) === Math.sign(b);
    return {
      skill: '5e-relatifs-addition',
      level,
      prompt: `Calcule $${signedPar(a)} + ${signedPar(b)}$.`,
      answer: num(s),
      hint: same
        ? 'Les deux nombres ont le même signe : on garde ce signe et on additionne les distances à zéro.'
        : 'Les signes sont contraires : on soustrait les distances à zéro et on garde le signe du nombre le plus éloigné de zéro.',
      correction: [
        same
          ? `Même signe : $${dec(Math.abs(a))} + ${dec(Math.abs(b))} = ${dec(Math.abs(s))}$, et on garde le signe ${a < 0 ? '−' : '+'}.`
          : `Signes contraires : $${dec(Math.max(Math.abs(a), Math.abs(b)))} - ${dec(Math.min(Math.abs(a), Math.abs(b)))} = ${dec(Math.abs(s))}$, signe du plus éloigné de zéro.`,
        `$${signedPar(a)} + ${signedPar(b)} = ${dec(s)}$`,
      ],
    };
  },
};

const soustraction: Skill = {
  id: '5e-relatifs-soustraction',
  name: 'Soustraire des nombres relatifs',
  generate(rng, level) {
    const a = relatif(rng, level);
    const b = relatif(rng, level);
    const s = Math.round((a - b) * 10) / 10;
    return {
      skill: '5e-relatifs-soustraction',
      level,
      prompt: `Calcule $${signedPar(a)} - ${signedPar(b)}$.`,
      answer: num(s),
      hint: 'Soustraire un nombre, c’est additionner son opposé.',
      correction: [`$${signedPar(a)} - ${signedPar(b)} = ${signedPar(a)} + ${signedPar(-b)}$`, `$= ${dec(s)}$`],
    };
  },
};

const somme: Skill = {
  id: '5e-relatifs-somme',
  name: 'Calculer une suite d’additions et de soustractions',
  generate(rng, level) {
    const count = level === 1 ? 3 : level === 2 ? 4 : 5;
    const values = Array.from({ length: count }, () => (level === 3 ? rng.nonZero(-20, 20) : relatif(rng, 2)));
    const ops = values.slice(1).map(() => rng.pick(['+', '-']));
    const expr = values.map((v, i) => (i === 0 ? signedPar(v) : ` ${ops[i - 1]} ${signedPar(v)}`)).join('');
    const asSums = values.map((v, i) => (i === 0 || ops[i - 1] === '+' ? v : -v));
    const total = asSums.reduce((x, y) => x + y, 0);
    const pos = asSums.filter((v) => v > 0).reduce((x, y) => x + y, 0);
    const neg = asSums.filter((v) => v < 0).reduce((x, y) => x + y, 0);
    return {
      skill: '5e-relatifs-somme',
      level,
      prompt: `Calcule $E = ${expr}$.`,
      answer: num(total),
      hint: 'Transforme chaque soustraction en addition de l’opposé, puis regroupe les nombres positifs d’un côté et les négatifs de l’autre.',
      correction: [
        `$E = ${asSums.map((v, i) => (i === 0 ? signedPar(v) : ` + ${signedPar(v)}`)).join('')}$`,
        `Positifs : $${pos}$ ; négatifs : $${neg}$.`,
        `$E = ${pos} + ${par(neg)} = ${total}$`,
      ],
    };
  },
};

const probleme: Skill = {
  id: '5e-relatifs-probleme',
  name: 'Résoudre un problème avec des relatifs',
  generate(rng, level) {
    const kind = level === 1 ? 0 : level === 2 ? rng.pick([0, 1]) : rng.pick([1, 2]);
    if (kind === 0) {
      const start = rng.int(-15, 5);
      const delta = rng.int(3, 18) * rng.sign();
      const end = start + delta;
      return {
        skill: '5e-relatifs-probleme',
        level,
        prompt: `Ce matin, il faisait $${start}\\,^\\circ\\text{C}$ au sommet. La température a ensuite ${delta > 0 ? 'augmenté' : 'baissé'} de $${Math.abs(delta)}\\,^\\circ\\text{C}$. Quelle température fait-il maintenant (en °C) ?`,
        answer: num(end),
        hint: delta > 0 ? 'Une hausse s’ajoute.' : 'Une baisse se soustrait.',
        correction: [`$${par(start)} ${delta > 0 ? '+' : '-'} ${Math.abs(delta)} = ${end}$`, `Il fait $${end}\\,^\\circ\\text{C}$.`],
      };
    }
    if (kind === 1) {
      const low = rng.int(-25, -2);
      const high = rng.int(-1, 20);
      return {
        skill: '5e-relatifs-probleme',
        level,
        prompt: `Cette nuit, la température la plus basse était $${low}\\,^\\circ\\text{C}$ et la plus haute de la journée $${high}\\,^\\circ\\text{C}$. Quel est l'écart de température (en °C) ?`,
        answer: num(high - low),
        hint: 'L’écart est la différence entre la plus haute et la plus basse température.',
        correction: [`$${high} - ${par(low)} = ${high} + ${-low} = ${high - low}$`, `L'écart est de $${high - low}\\,^\\circ\\text{C}$.`],
      };
    }
    // Un plongeur et un oiseau : différence d'altitudes.
    const depth = -rng.int(5, 60);
    const bird = rng.int(5, 80);
    return {
      skill: '5e-relatifs-probleme',
      level,
      prompt: `Un plongeur est à l'altitude $${depth}\\text{ m}$ et une mouette vole à l'altitude $${bird}\\text{ m}$. Combien de mètres les séparent verticalement ?`,
      answer: num(bird - depth),
      hint: 'Calcule la différence des altitudes : la plus haute moins la plus basse.',
      correction: [`$${bird} - ${par(depth)} = ${bird} + ${-depth} = ${bird - depth}$`, `Ils sont séparés de $${bird - depth}\\text{ m}$.`],
    };
  },
};

const reperage: Skill = {
  id: '5e-reperage',
  name: 'Se repérer dans le plan',
  generate(rng, level) {
    const x = rng.int(-6, 6);
    const y = rng.int(-6, 6);
    const dx = rng.nonZero(-7, 7);
    const dy = level === 1 ? 0 : rng.nonZero(-7, 7);
    const horizontal = `${Math.abs(dx)} unité${Math.abs(dx) > 1 ? 's' : ''} vers la ${dx > 0 ? 'droite' : 'gauche'}`;
    const vertical = dy === 0 ? '' : ` puis de ${Math.abs(dy)} unité${Math.abs(dy) > 1 ? 's' : ''} vers le ${dy > 0 ? 'haut' : 'bas'}`;
    if (level === 3 && rng.next() < 0.5) {
      // Dans l'autre sens : retrouver le point de départ.
      return {
        skill: '5e-reperage',
        level,
        prompt: `Un robot s'est déplacé de ${horizontal}${vertical}. Il arrive au point $B(${x}\\,;\\,${y})$. Quelles étaient les coordonnées de son point de départ $A$ ?`,
        answer: { kind: 'pair', values: [frac(x - dx), frac(y - dy)], labels: ['x_A', 'y_A'] },
        hint: 'Fais le chemin à l’envers : ce qui allait vers la droite va vers la gauche, ce qui montait descend.',
        correction: [`Abscisse : $${x} ${dx > 0 ? '-' : '+'} ${Math.abs(dx)} = ${x - dx}$`, `Ordonnée : $${y} ${dy > 0 ? '-' : '+'} ${Math.abs(dy)} = ${y - dy}$`, `$A(${x - dx}\\,;\\,${y - dy})$`],
      };
    }
    return {
      skill: '5e-reperage',
      level,
      prompt: `Un robot part du point $A(${x}\\,;\\,${y})$ et se déplace de ${horizontal}${vertical}. Quelles sont les coordonnées de son point d'arrivée $B$ ?`,
      answer: { kind: 'pair', values: [frac(x + dx), frac(y + dy)], labels: ['x_B', 'y_B'] },
      hint: 'Un déplacement vers la droite ou la gauche change l’abscisse (le premier nombre) ; vers le haut ou le bas, l’ordonnée.',
      correction: [`Abscisse : $${x} ${dx > 0 ? '+' : '-'} ${Math.abs(dx)} = ${x + dx}$`, `Ordonnée : $${dy === 0 ? `${y}` : `${y} ${dy > 0 ? '+' : '-'} ${Math.abs(dy)} = ${y + dy}`}$`, `$B(${x + dx}\\,;\\,${y + dy})$`],
    };
  },
};

export const RELATIFS_SKILLS: Skill[] = [comparer, addition, soustraction, somme, probleme, reperage];
