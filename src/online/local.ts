import type { GradeId } from '../content/types';
import type { SaveData } from '../game/save';
import { AccountError, type Backend, type ClassDetail, type ClassInfo, type Roster, type StudentSession, type Teacher } from './types';
import { byName, checkStudentPassword, checkTeacherPassword, cleanName, newCode, normalizeCode, validEmail } from './util';

/** Le strict nécessaire de `localStorage`, pour pouvoir tester sans navigateur. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

interface Secret {
  salt: string;
  hash: string;
}

interface DemoData {
  teachers: (Teacher & Secret)[];
  classes: (ClassInfo & { teacherId: string })[];
  students: { id: string; classId: string; name: string; secret: Secret | null; progress: SaveData | null; updatedAt: string | null }[];
}

interface DemoSession {
  teacherId?: string;
  studentId?: string;
}

const DATA_KEY = 'mathoria-demo-comptes-v1';
const SESSION_KEY = 'mathoria-demo-session-v1';

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

async function hashPassword(password: string, salt = hex(crypto.getRandomValues(new Uint8Array(16)).buffer)): Promise<Secret> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100_000, hash: 'SHA-256' }, key, 256);
  return { salt, hash: hex(bits) };
}

const matches = async (password: string, secret: Secret) => (await hashPassword(password, secret.salt)).hash === secret.hash;

/**
 * Mode démo : comptes, parties et progression restent dans ce navigateur. Utile pour essayer
 * le parcours complet (le prof crée une partie, l'élève la rejoint dans un autre onglet) avant
 * de brancher le service en ligne.
 */
export class LocalBackend implements Backend {
  readonly mode = 'demo';

  constructor(private store: KeyValueStore) {}

  private read(): DemoData {
    try {
      const raw = this.store.getItem(DATA_KEY);
      if (raw) return JSON.parse(raw) as DemoData;
    } catch {
      // Données abîmées : on repart de zéro.
    }
    return { teachers: [], classes: [], students: [] };
  }

  private write(data: DemoData): void {
    this.store.setItem(DATA_KEY, JSON.stringify(data));
  }

  private session(): DemoSession {
    try {
      return JSON.parse(this.store.getItem(SESSION_KEY) ?? '{}') as DemoSession;
    } catch {
      return {};
    }
  }

  private setSession(patch: DemoSession): void {
    this.store.setItem(SESSION_KEY, JSON.stringify({ ...this.session(), ...patch }));
  }

  private teacherOrThrow(data: DemoData): Teacher & Secret {
    const t = data.teachers.find((x) => x.id === this.session().teacherId);
    if (!t) throw new AccountError('Connecte-toi d’abord à ton compte professeur.');
    return t;
  }

  private ownClass(data: DemoData, classId: string) {
    const teacher = this.teacherOrThrow(data);
    const c = data.classes.find((x) => x.id === classId && x.teacherId === teacher.id);
    if (!c) throw new AccountError('Partie introuvable.');
    return c;
  }

  private ownStudent(data: DemoData, studentId: string) {
    const s = data.students.find((x) => x.id === studentId);
    if (!s) throw new AccountError('Élève introuvable.');
    this.ownClass(data, s.classId);
    return s;
  }

  async currentTeacher(): Promise<Teacher | null> {
    const t = this.read().teachers.find((x) => x.id === this.session().teacherId);
    return t ? { id: t.id, name: t.name, email: t.email } : null;
  }

  async signUpTeacher(name: string, email: string, password: string): Promise<Teacher> {
    name = cleanName(name);
    email = email.trim().toLowerCase();
    if (!name) throw new AccountError('Indique ton nom.');
    if (!validEmail(email)) throw new AccountError('Adresse e-mail invalide.');
    checkTeacherPassword(password);
    const data = this.read();
    if (data.teachers.some((t) => t.email === email)) throw new AccountError('Un compte existe déjà avec cette adresse.');
    const teacher = { id: crypto.randomUUID(), name, email, ...(await hashPassword(password)) };
    data.teachers.push(teacher);
    this.write(data);
    this.setSession({ teacherId: teacher.id });
    return { id: teacher.id, name, email };
  }

  async signInTeacher(email: string, password: string): Promise<Teacher> {
    const t = this.read().teachers.find((x) => x.email === email.trim().toLowerCase());
    if (!t || !(await matches(password, t))) throw new AccountError('Adresse ou mot de passe incorrect.');
    this.setSession({ teacherId: t.id });
    return { id: t.id, name: t.name, email: t.email };
  }

  async waitForConfirmation(): Promise<Teacher> {
    throw new AccountError('Pas de confirmation par e-mail en mode démo.');
  }

  async resendConfirmation(): Promise<void> {}

  async signOut(): Promise<void> {
    this.setSession({ teacherId: undefined });
  }

  async listClasses() {
    const data = this.read();
    const teacher = this.teacherOrThrow(data);
    return data.classes
      .filter((c) => c.teacherId === teacher.id)
      .map(({ teacherId: _, ...c }) => {
        const students = data.students.filter((s) => s.classId === c.id);
        return { ...c, total: students.length, joined: students.filter((s) => s.secret).length };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createClass(name: string, grade: GradeId, students: string[]): Promise<ClassInfo> {
    name = cleanName(name);
    if (!name) throw new AccountError('Donne un nom à la partie.');
    const data = this.read();
    const teacher = this.teacherOrThrow(data);
    let code = newCode();
    while (data.classes.some((c) => c.code === code)) code = newCode();
    const c = { id: crypto.randomUUID(), teacherId: teacher.id, name, grade, code, createdAt: new Date().toISOString() };
    data.classes.push(c);
    for (const n of students) data.students.push({ id: crypto.randomUUID(), classId: c.id, name: n, secret: null, progress: null, updatedAt: null });
    this.write(data);
    const { teacherId: _, ...info } = c;
    return info;
  }

  async getClass(id: string): Promise<ClassDetail> {
    const data = this.read();
    const { teacherId: _, ...c } = this.ownClass(data, id);
    const students = data.students
      .filter((s) => s.classId === id)
      .map((s) => ({ id: s.id, name: s.name, joined: s.secret !== null, progress: s.progress, updatedAt: s.updatedAt }))
      .sort(byName);
    return { ...c, students };
  }

  async addStudents(classId: string, names: string[]): Promise<void> {
    const data = this.read();
    this.ownClass(data, classId);
    const existing = new Set(data.students.filter((s) => s.classId === classId).map((s) => s.name.toLocaleLowerCase('fr')));
    for (const n of names) {
      if (existing.has(n.toLocaleLowerCase('fr'))) continue;
      data.students.push({ id: crypto.randomUUID(), classId, name: n, secret: null, progress: null, updatedAt: null });
    }
    this.write(data);
  }

  async removeStudent(studentId: string): Promise<void> {
    const data = this.read();
    this.ownStudent(data, studentId);
    data.students = data.students.filter((s) => s.id !== studentId);
    this.write(data);
  }

  async resetStudent(studentId: string): Promise<void> {
    const data = this.read();
    this.ownStudent(data, studentId).secret = null;
    this.write(data);
  }

  async deleteClass(id: string): Promise<void> {
    const data = this.read();
    this.ownClass(data, id);
    data.classes = data.classes.filter((c) => c.id !== id);
    data.students = data.students.filter((s) => s.classId !== id);
    this.write(data);
  }

  private classByCode(data: DemoData, raw: string) {
    const code = normalizeCode(raw);
    const c = code && data.classes.find((x) => x.code === code);
    if (!c) throw new AccountError('Aucune partie ne correspond à ce code.');
    return c;
  }

  async roster(code: string): Promise<Roster> {
    const data = this.read();
    const c = this.classByCode(data, code);
    return {
      className: c.name,
      grade: c.grade,
      teacherName: data.teachers.find((t) => t.id === c.teacherId)?.name ?? '',
      students: data.students
        .filter((s) => s.classId === c.id)
        .map((s) => ({ id: s.id, name: s.name, joined: s.secret !== null }))
        .sort(byName),
    };
  }

  async joinAsStudent(code: string, studentId: string, password: string): Promise<StudentSession> {
    const data = this.read();
    const c = this.classByCode(data, code);
    const s = data.students.find((x) => x.id === studentId && x.classId === c.id);
    if (!s) throw new AccountError('Ce nom ne fait pas partie de la liste.');
    if (s.secret) {
      if (!(await matches(password, s.secret))) throw new AccountError('Mot de passe incorrect. Si tu l’as oublié, demande à ton professeur de le réinitialiser.');
    } else {
      checkStudentPassword(password);
      s.secret = await hashPassword(password);
      this.write(data);
    }
    this.setSession({ studentId: s.id });
    return { studentId: s.id, name: s.name, classId: c.id, className: c.name, grade: c.grade, code: c.code, progress: s.progress };
  }

  async currentStudent(): Promise<StudentSession | null> {
    const data = this.read();
    const s = data.students.find((x) => x.id === this.session().studentId && x.secret);
    const c = s && data.classes.find((x) => x.id === s.classId);
    if (!s || !c) return null;
    return { studentId: s.id, name: s.name, classId: c.id, className: c.name, grade: c.grade, code: c.code, progress: s.progress };
  }

  async saveProgress(progress: SaveData): Promise<void> {
    const data = this.read();
    const s = data.students.find((x) => x.id === this.session().studentId && x.secret);
    if (!s) return;
    s.progress = progress;
    s.updatedAt = new Date().toISOString();
    this.write(data);
  }

  async leaveStudent(): Promise<void> {
    this.setSession({ studentId: undefined });
  }
}
