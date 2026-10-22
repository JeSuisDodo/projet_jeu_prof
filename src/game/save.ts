import type { GradeId } from '../content/types';
import type { Rng } from '../exercises/rng';

export interface SkillStats {
  attempts: number;
  correct: number;
  /** Date (ms) de la dernière réussite, pour espacer les révisions. */
  lastSuccess?: number;
}

export interface SaveData {
  version: 2;
  pseudo: string;
  /** Île choisie (classe de l'élève) et région où il se trouve (identifiant de chapitre). */
  grade: GradeId;
  region: string;
  xp: number;
  /** Captures par créature, toutes régions confondues. */
  captures: Record<string, number>;
  skills: Record<string, SkillStats>;
  /** Régions dont le gardien a été battu (identifiants de chapitre). */
  badges: string[];
}

const KEY = 'mathoria-save-v1';

export function newSave(pseudo: string, grade: GradeId, region: string): SaveData {
  return { version: 2, pseudo, grade, region, xp: 0, captures: {}, skills: {}, badges: [] };
}

/** Sauvegarde du prototype (une seule région, le Volcan du Second degré). */
interface SaveV1 {
  version: 1;
  pseudo: string;
  xp: number;
  captures: Record<string, number>;
  skills: Record<string, SkillStats>;
  badges: string[];
}

export function migrate(data: SaveV1 | SaveData): SaveData | null {
  if (data.version === 2) return data;
  if (data.version !== 1) return null;
  return {
    version: 2,
    pseudo: data.pseudo,
    grade: '1re-spe',
    region: '1re-second-degre',
    xp: data.xp,
    captures: data.captures,
    skills: data.skills,
    badges: data.badges.map((b) => (b === 'volcan' ? '1re-second-degre' : b)),
  };
}

/** Lecture tolérante : stockage indisponible ou sauvegarde abîmée = pas de sauvegarde. */
export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw) as SaveV1 | SaveData);
  } catch {
    return null;
  }
}

export function storeSave(save: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    // Navigation privée ou stockage plein : la partie continue sans sauvegarde.
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Rien à faire.
  }
}

export function recordAttempt(save: SaveData, skill: string, ok: boolean, now = Date.now()): void {
  const stats = (save.skills[skill] ??= { attempts: 0, correct: 0 });
  stats.attempts++;
  if (ok) {
    stats.correct++;
    stats.lastSuccess = now;
  }
}

/** Nombre d'espèces capturées parmi une liste (les créatures d'une région, par exemple). */
export const speciesCaught = (save: SaveData, ids: string[]) => ids.filter((id) => (save.captures[id] ?? 0) > 0).length;

const DAY = 24 * 60 * 60 * 1000;

/**
 * Choisit la compétence du prochain exercice : les compétences jamais vues ou souvent ratées
 * reviennent plus souvent, celles réussies récemment moins (répétition espacée).
 */
export function pickSkill(save: SaveData, skills: string[], rng: Rng, now = Date.now()): string {
  const weights = skills.map((id) => {
    const s = save.skills[id];
    if (!s || s.attempts === 0) return 3;
    const failure = 1 - s.correct / s.attempts;
    const recent = s.lastSuccess !== undefined && now - s.lastSuccess < DAY ? 0.5 : 1;
    return (1 + 3 * failure) * recent;
  });
  let roll = rng.next() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < skills.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return skills[i];
  }
  return skills[skills.length - 1];
}
