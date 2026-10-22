import { OPERATIONS_SKILLS } from '../../exercises/sixieme/operations';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const OPERATIONS: ChapterDef = {
  id: '6e-operations',
  title: 'Addition, soustraction et multiplication',
  region: 'Bois des Opérations',
  theme: 'foret',
  terrain: 'foret',
  skills: OPERATIONS_SKILLS,
  creatures: [
    creature('additif', 'Additif', 'Une jeune pousse qui grandit d’une feuille à chaque addition bien posée.', ['6e-addition', '6e-soustraction'], 'plante', 110, '+'),
    creature('retranchou', 'Retranchou', 'Un hérisson qui retire une épine à chaque soustraction.', ['6e-soustraction', '6e-probleme-achats'], 'bete', 25, '−'),
    creature('decalou', 'Décalou', 'Un oiseau qui fait glisser la virgule d’un battement d’ailes : ×10, ×100, ÷1 000.', ['6e-fois-10'], 'oiseau', 50, '×10'),
    creature('multipliane', 'Multipliane', 'Une liane qui se multiplie en autant de branches que son voisin.', ['6e-multiplication', '6e-ordre-grandeur'], 'plante', 140, '×'),
    creature('astucieux', 'Astucieux', 'Un renard malin qui calcule de tête plus vite que son ombre.', ['6e-calcul-mental', '6e-ordre-grandeur'], 'bete', 15, '99'),
  ],
  boss: creature('sylvacalc', 'Sylvacalc, gardien du bois', 'Le gardien du bois, un vieux chêne qui a compté chacune de ses feuilles.', OPERATIONS_SKILLS.map((s) => s.id), 'golem', 100, '+−×'),
  guide: [
    'Le Bois des Opérations bruisse de calculs.',
    'Pose bien les virgules les unes sous les autres, et vérifie tes résultats avec un ordre de grandeur !',
  ],
};
