import { PYTHAGORE_SKILLS } from '../../exercises/quatrieme/pythagore';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const PYTHAGORE: ChapterDef = {
  id: '4e-pythagore',
  title: 'Théorème de Pythagore',
  region: 'Falaises de Pythagore',
  theme: 'automne',
  terrain: 'montagne',
  skills: PYTHAGORE_SKILLS,
  creatures: [
    creature('4e-equerrot', 'Équerrot', 'Un petit rocher parfaitement à angle droit.', ['4e-hypotenuse'], { shape: 'golem', hue: 30, symbol: '∟' }),
    creature('4e-cathetus', 'Cathétus', 'Il cherche toujours le côté de l’angle droit qui lui manque.', ['4e-cote-angle-droit'], { shape: 'bete', hue: 20, symbol: 'b' }),
    creature('4e-verifior', 'Vérifior', 'Il compare les carrés pour savoir si un triangle est rectangle.', ['4e-reciproque-pythagore'], { shape: 'oiseau', hue: 45, symbol: 'a²' }),
    creature('4e-echellon', 'Échellon', 'Il grimpe aux murs avec son échelle et calcule la hauteur atteinte.', ['4e-pythagore-probleme', '4e-hypotenuse'], { shape: 'insecte', hue: 15, symbol: '√' }),
  ],
  boss: bossOf('4e-hypotenor', 'Hypoténor, gardien des falaises', 'Le plus long côté de la falaise, toujours face à l’angle droit.', PYTHAGORE_SKILLS, { shape: 'golem', hue: 25, symbol: 'a²' }),
  guide: [
    'Ces falaises forment des triangles rectangles partout où tu regardes.',
    'Dans un triangle rectangle, le carré de l’hypoténuse est égal à la somme des carrés des deux autres côtés.',
  ],
};
