import katex from 'katex';
import { expect } from 'vitest';
import { Rng } from '../../src/exercises/rng';
import { type Answer, type Exercise, type Level, type Response, type Skill, checkAnswer } from '../../src/exercises/types';
import { type SkillVarie, genererVariante } from '../../src/exercises/varier';

/** Outils de test communs aux variantes d'exercices (voir src/exercises/varier.ts). */

export const variantesDe = (skills: Skill[]) =>
  skills.flatMap((s) => ((s as SkillVarie).variantes ?? []).map((v) => ({ skill: s, nom: v.nom })));

/** Tirages d'une variante précise, sur les trois niveaux. */
export function* tirages(skills: Skill[], id: string, nom: string, count = 80): Generator<Exercise> {
  const skill = skills.find((s) => s.id === id);
  if (!skill) throw new Error(`Compétence inconnue : ${id}`);
  for (const level of [1, 2, 3] as Level[])
    for (let seed = 1; seed <= count; seed++) yield genererVariante(skill, nom, new Rng(seed * 7727 + level), level);
}

const text = (f: { n: number; d: number }) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);

function goodResponse(answer: Answer): Response {
  switch (answer.kind) {
    case 'number':
      return text(answer.value);
    case 'set':
      return answer.values.length ? answer.values.map(text).join(' ; ') : 'aucune';
    case 'pair':
      return [text(answer.values[0]), text(answer.values[1])];
    case 'choice':
      return answer.correct;
  }
}

function badResponse(answer: Answer): Response {
  switch (answer.kind) {
    case 'number':
      return String(answer.value.n / answer.value.d + 1000);
    case 'set':
      return answer.values.length ? '1000' : '0';
    case 'pair':
      return ['1000', '1000'];
    case 'choice':
      return (answer.correct + 1) % answer.options.length;
  }
}

/** Contrôles de forme communs : textes propres, KaTeX valide, bonne réponse acceptée, mauvaise refusée. */
export function verifierForme(ex: Exercise, where: string) {
  const texts = [ex.prompt, ex.hint, ...ex.correction, ...(ex.answer.kind === 'choice' ? ex.answer.options : [])];
  const all = texts.join(' ');
  expect(all, where).not.toMatch(/NaN|undefined|Infinity|\[object|\+ -|- -/);
  expect(ex.correction.length, where).toBeGreaterThan(0);
  for (const t of texts) {
    const parts = t.split('$');
    expect(parts.length % 2, `$ non appariés : ${where} : ${t}`).toBe(1);
    parts.forEach((part, i) => {
      if (i % 2) expect(() => katex.renderToString(part, { throwOnError: true }), `${where} : ${part}`).not.toThrow();
    });
  }
  if (ex.answer.kind === 'choice') {
    expect(new Set(ex.answer.options).size, `${where} : options en double`).toBe(ex.answer.options.length);
    expect(ex.answer.correct, where).toBeGreaterThanOrEqual(0);
  }
  expect(checkAnswer(ex.answer, goodResponse(ex.answer)), where).toBe(true);
  expect(checkAnswer(ex.answer, badResponse(ex.answer)), where).toBe(false);
}

/** Toutes les variantes d'une liste de compétences passent les contrôles de forme et se rejouent à l'identique. */
export function verifierToutesLesVariantes(skills: Skill[], count = 60) {
  for (const { skill, nom } of variantesDe(skills)) {
    for (const ex of tirages(skills, skill.id, nom, count)) verifierForme(ex, `${skill.id} / ${nom} niv. ${ex.level} : ${ex.prompt}`);
    expect(genererVariante(skill, nom, new Rng(42), 2)).toEqual(genererVariante(skill, nom, new Rng(42), 2));
  }
}

/** Nombre décimal écrit « 2{,}5 » ou « 2,5 » → 2.5. */
export const lireNombre = (s: string) => Number(s.replace('{,}', '.').replace(',', '.').replace(/\s/g, ''));

/** Valeur numérique d'une réponse de type nombre. */
export function valeur(ex: Exercise): number {
  if (ex.answer.kind !== 'number') throw new Error(`réponse non numérique : ${ex.prompt}`);
  return ex.answer.value.n / ex.answer.value.d;
}

/** Texte de l'option juste d'un QCM. */
export function optionJuste(ex: Exercise): string {
  if (ex.answer.kind !== 'choice') throw new Error(`pas un QCM : ${ex.prompt}`);
  return ex.answer.options[ex.answer.correct];
}

/** Nombres entiers (ou décimaux) écrits entre $…$ seuls, dans l'ordre. */
export const nombres = (s: string) => [...s.matchAll(/\$(-?\d+(?:\{,\}\d+)?)\$/g)].map((m) => lireNombre(m[1]));
