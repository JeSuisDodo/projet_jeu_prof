import { SOLIDES_SKILLS } from '../../exercises/sixieme/mesures';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const SOLIDES: ChapterDef = {
  id: '6e-solides',
  title: 'Solides et volumes',
  region: 'Canyon des Solides',
  theme: 'volcan',
  terrain: 'canyon',
  skills: SOLIDES_SKILLS,
  creatures: [
    creature('cubik', 'Cubik', 'Un golem de lave en forme de cube parfait.', ['6e-elements-solide', '6e-volume-pave'], 'golem', 15, '■'),
    creature('pyramidon', 'Pyramidon', 'Une bête au dos en pyramide à base carrée.', ['6e-elements-solide', '6e-reconnaitre-solide'], 'bete', 25, '▲'),
    creature('cylindrou', 'Cylindrou', 'Un ver de feu cylindrique, avec deux disques pour faces.', ['6e-reconnaitre-solide'], 'insecte', 5, '◎'),
    creature('litron', 'Litron', 'Un blob de lave qui remplit exactement un litre, soit un décimètre cube.', ['6e-conversion-volume', '6e-volume-pave'], 'blob', 10, 'L'),
  ],
  boss: creature('volumineux', 'Volumineux, gardien du canyon', 'Le gardien du canyon, dont le volume se mesure en mètres cubes.', SOLIDES_SKILLS.map((s) => s.id), 'golem', 20, 'cm³'),
  guide: [
    'Le Canyon des Solides est taillé en cubes, pavés et pyramides.',
    'Volume d’un pavé : longueur × largeur × hauteur. Et 1 L = 1 dm³ !',
  ],
};
