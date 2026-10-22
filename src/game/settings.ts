/** Réglages de l'appareil (son, animations, taille du texte), indépendants de la partie en cours. */
export interface Settings {
  /** Volumes entre 0 et 1. */
  music: number;
  effects: number;
  muted: boolean;
  calm: boolean;
  bigText: boolean;
}

const KEY = 'mathoria-settings-v1';

const systemCalm = () =>
  typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

export const defaultSettings = (): Settings => ({ music: 0.5, effects: 0.7, muted: false, calm: systemCalm(), bigText: false });

const clamp01 = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : fallback);

/** Complète et borne des réglages lus ailleurs (ancienne version, valeurs modifiées à la main…). */
export function sanitizeSettings(raw: unknown): Settings {
  const d = defaultSettings();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Partial<Record<keyof Settings, unknown>>;
  return {
    music: clamp01(r.music, d.music),
    effects: clamp01(r.effects, d.effects),
    muted: typeof r.muted === 'boolean' ? r.muted : d.muted,
    calm: typeof r.calm === 'boolean' ? r.calm : d.calm,
    bigText: typeof r.bigText === 'boolean' ? r.bigText : d.bigText,
  };
}

export function loadSettings(): Settings {
  try {
    return sanitizeSettings(JSON.parse(localStorage.getItem(KEY) ?? 'null'));
  } catch {
    return defaultSettings();
  }
}

export function storeSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Navigation privée ou stockage plein : les réglages valent pour cette session seulement.
  }
}
