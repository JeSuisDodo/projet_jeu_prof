import { FRACTIONS_SKILLS } from '../../exercises/quatrieme/fractions';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const FRACTIONS: ChapterDef = {
  id: '4e-fractions',
  title: 'Fractions : calculs',
  region: 'Vergers des Fractions',
  theme: 'automne',
  terrain: 'foret',
  skills: FRACTIONS_SKILLS,
  creatures: [
    creature('4e-partarte', 'Partarte', 'Une tarte vivante qui se découpe toujours en parts égales.', ['4e-fraction-de'], { shape: 'blob', hue: 30, symbol: '½' }),
    creature('4e-comparoix', 'Comparoix', 'Une noix qui met deux fractions au même dénominateur avant de les peser.', ['4e-comparer-fractions'], { shape: 'insecte', hue: 40, symbol: '<' }),
    creature('4e-sommeline', 'Sommeline', 'Une fleur qui additionne ses pétales seulement quand ils ont le même dénominateur.', ['4e-somme-fractions'], { shape: 'plante', hue: 80, symbol: '+' }),
    creature('4e-multipomme', 'Multipomme', 'Une pomme qui multiplie les numérateurs entre eux, et les dénominateurs entre eux.', ['4e-produit-fractions'], { shape: 'bete', hue: 10, symbol: 'a/b' }),
    creature('4e-inversoir', 'Inversoir', 'Pour diviser, il retourne la fraction comme une crêpe.', ['4e-quotient-fractions', '4e-produit-fractions'], { shape: 'oiseau', hue: 25, symbol: '⅟' }),
  ],
  boss: bossOf('4e-denominatus', 'Dénominatus, gardien du verger', 'Il connaît le dénominateur commun de chaque arbre du verger.', FRACTIONS_SKILLS, { shape: 'golem', hue: 35, symbol: 'a/b' }),
  guide: [
    'Les arbres de ce verger donnent des fractions. Pour les additionner, il faut un dénominateur commun.',
    'Diviser par une fraction, c’est multiplier par son inverse !',
  ],
};
