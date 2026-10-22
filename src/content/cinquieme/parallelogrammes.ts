import { PARALLELOGRAMMES_SKILLS } from '../../exercises/cinquieme/parallelogrammes';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PARALLELOGRAMMES: ChapterDef = {
  id: '5e-parallelogrammes',
  title: 'Parallélogrammes',
  region: 'Vallée des Parallélogrammes',
  theme: 'automne',
  terrain: 'riviere',
  skills: PARALLELOGRAMMES_SKILLS,
  creatures: [
    creature('oppositeau', 'Oppositeau', 'Un blob penché dont les angles opposés sont égaux.', ['5e-parallelogramme-angles'], 'blob', 35, '▱'),
    creature('cotelette', 'Côtelette', 'Une plante dont les côtés opposés poussent de la même longueur.', ['5e-parallelogramme-cotes'], 'plante', 60, '='),
    creature('milieu', 'Milieuse', 'Un insecte posé au point où les diagonales se coupent en leur milieu.', ['5e-parallelogramme-diagonales'], 'insecte', 20, 'O'),
    creature('quadrilou', 'Quadrilou', 'Une bête qui reconnaît un parallélogramme à ses propriétés.', ['5e-reconnaitre-parallelogramme', '5e-parallelogramme-angles'], 'bete', 45, '▱'),
    creature('losangelot', 'Losangelot', 'Un oiseau qui se change en rectangle, en losange ou en carré.', ['5e-parallelogrammes-particuliers'], 'oiseau', 10, '◇'),
  ],
  boss: creature('parallelor', 'Parallélor, gardien de la vallée', 'Le gardien de la vallée a quatre côtés parallèles deux à deux.', PARALLELOGRAMMES_SKILLS.map((s) => s.id), 'golem', 30, '▱'),
  guide: [
    'La Vallée des Parallélogrammes : des côtés parallèles deux à deux partout.',
    'Côtés, angles, diagonales : tout fonctionne par paires.',
  ],
};
