import { PROBABILITES_3E } from '../../exercises/troisieme/statistiques';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PROBABILITES: ChapterDef = {
  id: '3e-probabilites',
  title: 'Probabilités',
  region: 'Bois du Hasard',
  theme: 'nuit',
  terrain: 'foret',
  skills: PROBABILITES_3E,
  creatures: [
    creature('urnicorne', 'Urnicorne', 'Une bête qui tire des boules d’une urne au hasard.', ['3e-proba-urne'], 'bete', 260, 'P'),
    creature('decelle', 'Décelle', 'Un blob cubique à six faces, parfaitement équilibré.', ['3e-proba-de', '3e-proba-urne'], 'blob', 240, '⚄'),
    creature('contrariot', 'Contrariot', 'Un spectre qui fait toujours le contraire de ce qu’on attend.', ['3e-proba-contraire'], 'spectre', 220, 'Ā'),
    creature('pilouface', 'Pile-ou-Fuite', 'Un oiseau-pièce qui ne se souvient jamais de ses lancers précédents.', ['3e-proba-frequence', '3e-proba-contraire'], 'oiseau', 50, '½'),
    creature('arborix', 'Arborix', 'Une plante en arbre de probabilités : chaque branche multiplie.', ['3e-proba-deux-epreuves', '3e-proba-de'], 'plante', 280, '×'),
  ],
  boss: creature('fortuna', 'Fortuna, gardienne du bois', 'La gardienne du bois, qui ne laisse rien au hasard… sauf les dés.', PROBABILITES_3E.map((s) => s.id), 'spectre', 270, 'P'),
  guide: ['Dans le Bois du Hasard, rien n’est sûr… mais tout se calcule.', 'Urnes, dés et arbres : à toi les probabilités.'],
};
