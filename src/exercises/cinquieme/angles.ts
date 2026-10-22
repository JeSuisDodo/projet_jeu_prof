import type { Skill } from '../types';
import { deg, dec, num, yesNo } from './outils';

/** 5e : angles adjacents, complémentaires, supplémentaires, opposés par le sommet ; angles et parallélisme. */

const complementaire: Skill = {
  id: '5e-complementaire-supplementaire',
  name: 'Calculer un angle complémentaire ou supplémentaire',
  generate(rng, level) {
    const supp = level === 1 ? rng.next() < 0.5 : rng.next() < 0.6;
    const x = supp ? rng.int(5, 175) : rng.int(5, 85);
    const v = level === 3 ? x + 0.5 : x;
    const total = supp ? 180 : 90;
    return {
      skill: '5e-complementaire-supplementaire',
      level,
      prompt: `Un angle mesure $${deg(v)}$. Combien mesure un angle qui lui est ${supp ? 'supplémentaire' : 'complémentaire'} (en degrés) ?`,
      answer: num(total - v),
      hint: supp ? 'Deux angles supplémentaires ont une somme de $180^\\circ$.' : 'Deux angles complémentaires ont une somme de $90^\\circ$.',
      correction: [`$${total} - ${dec(v)} = ${dec(total - v)}$`],
    };
  },
};

const opposes: Skill = {
  id: '5e-angles-opposes',
  name: 'Utiliser les angles opposés par le sommet',
  generate(rng, level) {
    const x = rng.int(15, 165);
    const ask = level === 1 ? 'oppose' : rng.pick(['oppose', 'adjacent']);
    if (level === 3) {
      // Trois droites concourantes : la troisième coupe un angle en deux.
      const a = rng.int(20, 80);
      const b = rng.int(20, 80);
      const c = 180 - a - b;
      return {
        skill: '5e-angles-opposes',
        level,
        prompt: `Trois droites passent par un même point $O$ et forment six angles. Deux angles voisins mesurent $${deg(a)}$ et $${deg(b)}$. Combien mesure le troisième angle voisin, qui complète le demi-tour (en degrés) ?`,
        answer: num(c),
        hint: 'Trois angles voisins qui forment un angle plat ont une somme de $180^\\circ$.',
        correction: [`$180 - ${a} - ${b} = ${c}$`, `Par ailleurs, chaque angle est égal à son opposé par le sommet.`],
      };
    }
    const value = ask === 'oppose' ? x : 180 - x;
    return {
      skill: '5e-angles-opposes',
      level,
      prompt: `Deux droites sécantes en $O$ forment un angle de $${deg(x)}$. Combien mesure l'angle ${ask === 'oppose' ? 'qui lui est opposé par le sommet' : 'qui lui est adjacent (son voisin)'} (en degrés) ?`,
      answer: num(value),
      hint: ask === 'oppose' ? 'Deux angles opposés par le sommet ont la même mesure.' : 'Deux angles adjacents formés par deux droites sécantes sont supplémentaires.',
      correction: ask === 'oppose' ? [`Les angles opposés par le sommet sont égaux : $${deg(x)}$.`] : [`Ils forment un angle plat : $180 - ${x} = ${value}$.`],
    };
  },
};

const alternes: Skill = {
  id: '5e-angles-paralleles',
  name: 'Calculer un angle avec des droites parallèles',
  generate(rng, level) {
    const x = rng.int(25, 155);
    const kinds = level === 1 ? ['alterne', 'correspondant'] : level === 2 ? ['alterne', 'correspondant', 'adjacent-alterne'] : ['adjacent-alterne', 'adjacent-correspondant', 'oppose-correspondant'];
    const kind = rng.pick(kinds);
    const lines = 'Les droites $(d)$ et $(d\')$ sont parallèles et coupées par une sécante $(s)$.';
    const texts: Record<string, [string, number, string[]]> = {
      alterne: [`Un angle mesure $${deg(x)}$. Combien mesure l'angle alterne-interne associé (en degrés) ?`, x, ['Deux droites parallèles forment des angles alternes-internes égaux.']],
      correspondant: [`Un angle mesure $${deg(x)}$. Combien mesure l'angle correspondant associé (en degrés) ?`, x, ['Deux droites parallèles forment des angles correspondants égaux.']],
      'adjacent-alterne': [
        `Un angle mesure $${deg(x)}$. Combien mesure l'angle adjacent (supplémentaire) à son alterne-interne (en degrés) ?`,
        180 - x,
        [`L'alterne-interne mesure $${deg(x)}$ (droites parallèles).`, `Son adjacent mesure $180 - ${x} = ${180 - x}$ degrés.`],
      ],
      'adjacent-correspondant': [
        `Un angle mesure $${deg(x)}$. Combien mesure l'angle adjacent (supplémentaire) à son correspondant (en degrés) ?`,
        180 - x,
        [`Le correspondant mesure $${deg(x)}$ (droites parallèles).`, `Son adjacent mesure $180 - ${x} = ${180 - x}$ degrés.`],
      ],
      'oppose-correspondant': [
        `Un angle mesure $${deg(x)}$. Combien mesure l'angle opposé par le sommet à son correspondant (en degrés) ?`,
        x,
        [`Le correspondant mesure $${deg(x)}$ (droites parallèles).`, `Les angles opposés par le sommet sont égaux : $${deg(x)}$.`],
      ],
    };
    const [text, value, correction] = texts[kind];
    return {
      skill: '5e-angles-paralleles',
      level,
      prompt: `${lines} ${text}`,
      answer: num(value),
      hint: 'Avec des droites parallèles, les angles alternes-internes sont égaux, et les angles correspondants aussi.',
      correction,
    };
  },
};

const paralleles: Skill = {
  id: '5e-prouver-paralleles',
  name: 'Prouver que deux droites sont parallèles',
  generate(rng, level) {
    const x = rng.int(25, 155);
    const yes = rng.next() < 0.5;
    const off = level === 3 ? rng.pick([0.5, 1, 2]) : rng.int(2, 10);
    const y = yes ? x : x + off * rng.sign();
    const kind = rng.pick(['alternes-internes', 'correspondants']);
    return {
      skill: '5e-prouver-paralleles',
      level,
      prompt: `Deux droites $(d)$ et $(d')$ sont coupées par une sécante. Deux angles ${kind} mesurent $${deg(x)}$ et $${deg(y)}$. Les droites $(d)$ et $(d')$ sont-elles parallèles ?`,
      answer: yesNo(yes),
      hint: `Si deux droites forment des angles ${kind} égaux, elles sont parallèles. Sinon, elles ne le sont pas.`,
      correction: yes ? [`Les angles ${kind} sont égaux.`, `Donc $(d)$ et $(d')$ sont parallèles.`] : [`$${dec(x)} \\neq ${dec(y)}$ : les angles ${kind} ne sont pas égaux.`, `Donc $(d)$ et $(d')$ ne sont pas parallèles.`],
    };
  },
};

export const ANGLES_SKILLS: Skill[] = [complementaire, opposes, alternes, paralleles];
