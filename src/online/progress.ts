import { gradeById } from '../content';
import type { GradeId } from '../content/types';
import type { SaveData } from '../game/save';

/** Bilan d'un chapitre pour le professeur. */
export interface ChapterProgress {
  id: string;
  title: string;
  region: string;
  attempts: number;
  correct: number;
  /** Taux de réussite en %, null si l'élève n'a encore rien tenté. */
  rate: number | null;
  species: number;
  totalSpecies: number;
  badge: boolean;
}

export interface ProgressSummary {
  xp: number;
  attempts: number;
  correct: number;
  rate: number | null;
  badges: number;
  chapters: ChapterProgress[];
  /** Compétences les plus ratées (au moins 3 essais), pour savoir quoi retravailler. */
  weakSkills: { id: string; name: string; chapter: string; rate: number; attempts: number }[];
}

const pct = (correct: number, attempts: number) => (attempts ? Math.round((100 * correct) / attempts) : null);

/** Résume une sauvegarde d'élève selon les chapitres du niveau de la partie. */
export function summarize(save: SaveData | null, grade: GradeId): ProgressSummary {
  const chapters = gradeById(grade).chapters;
  let attempts = 0;
  let correct = 0;
  const weak: ProgressSummary['weakSkills'] = [];
  const rows = chapters.map((c): ChapterProgress => {
    let a = 0;
    let ok = 0;
    for (const s of c.skills) {
      const st = save?.skills[s.id];
      if (!st) continue;
      a += st.attempts;
      ok += st.correct;
      if (st.attempts >= 3) weak.push({ id: s.id, name: s.name, chapter: c.title, rate: pct(st.correct, st.attempts)!, attempts: st.attempts });
    }
    attempts += a;
    correct += ok;
    return {
      id: c.id,
      title: c.title,
      region: c.region,
      attempts: a,
      correct: ok,
      rate: pct(ok, a),
      species: c.creatures.filter((x) => (save?.captures[x.id] ?? 0) > 0).length,
      totalSpecies: c.creatures.length,
      badge: save?.badges.includes(c.id) ?? false,
    };
  });
  weak.sort((x, y) => x.rate - y.rate || y.attempts - x.attempts);
  return {
    xp: save?.xp ?? 0,
    attempts,
    correct,
    rate: pct(correct, attempts),
    badges: rows.filter((r) => r.badge).length,
    chapters: rows,
    weakSkills: weak.filter((w) => w.rate < 70).slice(0, 5),
  };
}

/** « il y a 3 min », « hier », « le 12/10 ». */
export function sinceText(iso: string | null, now = Date.now()): string {
  if (!iso) return 'jamais';
  const ms = now - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return 'à l’instant';
  if (min < 60) return `il y a ${min} min`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'hier';
  if (days < 7) return `il y a ${days} jours`;
  return `le ${new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`;
}
