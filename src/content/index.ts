import type { Skill } from '../exercises/types';
import { PREMIERE } from './premiere';
import { SECONDE } from './seconde';
import { TERMINALE } from './terminale';
import type { ChapterDef, CreatureDef, GradeDef, GradeId } from './types';

/** Toutes les classes du jeu, dans l'ordre de l'accueil. */
export const GRADES: GradeDef[] = [SECONDE, PREMIERE, TERMINALE];

export const allChapters = (): ChapterDef[] => GRADES.flatMap((g) => g.chapters);

export const gradeById = (id: GradeId): GradeDef => GRADES.find((g) => g.id === id)!;

export function chapterById(id: string): ChapterDef | undefined {
  return allChapters().find((c) => c.id === id);
}

export function skillById(id: string): Skill {
  for (const chapter of allChapters()) {
    const skill = chapter.skills.find((s) => s.id === id);
    if (skill) return skill;
  }
  throw new Error(`Compétence inconnue : ${id}`);
}

export function creatureById(id: string): CreatureDef & { boss: boolean } {
  for (const chapter of allChapters()) {
    if (chapter.boss.id === id) return { ...chapter.boss, boss: true };
    const c = chapter.creatures.find((x) => x.id === id);
    if (c) return { ...c, boss: false };
  }
  throw new Error(`Créature inconnue : ${id}`);
}

export type { ChapterDef, CreatureDef, GradeDef, GradeId };
