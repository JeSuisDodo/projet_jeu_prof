import { AccountError } from './types';

/** Lettres et chiffres sans ambiguïté (pas de O/0, I/1/L) : un code se dicte en classe. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const CODE_LENGTH = 6;

export function newCode(random: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return code;
}

/** « abc 23-4 » → « ABC234 ». Rend null si ce n'est pas un code possible. */
export function normalizeCode(raw: string): string | null {
  const code = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== CODE_LENGTH) return null;
  return [...code].every((c) => CODE_ALPHABET.includes(c)) ? code : null;
}

/** Nom propre : espaces superflus retirés, longueur raisonnable. */
export const cleanName = (raw: string) => raw.replace(/\s+/g, ' ').trim().slice(0, 60);

/**
 * Liste d'élèves collée par le professeur : un élève par ligne (ou séparés par des points-virgules),
 * lignes vides et doublons retirés. L'ordre est gardé.
 */
export function parseNames(text: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of text.split(/[\n;]+/)) {
    const name = cleanName(part);
    const key = name.toLocaleLowerCase('fr');
    if (!name || seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

/** Tri alphabétique à la française (accents, majuscules). */
export const byName = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });

export const MIN_STUDENT_PASSWORD = 4;
export const MIN_TEACHER_PASSWORD = 8;

export function checkStudentPassword(password: string): void {
  if (password.length < MIN_STUDENT_PASSWORD) throw new AccountError(`Le mot de passe doit faire au moins ${MIN_STUDENT_PASSWORD} caractères.`);
}

export function checkTeacherPassword(password: string): void {
  if (password.length < MIN_TEACHER_PASSWORD) throw new AccountError(`Le mot de passe doit faire au moins ${MIN_TEACHER_PASSWORD} caractères.`);
}

export const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Lien d'invitation : l'adresse du jeu suivie de « ?partie=CODE ». */
export function inviteLink(code: string, base: string = location.href): string {
  const url = new URL(base);
  url.search = '';
  url.hash = '';
  url.searchParams.set('partie', code);
  return url.toString();
}

/** Code d'invitation présent dans l'adresse, s'il y en a un. */
export function codeFromUrl(href: string = location.href): string | null {
  const raw = new URL(href).searchParams.get('partie');
  return raw ? normalizeCode(raw) : null;
}
