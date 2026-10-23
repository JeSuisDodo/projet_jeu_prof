import type { GradeId } from '../content/types';
import type { SaveData } from '../game/save';

/**
 * Comptes professeur et élèves. Deux réalisations du même contrat :
 * - `LocalBackend` (mode démo) garde tout dans le navigateur, pour essayer sans serveur ;
 * - `SupabaseBackend` stocke les comptes en ligne (voir `supabase/schema.sql` et `docs/comptes.md`).
 */

export interface Teacher {
  id: string;
  name: string;
  email: string;
}

/** Une partie créée par un professeur : un niveau, une liste d'élèves, un code d'invitation. */
export interface ClassInfo {
  id: string;
  name: string;
  grade: GradeId;
  code: string;
  createdAt: string;
}

/** Ligne d'élève vue par son professeur, avec sa progression. */
export interface StudentRow {
  id: string;
  name: string;
  /** L'élève a rejoint la partie et choisi son mot de passe. */
  joined: boolean;
  progress: SaveData | null;
  updatedAt: string | null;
}

export interface ClassDetail extends ClassInfo {
  students: StudentRow[];
}

/** Ce qu'un élève voit en ouvrant une invitation : la partie et la liste des noms (façon Tricount). */
export interface Roster {
  className: string;
  grade: GradeId;
  teacherName: string;
  students: { id: string; name: string; joined: boolean }[];
}

/** Un élève connecté à une partie. */
export interface StudentSession {
  studentId: string;
  name: string;
  classId: string;
  className: string;
  grade: GradeId;
  code: string;
  progress: SaveData | null;
}

export interface Backend {
  /** « demo » : tout reste sur cet appareil ; « online » : comptes partagés en ligne. */
  readonly mode: 'demo' | 'online';

  // Professeurs
  currentTeacher(): Promise<Teacher | null>;
  signUpTeacher(name: string, email: string, password: string): Promise<Teacher>;
  signInTeacher(email: string, password: string): Promise<Teacher>;
  /** Code à 6 chiffres reçu par e-mail après l'inscription (mode en ligne). */
  confirmEmail(email: string, code: string): Promise<Teacher>;
  resendConfirmation(email: string): Promise<void>;
  signOut(): Promise<void>;
  listClasses(): Promise<(ClassInfo & { total: number; joined: number })[]>;
  createClass(name: string, grade: GradeId, students: string[]): Promise<ClassInfo>;
  getClass(id: string): Promise<ClassDetail>;
  addStudents(classId: string, names: string[]): Promise<void>;
  removeStudent(studentId: string): Promise<void>;
  /** Oubli du mot de passe : l'élève redevient « en attente » et en choisit un nouveau. */
  resetStudent(studentId: string): Promise<void>;
  deleteClass(id: string): Promise<void>;

  // Élèves
  roster(code: string): Promise<Roster>;
  /** Première fois : fixe le mot de passe. Ensuite : le vérifie. */
  joinAsStudent(code: string, studentId: string, password: string): Promise<StudentSession>;
  currentStudent(): Promise<StudentSession | null>;
  saveProgress(progress: SaveData): Promise<void>;
  leaveStudent(): Promise<void>;
}

/** Erreur à afficher telle quelle à l'utilisateur. */
export class AccountError extends Error {}

/** Message de réussite qui interrompt le parcours (« confirme ton adresse e-mail »). */
export class AccountNotice extends AccountError {}

/** Le compte existe mais l'adresse e-mail doit d'abord être confirmée (code ou lien reçu). */
export class EmailToConfirm extends AccountNotice {
  constructor(
    message: string,
    readonly email: string,
  ) {
    super(message);
  }
}
