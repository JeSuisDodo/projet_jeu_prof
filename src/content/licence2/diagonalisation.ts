import { DIAGONALISATION_SKILLS } from '../../exercises/licence2/diagonalisation';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const DIAGONALISATION: ChapterDef = {
  id: 'l2-diagonalisation',
  title: 'Diagonalisation',
  region: 'Forêt des Diagonales',
  theme: 'foret',
  terrain: 'foret',
  skills: DIAGONALISATION_SKILLS,
  creatures: [
    creature('l2-diagonelle', 'Diagonelle', 'Une plante qui ne garde que les feuilles de sa diagonale.', ['l2-diagonalisable', 'l2-cayley-hamilton'], { shape: 'plante', hue: 140, symbol: 'D' }),
    creature('l2-puissancon', 'Puissançon', 'Il élève ses matrices à la puissance n sans effort, grâce à PDP⁻¹.', ['l2-puissance-matrice', 'l2-diagonalisable'], { shape: 'blob', hue: 160, symbol: 'Aⁿ' }),
    creature('l2-recurrenard', 'Récurrenard', 'Un renard qui saute de terme en terme, deux par deux.', ['l2-suite-recurrente-lineaire', 'l2-cayley-hamilton'], { shape: 'bete', hue: 30, symbol: 'uₙ' }),
    creature('l2-noyautin', 'Noyautin', 'Un esprit discret qui mesure la dimension des sous-espaces propres.', ['l2-dim-sous-espace-propre', 'l2-diagonalisable', 'l2-puissance-matrice'], { shape: 'spectre', hue: 170, symbol: 'ker' }),
  ],
  boss: bossOf('l2-pdpix', 'Pdpix, gardien de la forêt', 'Il change de base à volonté pour tout rendre diagonal.', DIAGONALISATION_SKILLS, { shape: 'golem', hue: 150, symbol: 'P⁻¹' }),
  guide: ['La Forêt des Diagonales est bien rangée : chaque arbre pousse sur la diagonale.', 'Une matrice diagonalisable s’écrit $A = PDP^{-1}$ : alors $A^n = PD^nP^{-1}$.'],
};
