import type { Rng } from '../exercises/rng';

export interface SkillStats {
  attempts: number;
  correct: number;
  /** Date (ms) de la dernière réussite, pour espacer les révisions. */
  lastSuccess?: number;
}

export interface SaveData {
  version: 1;
  pseudo: string;
  classLevel: '1re-spe';
  xp: number;
  captures: Record<string, number>;
  skills: Record<string, SkillStats>;
  badges: string[];
}

const KEY = 'mathoria-save-v1';

export function newSave(pseudo: string): SaveData {
  return { version: 1, pseudo, classLevel: '1re-spe', xp: 0, captures: {}, skills: {}, badges: [] };
}

/** Lecture tolérante : stockage indisponible ou sauvegarde abîmée = pas de sauvegarde. */
export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    return data.version === 1 ? data : null;
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

export const speciesCaught = (save: SaveData) => Object.values(save.captures).filter((n) => n > 0).length;

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
