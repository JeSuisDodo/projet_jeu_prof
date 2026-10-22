import type { Skill } from '../types';
import { frac } from '../fraction';
import { fixedChoice, num, par } from './outils';

/** 5e : algorithmique et programmation (blocs de type Scratch écrits en texte). */

const POLYGONES: Record<number, string> = { 3: 'Un triangle équilatéral', 4: 'Un carré', 5: 'Un pentagone régulier', 6: 'Un hexagone régulier', 8: 'Un octogone régulier', 10: 'Un décagone régulier' };

const polygone: Skill = {
  id: '5e-algo-polygone',
  name: 'Tracer un polygone régulier avec une boucle',
  generate(rng, level) {
    const n = rng.pick(level === 1 ? [3, 4, 6] : [3, 4, 5, 6, 8, 10]);
    const angle = 360 / n;
    const side = rng.int(3, 12) * 10;
    const mode = level === 1 ? rng.pick([0, 1]) : level === 2 ? rng.pick([0, 1, 2]) : rng.pick([1, 2, 3]);
    if (mode === 0) {
      return {
        skill: '5e-algo-polygone',
        level,
        prompt: `Le lutin exécute : « répéter ${n} fois : avancer de ${side} pas ; tourner de ${angle} degrés ». Quelle figure trace-t-il ?`,
        answer: fixedChoice(Object.values(POLYGONES), Object.keys(POLYGONES).indexOf(String(n))),
        hint: 'Compte le nombre de côtés tracés : c’est le nombre de répétitions.',
        correction: [`Il trace ${n} côtés de même longueur en tournant de $${angle}^\\circ$ à chaque fois.`, `${POLYGONES[n]}.`],
      };
    }
    if (mode === 1) {
      return {
        skill: '5e-algo-polygone',
        level,
        prompt: `Pour tracer ${POLYGONES[n].toLowerCase()}, le lutin répète ${n} fois : « avancer de ${side} pas ; tourner de … degrés ». Quel angle faut-il écrire ?`,
        answer: num(angle),
        hint: 'Le lutin fait un tour complet ($360^\\circ$) en revenant à son point de départ.',
        correction: [`$360 \\div ${n} = ${angle}$`, `Il faut tourner de $${angle}^\\circ$.`],
      };
    }
    if (mode === 2) {
      return {
        skill: '5e-algo-polygone',
        level,
        prompt: `Le lutin exécute : « répéter ${n} fois : avancer de ${side} pas ; tourner de ${angle} degrés ». Combien de pas a-t-il parcourus en tout ?`,
        answer: num(n * side),
        hint: 'Chaque répétition fait avancer le lutin du même nombre de pas.',
        correction: [`$${n} \\times ${side} = ${n * side}$ pas.`],
      };
    }
    const turn = rng.pick([30, 36, 40, 45, 60, 72, 90, 120]);
    return {
      skill: '5e-algo-polygone',
      level,
      prompt: `Le lutin répète « avancer de ${side} pas ; tourner de ${turn} degrés » jusqu'à revenir pour la première fois à son point de départ. Combien de côtés a la figure tracée ?`,
      answer: num(360 / turn),
      hint: 'Il revient au départ après avoir tourné de $360^\\circ$ au total.',
      correction: [`$360 \\div ${turn} = ${360 / turn}$`, `La figure a ${360 / turn} côtés.`],
    };
  },
};

const variable: Skill = {
  id: '5e-algo-variable',
  name: 'Suivre l’évolution d’une variable',
  generate(rng, level) {
    const a = rng.int(0, 10);
    const b = rng.int(2, 9);
    const k = rng.int(2, level === 1 ? 5 : 10);
    if (level === 1) {
      return {
        skill: '5e-algo-variable',
        level,
        prompt: `Voici un script : « mettre score à ${a} ; répéter ${k} fois : ajouter ${b} à score ». Que vaut score à la fin ?`,
        answer: num(a + k * b),
        hint: 'À chaque tour de boucle, score augmente du même nombre.',
        correction: [`score augmente de $${b}$ à chaque tour, ${k} fois : $${a} + ${k} \\times ${b} = ${a + k * b}$.`],
      };
    }
    if (level === 2) {
      const c = rng.int(1, 4);
      const kk = rng.int(2, 5);
      let x = c;
      const trace = [c];
      for (let i = 0; i < kk; i++) {
        x = x * 2;
        trace.push(x);
      }
      return {
        skill: '5e-algo-variable',
        level,
        prompt: `Voici un script : « mettre x à ${c} ; répéter ${kk} fois : mettre x à (x × 2) ». Que vaut x à la fin ?`,
        answer: num(x),
        hint: 'Écris la valeur de x après chaque tour de boucle.',
        correction: [`Valeurs successives de x : $${trace.join(' \\to ')}$.`, `À la fin, $x = ${x}$.`],
      };
    }
    // Deux variables : un compteur et une somme.
    const n = rng.int(3, 8);
    const sum = (n * (n + 1)) / 2;
    return {
      skill: '5e-algo-variable',
      level,
      prompt: `Voici un script : « mettre somme à 0 ; mettre i à 1 ; répéter ${n} fois : ajouter i à somme, puis ajouter 1 à i ». Que vaut somme à la fin ?`,
      answer: num(sum),
      hint: 'i prend successivement les valeurs 1, 2, 3… et chacune est ajoutée à somme.',
      correction: [`somme $= ${Array.from({ length: n }, (_, i) => i + 1).join(' + ')} = ${sum}$`],
    };
  },
};

const condition: Skill = {
  id: '5e-algo-condition',
  name: 'Exécuter une instruction conditionnelle',
  generate(rng, level) {
    const x = rng.int(1, 20);
    const s = rng.int(5, 15);
    const p = rng.int(2, 9);
    const q = rng.int(2, 9);
    if (level === 1) {
      const bigger = x > s;
      return {
        skill: '5e-algo-condition',
        level,
        prompt: `On choisit le nombre ${x}. Le script dit : « si nombre > ${s} alors dire Gagné, sinon dire Perdu ». Que dit le lutin ?`,
        answer: fixedChoice(['Gagné', 'Perdu'], bigger ? 0 : 1),
        hint: 'Compare le nombre choisi à la valeur du test.',
        correction: [`$${x} ${bigger ? '>' : '\\leq'} ${s}$, donc le lutin dit « ${bigger ? 'Gagné' : 'Perdu'} ».`],
      };
    }
    if (level === 2) {
      const r = x > s ? x * p : x + q;
      return {
        skill: '5e-algo-condition',
        level,
        prompt: `On choisit le nombre ${x}. Le script : « si nombre > ${s} alors mettre résultat à (nombre × ${p}), sinon mettre résultat à (nombre + ${q}) ». Que vaut résultat ?`,
        answer: num(r),
        hint: 'Teste d’abord la condition, puis effectue uniquement le calcul de la branche choisie.',
        correction: [x > s ? `$${x} > ${s}$ : résultat $= ${x} \\times ${p} = ${r}$.` : `$${x} \\leq ${s}$ : résultat $= ${x} + ${q} = ${r}$.`],
      };
    }
    // Une boucle avec une condition : on compte les multiples de 3.
    const start = rng.int(1, 10);
    const count = rng.int(4, 9);
    const values = Array.from({ length: count }, (_, i) => start + i);
    const kept = values.filter((v) => v % 3 === 0);
    const score = kept.length * p;
    return {
      skill: '5e-algo-condition',
      level,
      prompt: `Script : « mettre score à 0 ; mettre n à ${start} ; répéter ${count} fois : si n est un multiple de 3 alors ajouter ${p} à score ; ajouter 1 à n ». Que vaut score à la fin ?`,
      answer: num(score),
      hint: `n prend les valeurs ${start}, ${start + 1}, … ${start + count - 1} : repère les multiples de 3.`,
      correction: [
        kept.length ? `Multiples de 3 parmi $${values.join(' ; ')}$ : $${kept.join(' ; ')}$.` : `Aucun multiple de 3 parmi $${values.join(' ; ')}$.`,
        `score $= ${kept.length} \\times ${p} = ${score}$`,
      ],
    };
  },
};

const deplacement: Skill = {
  id: '5e-algo-deplacement',
  name: 'Suivre la position du lutin',
  generate(rng, level) {
    const x0 = rng.int(-10, 10) * 10;
    const y0 = rng.int(-10, 10) * 10;
    const dx = rng.nonZero(-9, 9) * 10;
    const dy = rng.nonZero(-9, 9) * 10;
    const k = level === 1 ? 1 : rng.int(2, level === 2 ? 4 : 6);
    const loop = k === 1 ? `ajouter ${dx} à x ; ajouter ${dy} à y` : `répéter ${k} fois : ajouter ${dx} à x ; ajouter ${dy} à y`;
    const x = x0 + k * dx;
    const y = y0 + k * dy;
    return {
      skill: '5e-algo-deplacement',
      level,
      prompt: `Le lutin est placé en $(${x0}\\,;\\,${y0})$. Il exécute : « ${loop} ». Quelles sont ses coordonnées à la fin ?`,
      answer: { kind: 'pair', values: [frac(x), frac(y)], labels: ['x', 'y'] },
      hint: '« ajouter à x » le déplace horizontalement, « ajouter à y » verticalement ; un nombre négatif le fait reculer ou descendre.',
      correction: [`$x = ${x0} + ${k === 1 ? '' : `${k} \\times `}${par(dx)} = ${x}$`, `$y = ${y0} + ${k === 1 ? '' : `${k} \\times `}${par(dy)} = ${y}$`],
    };
  },
};

export const PROGRAMMATION_SKILLS: Skill[] = [polygone, variable, condition, deplacement];
