import type { SaveData } from '../game/save';
import type { Backend, StudentSession } from '../online/types';
import { button } from './form';
import { escapeHtml } from './math';
import { ROLE_ICONS, menuTitle, openMenu, setMenuScreen } from './menu';
import { h } from './overlay';
import { type StartChoice, showStart } from './start';
import { studentFlow } from './student';
import { teacherFlow } from './teacher';

export type HomeResult = { kind: 'free'; choice: Exclude<StartChoice, { kind: 'back' }> } | { kind: 'student'; session: StudentSession };

/** Carte de choix du rôle sur l'écran d'accueil. */
function roleCard(kind: 'eleve' | 'prof', title: string, text: string, onClick: () => void): HTMLButtonElement {
  const b = button(`<span class="role-icon">${ROLE_ICONS[kind]}</span><strong>${title}</strong><small>${text}</small>`, `role-card ${kind}`, onClick);
  return b;
}

/**
 * Accueil : décor animé, choix Élève / Professeur, ou jeu libre sans compte.
 * Rend ce qu'il faut lancer ; l'espace professeur ramène ici quand on le quitte.
 */
export async function runHome(backend: Promise<Backend>, inviteCode: string | null, freeSave: SaveData | null): Promise<HomeResult> {
  openMenu();
  const hideMain = () => setMenuScreen();
  for (;;) {
    if (inviteCode) {
      // Arrivée par un lien d'invitation : direction la liste des noms.
      const code = inviteCode;
      inviteCode = null;
      hideMain();
      const session = await studentFlow(await backend, code);
      if (session) return { kind: 'student', session };
      continue;
    }
    const pick = await new Promise<'eleve' | 'prof' | 'free'>((resolve) => {
      const cards = h('div', 'role-cards');
      cards.append(
        roleCard('eleve', 'Je suis élève', 'Rejoindre la partie de ma classe', () => resolve('eleve')),
        roleCard('prof', 'Je suis professeur', 'Créer des parties et suivre mes élèves', () => resolve('prof')),
      );
      const free = button(
        freeSave ? `Jouer librement · continuer avec ${escapeHtml(freeSave.pseudo || 'ma partie')} (${freeSave.xp} XP)` : 'Jouer librement, sans compte',
        'link-btn',
        () => resolve('free'),
      );
      const note = h('p', 'menu-note');
      void backend.then((b) => {
        if (b.mode === 'demo') note.textContent = 'Mode démo : les comptes restent sur cet appareil.';
      });
      setMenuScreen(
        menuTitle(),
        h('p', 'menu-tagline', 'Explore les îles, affronte les créatures… en résolvant des exercices de maths !'),
        cards,
        free,
        note,
      );
    });
    hideMain();
    if (pick === 'eleve') {
      const session = await studentFlow(await backend, null);
      if (session) return { kind: 'student', session };
    } else if (pick === 'prof') {
      await teacherFlow(await backend);
    } else {
      const choice = await showStart(freeSave);
      if (choice.kind !== 'back') return { kind: 'free', choice };
    }
  }
}
