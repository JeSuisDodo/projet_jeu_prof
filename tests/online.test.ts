import { describe, expect, it } from 'vitest';
import { newSave, freshest, recordLesson } from '../src/game/save';
import { LocalBackend, type KeyValueStore } from '../src/online/local';
import { summarize, sinceText } from '../src/online/progress';
import { AccountError } from '../src/online/types';
import { codeFromUrl, inviteLink, newCode, normalizeCode, parseNames } from '../src/online/util';
import { gradeById } from '../src/content';

const memory = (): KeyValueStore => {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
};

describe('codes et listes', () => {
  it('fabrique des codes lisibles et les reconnaît', () => {
    for (let i = 0; i < 50; i++) {
      const code = newCode();
      expect(code).toMatch(/^[A-HJKMNP-Z2-9]{6}$/);
      expect(normalizeCode(code.toLowerCase().replace(/(...)/, '$1 '))).toBe(code);
    }
    expect(normalizeCode('ABC')).toBeNull();
    expect(normalizeCode('ABCDE0')).toBeNull();
  });

  it('lit une liste collée : une ligne par élève, sans doublon ni ligne vide', () => {
    expect(parseNames('Alice  Martin\n\n bob durand ;Alice Martin\nBob Durand\r\nChloé')).toEqual(['Alice Martin', 'bob durand', 'Chloé']);
  });

  it("met le code dans le lien d'invitation et sait le relire", () => {
    const link = inviteLink('K7QM2P', 'https://exemple.fr/jeu/?x=1#y');
    expect(link).toBe('https://exemple.fr/jeu/?partie=K7QM2P');
    expect(codeFromUrl(link)).toBe('K7QM2P');
    expect(codeFromUrl('https://exemple.fr/jeu/')).toBeNull();
  });
});

describe('comptes en mode démo', () => {
  it('suit le parcours complet : professeur, partie, invitation, élève, progression', async () => {
    const store = memory();
    const prof = new LocalBackend(store);
    await expect(prof.signUpTeacher('Mme Martin', 'martin@exemple.fr', 'court')).rejects.toThrow(AccountError);
    const teacher = await prof.signUpTeacher('Mme Martin', 'Martin@Exemple.fr', 'motdepasse');
    expect(teacher.email).toBe('martin@exemple.fr');
    const c = await prof.createClass('3e B', '3e', ['Alice Martin', 'Bob Durand']);
    expect(await prof.listClasses()).toMatchObject([{ name: '3e B', total: 2, joined: 0 }]);

    // L'élève ouvre l'invitation (même navigateur, autre « session ») et choisit son nom.
    const eleve = new LocalBackend(store);
    const roster = await eleve.roster(c.code.toLowerCase());
    expect(roster).toMatchObject({ className: '3e B', grade: '3e', teacherName: 'Mme Martin' });
    const alice = roster.students.find((s) => s.name === 'Alice Martin')!;
    await expect(eleve.joinAsStudent(c.code, alice.id, 'ab')).rejects.toThrow('au moins');
    const session = await eleve.joinAsStudent(c.code, alice.id, 'chat');
    expect(session).toMatchObject({ name: 'Alice Martin', className: '3e B', grade: '3e', progress: null });
    expect((await eleve.roster(c.code)).students.find((s) => s.id === alice.id)!.joined).toBe(true);

    // Deuxième connexion : le mot de passe est vérifié.
    await expect(eleve.joinAsStudent(c.code, alice.id, 'chien')).rejects.toThrow('incorrect');
    expect((await eleve.joinAsStudent(c.code, alice.id, 'chat')).studentId).toBe(alice.id);

    const save = newSave('Alice Martin', '3e', gradeById('3e').chapters[0].id);
    save.xp = 30;
    await eleve.saveProgress(save);
    const detail = await prof.getClass(c.id);
    expect(detail.students.map((s) => [s.name, s.joined])).toEqual([
      ['Alice Martin', true],
      ['Bob Durand', false],
    ]);
    expect(detail.students[0].progress?.xp).toBe(30);

    // Mot de passe oublié : le professeur réinitialise, l'élève en choisit un nouveau.
    await prof.resetStudent(alice.id);
    expect((await eleve.joinAsStudent(c.code, alice.id, 'lapin')).progress?.xp).toBe(30);
  });

  it("ne montre à un professeur que ses propres parties", async () => {
    const store = memory();
    const a = new LocalBackend(store);
    await a.signUpTeacher('A', 'a@exemple.fr', 'motdepasse');
    const c = await a.createClass('Classe A', '6e', ['Zoé']);
    const b = new LocalBackend(memory());
    await b.signUpTeacher('B', 'b@exemple.fr', 'motdepasse');
    expect(await b.listClasses()).toEqual([]);
    await a.signOut();
    await expect(a.getClass(c.id)).rejects.toThrow(AccountError);
    await expect(a.signInTeacher('a@exemple.fr', 'mauvais!!')).rejects.toThrow('incorrect');
    await a.signInTeacher('a@exemple.fr', 'motdepasse');
    expect((await a.getClass(c.id)).students).toHaveLength(1);
    await expect(a.roster('ZZZZZZ')).rejects.toThrow('Aucune partie');
  });
});

describe('progression vue par le professeur', () => {
  it('regroupe les réponses par chapitre et repère les compétences à retravailler', () => {
    const grade = gradeById('4e');
    const [c1, c2] = grade.chapters;
    const save = newSave('Bob', '4e', c1.id);
    save.skills[c1.skills[0].id] = { attempts: 10, correct: 3 };
    save.skills[c2.skills[0].id] = { attempts: 4, correct: 4 };
    save.badges.push(c2.id);
    save.captures[c1.creatures[0].id] = 2;
    const sum = summarize(save, '4e');
    expect(sum).toMatchObject({ attempts: 14, correct: 7, rate: 50, badges: 1 });
    expect(sum.chapters[0]).toMatchObject({ rate: 30, species: 1 });
    expect(sum.chapters[1]).toMatchObject({ rate: 100, badge: true });
    expect(sum.weakSkills.map((w) => w.id)).toEqual([c1.skills[0].id]);
    expect(summarize(null, '4e').rate).toBeNull();
  });

  it('compte les cours lus à la Maison du savoir', () => {
    const grade = gradeById('4e');
    const [c1] = grade.chapters;
    const save = newSave('Bob', '4e', c1.id);
    save.skills[c1.skills[0].id] = { attempts: 5, correct: 1 };
    recordLesson(save, c1.skills[0].id);
    recordLesson(save, c1.skills[0].id);
    recordLesson(save, c1.skills[1].id);
    const sum = summarize(save, '4e');
    expect(save.lessons?.[c1.skills[0].id]).toBe(2);
    expect(sum.chapters[0].lessons).toBe(2);
    expect(sum.lessons).toBe(2);
    expect(sum.totalLessons).toBe(grade.chapters.reduce((n, c) => n + c.skills.length, 0));
    expect(sum.weakSkills[0]).toMatchObject({ id: c1.skills[0].id, lessonRead: true });
    expect(summarize(newSave('Ana', '4e', c1.id), '4e').lessons).toBe(0);
  });

  it('garde la sauvegarde la plus avancée', () => {
    const a = newSave('x', '6e', 'r');
    const b = { ...newSave('x', '6e', 'r'), xp: 5 };
    expect(freshest(a, b)).toBe(b);
    expect(freshest(b, a)).toBe(b);
    expect(freshest(null, a)).toBe(a);
  });

  it("dit depuis quand l'élève n'a pas joué", () => {
    const now = Date.parse('2026-10-23T12:00:00Z');
    expect(sinceText(null, now)).toBe('jamais');
    expect(sinceText('2026-10-23T11:55:00Z', now)).toBe('il y a 5 min');
    expect(sinceText('2026-10-22T11:00:00Z', now)).toBe('hier');
  });
});
