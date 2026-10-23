import { gradeById } from '../content';
import { AccountError, type Backend, type Roster, type StudentSession } from '../online/types';
import { CODE_LENGTH, MIN_STUDENT_PASSWORD, normalizeCode } from '../online/util';
import { attempt, button, field, messageBox, say } from './form';
import { escapeHtml } from './math';
import { h, hideOverlay, showOverlay } from './overlay';

/**
 * Parcours élève, façon Tricount : le code (ou le lien) de la partie, puis le choix de son nom
 * dans la liste donnée par le professeur, puis le mot de passe (choisi la première fois).
 * Rend la session, ou null si l'élève revient au menu.
 */
export async function studentFlow(backend: Backend, inviteCode: string | null): Promise<StudentSession | null> {
  const existing = await backend.currentStudent().catch(() => null);
  return new Promise((resolve) => {
    const done = (s: StudentSession | null) => {
      hideOverlay();
      resolve(s);
    };

    function welcomeBack(s: StudentSession): void {
      const panel = h('div', 'panel account');
      panel.innerHTML = `<h2>Te revoilà, ${escapeHtml(s.name.split(' ')[0])} !</h2>
        <p class="muted">Partie « ${escapeHtml(s.className)} » · ${gradeById(s.grade).name}</p>`;
      const actions = h('div', 'row actions');
      const play = button('Jouer', '', () => done(s));
      actions.append(
        button('Retour', 'secondary', () => done(null)),
        button('Ce n’est pas moi', 'secondary', async () => {
          await backend.leaveStudent();
          askCode();
        }),
        play,
      );
      panel.append(actions);
      showOverlay(panel);
      play.focus();
    }

    function askCode(prefill = '', error = ''): void {
      const panel = h('div', 'panel account');
      panel.innerHTML = `<h2>Rejoindre une partie</h2>
        <p class="muted">Tape le code donné par ton professeur, ou ouvre directement le lien qu’il a partagé.</p>`;
      const form = document.createElement('form');
      const { wrap, input } = field('Code de la partie', 'text', 'code', { maxlength: '9', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', placeholder: 'ex. K7QM2P' });
      input.classList.add('code-input');
      input.value = prefill;
      const box = messageBox();
      const go = button('Continuer');
      go.type = 'submit';
      const actions = h('div', 'row actions');
      actions.append(button('Retour', 'secondary', () => done(null)), go);
      form.append(wrap, box, actions);
      say(box, error);
      form.onsubmit = async (e) => {
        e.preventDefault();
        const code = normalizeCode(input.value);
        if (!code) return say(box, `Un code de partie fait ${CODE_LENGTH} caractères (lettres et chiffres).`);
        let roster: Roster | undefined;
        if (await attempt(go, box, async () => void (roster = await backend.roster(code)))) pickName(code, roster!);
      };
      panel.append(form);
      showOverlay(panel);
      input.focus();
    }

    function pickName(code: string, roster: Roster): void {
      const panel = h('div', 'panel account');
      const grade = gradeById(roster.grade);
      panel.innerHTML = `<h2>${escapeHtml(roster.className)}</h2>
        <p class="muted">Partie de ${escapeHtml(roster.teacherName || 'ton professeur')} · ${grade.name} · ${grade.island}</p>
        <h3>Qui es-tu ?</h3>`;
      const list = h('div', 'name-list');
      const render = (filter: string) => {
        const f = filter.trim().toLocaleLowerCase('fr');
        list.replaceChildren(
          ...roster.students
            .filter((s) => !f || s.name.toLocaleLowerCase('fr').includes(f))
            .map((s, i) => {
              const b = button(`<span>${escapeHtml(s.name)}</span><small>${s.joined ? '🔒 déjà inscrit' : 'nouveau'}</small>`, `name-card ${s.joined ? 'joined' : ''}`, () => askPassword(code, roster, s));
              b.style.animationDelay = `${Math.min(i, 20) * 25}ms`;
              return b;
            }),
        );
        if (!list.children.length) list.append(h('p', 'muted', 'Aucun nom ne correspond. Ton nom n’est pas dans la liste ? Demande à ton professeur de l’ajouter.'));
      };
      if (roster.students.length > 8) {
        const { wrap, input } = field('Chercher mon nom', 'text', 'search', { autocomplete: 'off' });
        input.oninput = () => render(input.value);
        panel.append(wrap);
      }
      render('');
      const actions = h('div', 'row actions');
      actions.append(button('Retour', 'secondary', () => askCode(code)));
      panel.append(list, actions);
      showOverlay(panel);
    }

    function askPassword(code: string, roster: Roster, student: Roster['students'][number]): void {
      const panel = h('div', 'panel account');
      const first = !student.joined;
      panel.innerHTML = `<h2>${escapeHtml(student.name)}</h2>
        <p class="muted">${first ? `Choisis un mot de passe d’au moins ${MIN_STUDENT_PASSWORD} caractères. Retiens-le bien : il te servira à retrouver ta partie sur un autre appareil.` : 'Entre ton mot de passe pour retrouver ta partie.'}</p>`;
      const form = document.createElement('form');
      const pass = field('Mot de passe', 'password', 'password', { autocomplete: first ? 'new-password' : 'current-password' });
      form.append(pass.wrap);
      const again = first ? field('Encore une fois, pour vérifier', 'password', 'again', { autocomplete: 'new-password' }) : null;
      if (again) form.append(again.wrap);
      const box = messageBox();
      const go = button(first ? 'C’est parti !' : 'Me connecter');
      go.type = 'submit';
      const actions = h('div', 'row actions');
      actions.append(button('Ce n’est pas moi', 'secondary', () => pickName(code, roster)), go);
      form.append(box, actions);
      form.onsubmit = async (e) => {
        e.preventDefault();
        if (again && again.input.value !== pass.input.value) return say(box, 'Les deux mots de passe ne sont pas identiques.');
        let session: StudentSession | undefined;
        if (await attempt(go, box, async () => void (session = await backend.joinAsStudent(code, student.id, pass.input.value)))) done(session!);
        else {
          form.classList.add('wrong');
          setTimeout(() => form.classList.remove('wrong'), 400);
        }
      };
      panel.append(form);
      showOverlay(panel);
      pass.input.focus();
    }

    if (existing && (!inviteCode || inviteCode === existing.code)) welcomeBack(existing);
    else if (inviteCode) {
      // Lien d'invitation : on va directement à la liste des noms.
      backend.roster(inviteCode).then(
        (r) => pickName(inviteCode, r),
        (e) => askCode(inviteCode, e instanceof AccountError ? e.message : 'Impossible d’ouvrir l’invitation pour le moment.'),
      );
    } else askCode();
  });
}
