import { describe, expect, it } from 'vitest';
import { GRADES, allChapters } from '../src/content';
import { Rng } from '../src/exercises/rng';
import { type Answer, type Level, type Response, checkAnswer } from '../src/exercises/types';

/**
 * Vérifications communes à tout le contenu, toutes classes confondues : chaque chapitre ajouté
 * à un `GradeDef` est testé ici automatiquement.
 */

const text = (f: { n: number; d: number }) => (f.d === 1 ? String(f.n) : `${f.n}/${f.d}`);

/** Réponse qu'un élève taperait pour la bonne solution. */
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

describe('contenu de toutes les classes', () => {
  it('a des identifiants uniques (chapitres, compétences, créatures)', () => {
    const seen = new Set<string>();
    const unique = (kind: string, id: string) => {
      expect(seen.has(`${kind}:${id}`), `${kind} en double : ${id}`).toBe(false);
      seen.add(`${kind}:${id}`);
    };
    for (const chapter of allChapters()) {
      unique('chapitre', chapter.id);
      chapter.skills.forEach((s) => unique('compétence', s.id));
      [...chapter.creatures, chapter.boss].forEach((c) => unique('créature', c.id));
    }
  });

  for (const grade of GRADES)
    for (const chapter of grade.chapters) {
      describe(`${grade.name} · ${chapter.title}`, () => {
        it('a 3 à 6 créatures dont les compétences existent dans le chapitre', () => {
          expect(chapter.creatures.length).toBeGreaterThanOrEqual(3);
          expect(chapter.creatures.length).toBeLessThanOrEqual(6);
          const ids = new Set(chapter.skills.map((s) => s.id));
          for (const c of [...chapter.creatures, chapter.boss]) {
            expect(c.skills.length, c.id).toBeGreaterThan(0);
            for (const s of c.skills) expect(ids.has(s), `${c.id} → ${s}`).toBe(true);
          }
          // Chaque compétence du chapitre est posée par au moins une créature.
          const used = new Set([...chapter.creatures, chapter.boss].flatMap((c) => c.skills));
          for (const s of chapter.skills) expect(used.has(s.id), `compétence jamais posée : ${s.id}`).toBe(true);
        });

        for (const skill of chapter.skills)
          it(`${skill.id} : exercices bien formés et bonne réponse acceptée`, () => {
            for (const level of [1, 2, 3] as Level[])
              for (let seed = 1; seed <= 150; seed++) {
                const ex = skill.generate(new Rng(seed * 7919 + level), level);
                const where = `${skill.id} niv. ${level} graine ${seed}`;
                expect(ex.skill, where).toBe(skill.id);
                expect(ex.prompt.trim(), where).not.toBe('');
                expect(ex.correction.length, where).toBeGreaterThan(0);
                expect(ex.prompt, where).not.toMatch(/NaN|undefined|Infinity/);
                expect(ex.correction.join(' '), where).not.toMatch(/NaN|undefined|Infinity/);
                if (ex.answer.kind === 'choice') {
                  expect(new Set(ex.answer.options).size, `${where} : options en double`).toBe(ex.answer.options.length);
                  expect(ex.answer.options.length, where).toBeGreaterThanOrEqual(2);
                }
                expect(checkAnswer(ex.answer, goodResponse(ex.answer)), where).toBe(true);
              }
          });
      });
    }
});
