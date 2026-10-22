import { TRIGONOMETRIE_3E } from '../../exercises/troisieme/trigonometrie';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const TRIGONOMETRIE: ChapterDef = {
  id: '3e-trigonometrie',
  title: 'Trigonométrie',
  region: 'Canyon des Angles',
  theme: 'volcan',
  terrain: 'canyon',
  skills: TRIGONOMETRIE_3E,
  creatures: [
    creature('cosinou', 'Cosinou', 'Un blob qui ne regarde que le côté adjacent et l’hypoténuse.', ['3e-trigo-formule'], 'blob', 15, 'cos'),
    creature('sinusard', 'Sinusard', 'Un serpent qui ondule entre côté opposé et hypoténuse.', ['3e-trigo-formule', '3e-trigo-longueur'], 'bete', 0, 'sin'),
    creature('tangentine', 'Tangentine', 'Un oiseau qui file en tangente entre opposé et adjacent.', ['3e-trigo-longueur'], 'oiseau', 30, 'tan'),
    creature('arcalor', 'Arcalor', 'Un spectre de lave qui retrouve n’importe quel angle à partir de deux côtés.', ['3e-trigo-angle', '3e-trigo-longueur'], 'spectre', 350, 'θ'),
  ],
  boss: creature('sohcahtoa', 'Trigonor, gardien du canyon', 'Le gardien du canyon, dont les parois forment des angles parfaits.', TRIGONOMETRIE_3E.map((s) => s.id), 'golem', 10, 'θ'),
  guide: ['Le Canyon des Angles est brûlant : chaque paroi forme un angle précis.', 'Cosinus, sinus et tangente sont tes meilleurs outils ici.'],
};
