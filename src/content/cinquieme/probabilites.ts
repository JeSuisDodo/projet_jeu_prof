import { PROBABILITES_SKILLS } from '../../exercises/cinquieme/probabilites';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PROBABILITES: ChapterDef = {
  id: '5e-probabilites',
  title: 'Probabilités',
  region: 'Forêt du Hasard',
  theme: 'nuit',
  terrain: 'foret',
  skills: PROBABILITES_SKILLS,
  creatures: [
    creature('certinou', 'Certinou', 'Un spectre qui sait si un événement est certain, impossible… ou entre les deux.', ['5e-proba-vocabulaire'], 'spectre', 260, '?'),
    creature('dedou', 'Dédou', 'Un blob en forme de dé qui roule entre les arbres.', ['5e-proba-de'], 'blob', 300, '⚀'),
    creature('urnelle', 'Urnelle', 'Une chouette qui pioche des boules colorées dans une urne.', ['5e-proba-urne'], 'oiseau', 240, 'p'),
    creature('contrario', 'Contrario', 'Une luciole qui brille seulement quand l’événement ne se réalise pas.', ['5e-proba-contraire', '5e-proba-urne'], 'insecte', 60, '1−p'),
    creature('chancelier', 'Chancelier', 'Une bête qui choisit toujours le sac où l’on a le plus de chances.', ['5e-proba-comparer', '5e-proba-de'], 'bete', 280, '%'),
  ],
  boss: creature('aleator', 'Aléator, gardien de la forêt', 'Le gardien de la forêt lance les dés du destin.', PROBABILITES_SKILLS.map((s) => s.id), 'golem', 270, 'p'),
  guide: [
    'La Forêt du Hasard s’éveille la nuit.',
    'Ici, tout est question de chances : certain, impossible ou probable ?',
  ],
};
