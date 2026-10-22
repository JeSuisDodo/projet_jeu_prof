import { PUISSANCES_SKILLS } from '../../exercises/quatrieme/puissances';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const PUISSANCES: ChapterDef = {
  id: '4e-puissances',
  title: 'Puissances',
  region: 'Volcan des Puissances',
  theme: 'volcan',
  terrain: 'montagne',
  skills: PUISSANCES_SKILLS,
  creatures: [
    creature('4e-carrebraise', 'Carrebraise', 'Une braise qui se multiplie par elle-même jusqu’à s’enflammer.', ['4e-puissance-entier'], { shape: 'blob', hue: 15, symbol: 'a²' }),
    creature('4e-dizaineau', 'Dizaineau', 'Un oiseau de feu qui ajoute les exposants en battant des ailes.', ['4e-regles-puissances-10'], { shape: 'oiseau', hue: 25, symbol: '10ⁿ' }),
    creature('4e-kilomeg', 'Kilomeg', 'Il mesure tout, du nanomètre au gigaoctet.', ['4e-prefixes'], { shape: 'insecte', hue: 35, symbol: 'k' }),
    creature('4e-scientifix', 'Scientifix', 'Il déplace la virgule jusqu’à n’avoir qu’un chiffre devant.', ['4e-notation-scientifique', '4e-comparer-ecritures'], { shape: 'bete', hue: 5, symbol: '×10' }),
    creature('4e-negatoile', 'Négatoile', 'Une étincelle minuscule : $10^{-9}$ d’un volcan.', ['4e-exposant-negatif', '4e-regles-puissances-10'], { shape: 'spectre', hue: 0, symbol: '⁻ⁿ' }),
  ],
  boss: bossOf('4e-exponentor', 'Exponentor, gardien du volcan', 'Sa lave monte en puissance : chaque coulée est dix fois plus grosse que la précédente.', PUISSANCES_SKILLS, { shape: 'golem', hue: 10, symbol: '10ⁿ' }),
  guide: [
    'Le Volcan des Puissances crache des nombres immenses… et minuscules.',
    'La notation scientifique, $a \\times 10^n$ avec $1 \\leq a < 10$, t’aidera à les dompter.',
  ],
};
