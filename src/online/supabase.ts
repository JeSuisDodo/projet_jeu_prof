import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import type { GradeId } from '../content/types';
import type { SaveData } from '../game/save';
import { AccountError, AccountNotice, type Backend, type ClassDetail, type ClassInfo, type Roster, type StudentSession, type Teacher } from './types';
import { byName, checkStudentPassword, checkTeacherPassword, cleanName, normalizeCode, validEmail } from './util';

/** Messages de Supabase traduits pour l'utilisateur. */
function explain(error: { message: string } | null): never | void {
  if (!error) return;
  const m = error.message;
  if (/invalid login credentials/i.test(m)) throw new AccountError('Adresse ou mot de passe incorrect.');
  if (/email not confirmed/i.test(m)) throw new AccountError('Confirme d’abord ton adresse : clique sur le lien reçu par e-mail.');
  if (/already registered|already been registered/i.test(m)) throw new AccountError('Un compte existe déjà avec cette adresse.');
  if (/anonymous sign-ins are disabled/i.test(m)) throw new AccountError('Les connexions élèves ne sont pas activées sur le serveur (voir docs/comptes.md).');
  if (/rate limit/i.test(m)) throw new AccountError('Trop de demandes d’un coup : réessaie dans une minute.');
  if (/failed to fetch|network/i.test(m)) throw new AccountError('Pas de connexion au serveur. Vérifie ta connexion Internet.');
  if (/duplicate key/i.test(m)) throw new AccountError('Ce nom est déjà dans la liste.');
  throw new AccountError(m);
}

interface ClassRow {
  id: string;
  name: string;
  grade: GradeId;
  code: string;
  created_at: string;
}

const toInfo = (r: ClassRow): ClassInfo => ({ id: r.id, name: r.name, grade: r.grade, code: r.code, createdAt: r.created_at });

/**
 * Comptes en ligne avec Supabase. Professeurs : e-mail et mot de passe. Élèves : session anonyme
 * du navigateur, rattachée à leur nom par le mot de passe qu'ils choisissent (fonctions SQL de
 * `supabase/schema.sql`, qui portent toutes les règles d'accès).
 */
export class SupabaseBackend implements Backend {
  readonly mode = 'online';
  private db: SupabaseClient;

  constructor(url: string, key: string) {
    this.db = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  }

  private async user() {
    const { data } = await this.db.auth.getSession();
    return data.session?.user ?? null;
  }

  async currentTeacher(): Promise<Teacher | null> {
    const user = await this.user();
    if (!user || user.is_anonymous) return null;
    const { data } = await this.db.from('teachers').select('name').eq('id', user.id).maybeSingle();
    return { id: user.id, email: user.email ?? '', name: data?.name ?? user.user_metadata?.name ?? 'Professeur' };
  }

  async signUpTeacher(name: string, email: string, password: string): Promise<Teacher> {
    name = cleanName(name);
    email = email.trim().toLowerCase();
    if (!name) throw new AccountError('Indique ton nom.');
    if (!validEmail(email)) throw new AccountError('Adresse e-mail invalide.');
    checkTeacherPassword(password);
    // Un élève connecté sur ce navigateur laisse la place au professeur.
    if ((await this.user())?.is_anonymous) await this.db.auth.signOut();
    const redirect = location.href.split(/[?#]/)[0];
    const { data, error } = await this.db.auth.signUp({ email, password, options: { data: { name }, emailRedirectTo: redirect } });
    explain(error);
    if (!data.session) throw new AccountNotice(`Compte créé ! Un e-mail de confirmation a été envoyé à ${email}. Clique sur le lien, puis connecte-toi.`);
    return { id: data.session.user.id, name, email };
  }

  async signInTeacher(email: string, password: string): Promise<Teacher> {
    if ((await this.user())?.is_anonymous) await this.db.auth.signOut();
    const { error } = await this.db.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    explain(error);
    return (await this.currentTeacher())!;
  }

  async signOut(): Promise<void> {
    await this.db.auth.signOut();
  }

  async listClasses() {
    const { data, error } = await this.db.from('classes').select('id, name, grade, code, created_at, students(joined)').order('created_at', { ascending: false });
    explain(error);
    return (data ?? []).map((r) => {
      const students = (r.students ?? []) as { joined: boolean }[];
      return { ...toInfo(r as ClassRow), total: students.length, joined: students.filter((s) => s.joined).length };
    });
  }

  async createClass(name: string, grade: GradeId, students: string[]): Promise<ClassInfo> {
    name = cleanName(name);
    if (!name) throw new AccountError('Donne un nom à la partie.');
    const { data, error } = await this.db.rpc('create_class', { p_name: name, p_grade: grade, p_students: students });
    explain(error);
    return toInfo(data as ClassRow);
  }

  async getClass(id: string): Promise<ClassDetail> {
    const { data, error } = await this.db
      .from('classes')
      .select('id, name, grade, code, created_at, students(id, name, joined, progress, updated_at)')
      .eq('id', id)
      .maybeSingle();
    explain(error);
    if (!data) throw new AccountError('Partie introuvable.');
    const rows = (data.students ?? []) as { id: string; name: string; joined: boolean; progress: SaveData | null; updated_at: string | null }[];
    return {
      ...toInfo(data as ClassRow),
      students: rows.map((s) => ({ id: s.id, name: s.name, joined: s.joined, progress: s.progress, updatedAt: s.updated_at })).sort(byName),
    };
  }

  async addStudents(classId: string, names: string[]): Promise<void> {
    if (!names.length) return;
    const { error } = await this.db
      .from('students')
      .upsert(names.map((name) => ({ class_id: classId, name })), { onConflict: 'class_id,name', ignoreDuplicates: true });
    explain(error);
  }

  async removeStudent(studentId: string): Promise<void> {
    explain((await this.db.from('students').delete().eq('id', studentId)).error);
  }

  async resetStudent(studentId: string): Promise<void> {
    explain((await this.db.rpc('reset_student', { p_student: studentId })).error);
  }

  async deleteClass(id: string): Promise<void> {
    explain((await this.db.from('classes').delete().eq('id', id)).error);
  }

  async roster(raw: string): Promise<Roster> {
    const code = normalizeCode(raw);
    if (!code) throw new AccountError('Un code de partie fait 6 caractères.');
    const { data, error } = await this.db.rpc('class_roster', { p_code: code });
    explain(error);
    if (!data) throw new AccountError('Aucune partie ne correspond à ce code.');
    return data as Roster;
  }

  async joinAsStudent(code: string, studentId: string, password: string): Promise<StudentSession> {
    checkStudentPassword(password);
    const user = await this.user();
    if (!user || !user.is_anonymous) {
      // Un professeur connecté sur ce navigateur est déconnecté : l'élève a sa propre session.
      if (user) await this.db.auth.signOut();
      explain((await this.db.auth.signInAnonymously()).error);
    }
    const { data, error } = await this.db.rpc('join_class', { p_code: normalizeCode(code), p_student: studentId, p_password: password });
    explain(error);
    if (data?.error) throw new AccountError(data.error);
    return data as StudentSession;
  }

  async currentStudent(): Promise<StudentSession | null> {
    const user = await this.user();
    if (!user?.is_anonymous) return null;
    const { data, error } = await this.db.rpc('my_student');
    if (error) return null;
    return (data as StudentSession | null) ?? null;
  }

  async saveProgress(progress: SaveData): Promise<void> {
    explain((await this.db.rpc('save_progress', { p_progress: progress })).error);
  }

  async leaveStudent(): Promise<void> {
    await this.db.rpc('leave_class');
    await this.db.auth.signOut();
  }
}
