import { ELEMENTS_PROPRES_SKILLS } from '../../exercises/licence2/elementsPropres';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const ELEMENTS_PROPRES: ChapterDef = {
  id: 'l2-elements-propres',
  title: 'Valeurs propres et vecteurs propres',
  region: 'Prairie des Vecteurs propres',
  theme: 'prairie',
  terrain: 'riviere',
  skills: ELEMENTS_PROPRES_SKILLS,
  creatures: [
    creature('l2-propret', 'Propret', 'Un lapin qui ne change jamais de direction, seulement de taille.', ['l2-valeurs-propres-triangulaire', 'l2-polynome-caracteristique'], { shape: 'bete', hue: 110, symbol: 'λ' }),
    creature('l2-chiloup', 'Chiloup', 'Il hurle le polynôme caractéristique à la pleine lune.', ['l2-polynome-caracteristique', 'l2-valeurs-propres-2x2'], { shape: 'bete', hue: 95, symbol: 'χ' }),
    creature('l2-directile', 'Directile', 'Un oiseau qui vole toujours le long d’un vecteur propre.', ['l2-vecteur-propre', 'l2-trace-det-vp'], { shape: 'oiseau', hue: 130, symbol: 'v' }),
    creature('l2-spectrelle', 'Spectrelle', 'Une fleur rare dont chaque pétale est une valeur propre.', ['l2-spectre-polynome', 'l2-valeurs-propres-2x2', 'l2-trace-det-vp'], { shape: 'plante', hue: 300, symbol: 'Sp' }),
  ],
  boss: bossOf('l2-eigenor', 'Eigenor, gardien de la prairie', 'Il connaît le spectre de toutes les matrices de la prairie.', ELEMENTS_PROPRES_SKILLS, { shape: 'bete', hue: 120, symbol: 'Av' }),
  guide: ['Dans la Prairie des Vecteurs propres, certains chemins ne tournent jamais : ils s’allongent seulement.', 'Si $Av = \\lambda v$ avec $v \\neq 0$, alors $\\lambda$ est une valeur propre de $A$.'],
};
