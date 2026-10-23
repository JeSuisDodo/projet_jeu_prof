import { GRADES, gradeById } from '../content';
import type { GradeId } from '../content/types';
import { summarize, sinceText } from '../online/progress';
import { type Backend, type ClassDetail, EmailToConfirm, type StudentRow, type Teacher } from '../online/types';
import { MIN_TEACHER_PASSWORD, inviteLink, parseNames } from '../online/util';
import { attempt, button, field, messageBox, say } from './form';
import { escapeHtml } from './math';
import { h, hideOverlay, showOverlay } from './overlay';
import { gradePicker } from './start';

/** Pourcentage coloré : rouge sous 50 %, orange sous 75 %, vert au-delà. */
const rateClass = (rate: number | null) => (rate === null ? 'none' : rate < 50 ? 'low' : rate < 75 ? 'mid' : 'high');
const rateText = (rate: number | null) => (rate === null ? '–' : `${rate} %`);

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Espace professeur : connexion, liste des parties, création d'une partie (niveau et noms des
 * élèves), invitation (code et lien) et progression de chaque élève. Se termine au retour au menu.
 */
export function teacherFlow(backend: Backend): Promise<void> {
  return new Promise((resolve) => {
    const leave = () => {
      hideOverlay();
      resolve();
    };

    /** Où sont enregistrées les parties : en ligne (partagées) ou sur cet appareil seulement. */
    const modeBadge = () =>
      backend.mode === 'online'
        ? '<span class="mode-badge" title="Les élèves peuvent rejoindre depuis n’importe quel appareil.">En ligne</span>'
        : '<span class="mode-badge demo" title="Les parties restent dans ce navigateur : les élèves ne peuvent pas les rejoindre depuis un autre appareil.">Mode démo</span>';

    function auth(mode: 'login' | 'signup' = 'login'): void {
      const panel = h('div', 'panel account');
      panel.innerHTML = `<h2>Espace professeur</h2>
        <p class="muted">${mode === 'login' ? 'Connecte-toi pour gérer tes parties et suivre tes élèves.' : 'Crée ton compte : tu pourras ensuite créer des parties pour tes classes.'}</p>`;
      const tabs = h('div', 'tabs');
      tabs.append(
        button('Se connecter', mode === 'login' ? '' : 'secondary', () => auth('login')),
        button('Créer un compte', mode === 'signup' ? '' : 'secondary', () => auth('signup')),
      );
      const form = document.createElement('form');
      const name = mode === 'signup' ? field('Ton nom (vu par les élèves)', 'text', 'name', { autocomplete: 'name', maxlength: '60', placeholder: 'ex. Mme Martin' }) : null;
      const email = field('Adresse e-mail', 'email', 'email', { autocomplete: 'email' });
      const pass = field(
        mode === 'signup' ? `Mot de passe (au moins ${MIN_TEACHER_PASSWORD} caractères)` : 'Mot de passe',
        'password',
        'password',
        { autocomplete: mode === 'signup' ? 'new-password' : 'current-password' },
      );
      if (name) form.append(name.wrap);
      form.append(email.wrap, pass.wrap);
      const box = messageBox();
      const go = button(mode === 'login' ? 'Me connecter' : 'Créer mon compte');
      go.type = 'submit';
      const actions = h('div', 'row actions');
      actions.append(button('Retour', 'secondary', leave), go);
      form.append(box, actions);
      form.onsubmit = async (e) => {
        e.preventDefault();
        let teacher: Teacher | undefined;
        let pending: EmailToConfirm | undefined;
        const ok = await attempt(go, box, async () => {
          try {
            teacher = name
              ? await backend.signUpTeacher(name.input.value, email.input.value, pass.input.value)
              : await backend.signInTeacher(email.input.value, pass.input.value);
          } catch (e) {
            if (!(e instanceof EmailToConfirm)) throw e;
            pending = e;
          }
        });
        if (pending) confirmAddress(pending);
        else if (ok) void dashboard(teacher!);
      };
      panel.append(tabs, form);
      if (backend.mode === 'demo')
        panel.append(h('p', 'muted small', 'Mode démo : les comptes sont gardés dans ce navigateur seulement, en attendant le service en ligne.'));
      showOverlay(panel);
      (name ?? email).input.focus();
    }

    /** Après l'inscription : le code reçu par e-mail (ou le lien de l'e-mail) confirme l'adresse. */
    function confirmAddress(pending: EmailToConfirm): void {
      const panel = h('div', 'panel account');
      panel.innerHTML = `<h2>Confirme ton adresse</h2>
        <p>${escapeHtml(pending.message)}</p>
        <p class="muted">Tape le code reçu par e-mail à <strong>${escapeHtml(pending.email)}</strong>. Tu peux aussi cliquer sur le lien de l’e-mail : le jeu s’ouvrira, et tu n’auras plus qu’à te connecter.</p>`;
      const form = document.createElement('form');
      const code = field('Code reçu par e-mail', 'text', 'otp', { inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '10', placeholder: '123456' });
      code.input.classList.add('code-input');
      const box = messageBox();
      const go = button('Confirmer');
      go.type = 'submit';
      const resend = button('Renvoyer un code', 'secondary', async () => {
        if (await attempt(resend, box, () => backend.resendConfirmation(pending.email))) say(box, 'Nouvel e-mail envoyé. Le dernier code reçu est le bon.', 'info');
      });
      const actions = h('div', 'row actions');
      actions.append(button('Retour', 'secondary', () => auth('login')), resend, go);
      form.append(code.wrap, box, actions);
      form.onsubmit = async (e) => {
        e.preventDefault();
        let teacher: Teacher | undefined;
        if (await attempt(go, box, async () => void (teacher = await backend.confirmEmail(pending.email, code.input.value)))) void dashboard(teacher!);
      };
      panel.append(form);
      showOverlay(panel);
      code.input.focus();
    }

    async function dashboard(teacher: Teacher): Promise<void> {
      const panel = h('div', 'panel account wide');
      panel.innerHTML = `<h2>Bonjour ${escapeHtml(teacher.name)} ! ${modeBadge()}</h2><p class="muted">Tes parties. Chaque partie a un niveau et sa liste d’élèves.</p>`;
      const list = h('div', 'class-list', '<p class="muted">Chargement…</p>');
      const box = messageBox();
      const actions = h('div', 'row actions');
      actions.append(
        button('Retour au menu', 'secondary', leave),
        button('Me déconnecter', 'secondary', async () => {
          await backend.signOut();
          auth();
        }),
        button('Créer une partie', '', () => create(teacher)),
      );
      panel.append(list, box, actions);
      showOverlay(panel);
      try {
        const classes = await backend.listClasses();
        list.replaceChildren(
          ...classes.map((c, i) => {
            const grade = gradeById(c.grade);
            const card = button(
              `<span class="class-card-head"><strong>${escapeHtml(c.name)}</strong><span class="code-chip">${c.code}</span></span>
               <span class="muted">${grade.name} · ${grade.island}</span>
               <span class="joined-bar"><span style="--rate:${c.total ? (100 * c.joined) / c.total : 0}%"></span></span>
               <small>${c.joined}/${c.total} élève${c.total > 1 ? 's' : ''} inscrit${c.joined > 1 ? 's' : ''}</small>`,
              'class-card',
              () => void showClass(teacher, c.id),
            );
            card.style.animationDelay = `${i * 50}ms`;
            return card;
          }),
        );
        if (!classes.length) list.innerHTML = '<p class="empty">Aucune partie pour l’instant. Crée la première : choisis le niveau, colle la liste de tes élèves, puis partage le code.</p>';
      } catch (e) {
        list.replaceChildren();
        say(box, e instanceof Error ? e.message : 'Impossible de charger tes parties.');
      }
    }

    function create(teacher: Teacher): void {
      const panel = h('div', 'panel account wide');
      panel.innerHTML = `<h2>Nouvelle partie</h2>`;
      const form = document.createElement('form');
      const name = field('Nom de la partie', 'text', 'name', { maxlength: '60', placeholder: 'ex. 3e B – 2026', required: '' });
      let grade: GradeId = GRADES.find((g) => g.chapters.length)!.id;
      const pickerTitle = h('h3', '', 'Niveau');
      const chosen = h('p', 'chosen-grade');
      const showChosen = () => (chosen.textContent = `Niveau choisi : ${gradeById(grade).name} (${gradeById(grade).island})`);
      const picker = gradePicker(grade, (g) => {
        grade = g;
        showChosen();
      });
      showChosen();
      const namesLabel = h('label', 'field');
      namesLabel.append(h('span', '', 'Élèves : un prénom et nom par ligne (copier-coller depuis un tableur possible)'));
      const area = document.createElement('textarea');
      area.rows = 8;
      area.placeholder = 'Alice Martin\nBastien Durand\nChloé Petit';
      namesLabel.append(area);
      const preview = h('div', 'name-chips');
      area.oninput = () => {
        const names = parseNames(area.value);
        preview.innerHTML = names.length
          ? `<small class="muted">${names.length} élève${names.length > 1 ? 's' : ''} :</small> ${names.map((n) => `<span>${escapeHtml(n)}</span>`).join('')}`
          : '';
      };
      const box = messageBox();
      const go = button('Créer la partie');
      go.type = 'submit';
      const actions = h('div', 'row actions');
      actions.append(button('Annuler', 'secondary', () => void dashboard(teacher)), go);
      form.append(name.wrap, pickerTitle, picker, chosen, namesLabel, preview, box, actions);
      form.onsubmit = async (e) => {
        e.preventDefault();
        const names = parseNames(area.value);
        if (!names.length) return say(box, 'Ajoute au moins un élève à la liste.');
        if (!window.confirm(`Créer « ${name.input.value.trim()} » en ${gradeById(grade).name} avec ${names.length} élève${names.length > 1 ? 's' : ''} ?`)) return;
        let id = '';
        if (await attempt(go, box, async () => void (id = (await backend.createClass(name.input.value, grade, names)).id))) void showClass(teacher, id);
      };
      panel.append(form);
      showOverlay(panel);
      name.input.focus();
    }

    async function showClass(teacher: Teacher, id: string): Promise<void> {
      let detail: ClassDetail;
      try {
        detail = await backend.getClass(id);
      } catch (e) {
        alert(e instanceof Error ? e.message : 'Partie introuvable.');
        return dashboard(teacher);
      }
      const grade = gradeById(detail.grade);
      const link = inviteLink(detail.code);
      const panel = h('div', 'panel account wide');
      panel.innerHTML = `<h2>${escapeHtml(detail.name)} ${modeBadge()}</h2>
        <p class="muted">${grade.name} · ${grade.island} · ${grade.chapters.length} régions</p>`;

      const invite = h('div', 'invite');
      invite.innerHTML = `<div><small>Code de la partie</small><div class="big-code">${detail.code}</div></div>
        <div class="invite-link"><small>Lien d’invitation</small><input type="text" readonly value="${escapeHtml(link)}"></div>`;
      const inviteActions = h('div', 'row');
      const copyBtn = button('Copier le lien', '', async () => {
        copyBtn.textContent = (await copy(link)) ? 'Lien copié ✓' : 'Copie impossible';
        setTimeout(() => (copyBtn.textContent = 'Copier le lien'), 2000);
      });
      inviteActions.append(copyBtn);
      if (typeof navigator.share === 'function')
        inviteActions.append(button('Partager', 'secondary', () => void navigator.share({ title: `Mathoria · ${detail.name}`, text: `Rejoins la partie « ${detail.name} » avec le code ${detail.code}`, url: link }).catch(() => {})));
      invite.append(inviteActions);
      (invite.querySelector('input') as HTMLInputElement).onfocus = (e) => (e.target as HTMLInputElement).select();

      const joined = detail.students.filter((s) => s.joined).length;
      const table = h('div', 'progress-table');
      table.innerHTML = `<div class="progress-row head"><span>Élève</span><span>XP</span><span>Badges</span><span>Réussite</span><span>Activité</span></div>`;
      detail.students.forEach((s, i) => {
        const sum = summarize(s.progress, detail.grade);
        const row = button(
          `<span class="who"><span class="status ${s.joined ? 'on' : ''}" title="${s.joined ? 'Inscrit' : 'Pas encore inscrit'}"></span>${escapeHtml(s.name)}</span>
           <span>${sum.xp}</span>
           <span>${sum.badges}/${grade.chapters.length}</span>
           <span class="rate ${rateClass(sum.rate)}">${rateText(sum.rate)}</span>
           <span class="muted">${s.joined ? sinceText(s.updatedAt) : 'en attente'}</span>`,
          'progress-row',
          () => showStudent(teacher, detail, s),
        );
        row.style.animationDelay = `${Math.min(i, 30) * 20}ms`;
        table.append(row);
      });

      const add = h('details', 'add-students');
      add.innerHTML = '<summary>Ajouter des élèves</summary>';
      const area = document.createElement('textarea');
      area.rows = 3;
      area.placeholder = 'Un prénom et nom par ligne';
      const addBox = messageBox();
      const addBtn = button('Ajouter', '', async () => {
        const names = parseNames(area.value);
        if (!names.length) return say(addBox, 'Écris au moins un nom.');
        if (await attempt(addBtn, addBox, () => backend.addStudents(detail.id, names))) void showClass(teacher, detail.id);
      });
      add.append(area, addBox, addBtn);

      const box = messageBox();
      const actions = h('div', 'row actions');
      const del = button('Supprimer la partie', 'danger', async () => {
        if (!confirm(`Supprimer « ${detail.name} » et la progression de tous ses élèves ? C’est définitif.`)) return;
        if (await attempt(del, box, () => backend.deleteClass(detail.id))) void dashboard(teacher);
      });
      actions.append(button('Mes parties', 'secondary', () => void dashboard(teacher)), del, button('Actualiser', '', () => void showClass(teacher, detail.id)));

      panel.append(
        invite,
        h('h3', '', `Progression · ${joined}/${detail.students.length} inscrit${joined > 1 ? 's' : ''}`),
        h('p', 'muted small', 'Clique sur un élève pour le détail par chapitre.'),
        table,
        add,
        box,
        actions,
      );
      showOverlay(panel);
    }

    function showStudent(teacher: Teacher, detail: ClassDetail, s: StudentRow): void {
      const sum = summarize(s.progress, detail.grade);
      const grade = gradeById(detail.grade);
      const panel = h('div', 'panel account wide');
      panel.innerHTML = `<h2>${escapeHtml(s.name)}</h2>
        <p class="muted">${escapeHtml(detail.name)} · ${s.joined ? `dernière activité ${sinceText(s.updatedAt)}` : 'pas encore inscrit'}</p>
        <div class="tiles">
          <div class="tile"><strong>${sum.xp}</strong><small>points d’expérience</small></div>
          <div class="tile"><strong class="rate ${rateClass(sum.rate)}">${rateText(sum.rate)}</strong><small>de bonnes réponses (${sum.correct}/${sum.attempts})</small></div>
          <div class="tile"><strong>${sum.badges}/${grade.chapters.length}</strong><small>gardiens battus</small></div>
        </div>
        ${
          sum.weakSkills.length
            ? `<h3>À retravailler</h3><ul class="weak">${sum.weakSkills.map((w) => `<li><strong>${escapeHtml(w.name)}</strong> <span class="muted">· ${escapeHtml(w.chapter)}</span> <span class="rate ${rateClass(w.rate)}">${w.rate} %</span></li>`).join('')}</ul>`
            : ''
        }
        <h3>Par chapitre</h3>
        <table class="skills-table chapters">${sum.chapters
          .map(
            (c) => `<tr><td>${escapeHtml(c.title)}${c.badge ? ' <span title="Gardien battu">🏅</span>' : ''}<br><small class="muted">${escapeHtml(c.region)} · ${c.species}/${c.totalSpecies} espèces</small></td>
              <td class="muted">${c.attempts ? `${c.correct}/${c.attempts}` : '–'}</td>
              <td><div class="bar ${rateClass(c.rate)}"><span style="--rate:${c.rate ?? 0}%"></span></div></td></tr>`,
          )
          .join('')}</table>`;
      const box = messageBox();
      const actions = h('div', 'row actions');
      const reset = button('Réinitialiser son mot de passe', 'secondary', async () => {
        if (!confirm(`${s.name} pourra choisir un nouveau mot de passe en rejoignant la partie. Sa progression est gardée.`)) return;
        if (await attempt(reset, box, () => backend.resetStudent(s.id))) say(box, 'Mot de passe réinitialisé : l’élève peut rejoindre la partie à nouveau.', 'info');
      });
      reset.disabled = !s.joined;
      const remove = button('Retirer de la partie', 'danger', async () => {
        if (!confirm(`Retirer ${s.name} de la partie et effacer sa progression ?`)) return;
        if (await attempt(remove, box, () => backend.removeStudent(s.id))) void showClass(teacher, detail.id);
      });
      actions.append(button('Retour à la classe', '', () => void showClass(teacher, detail.id)), reset, remove);
      panel.append(box, actions);
      showOverlay(panel);
    }

    backend.currentTeacher().then(
      (t) => (t ? void dashboard(t) : auth()),
      () => auth(),
    );
  });
}
