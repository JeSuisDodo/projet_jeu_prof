import { CALCUL_LITTERAL_SKILLS } from '../../exercises/quatrieme/calculLitteral';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const CALCUL_LITTERAL: ChapterDef = {
  id: '4e-calcul-litteral',
  title: 'Calcul littéral',
  region: 'Grottes du Calcul littéral',
  theme: 'cristal',
  terrain: 'canyon',
  skills: CALCUL_LITTERAL_SKILLS,
  creatures: [
    creature('4e-reducteur', 'Réducteur', 'Il range les $x$ avec les $x$, et les nombres avec les nombres.', ['4e-reduire'], { shape: 'blob', hue: 270, symbol: 'x+x' }),
    creature('4e-remplacor', 'Remplaçor', 'Il remplace chaque lettre par un nombre pour voir ce qui se passe.', ['4e-substituer'], { shape: 'insecte', hue: 290, symbol: 'x=' }),
    creature('4e-distributeau', 'Distributeau', 'Il distribue son facteur à chacun, sans oublier personne.', ['4e-developper-simple'], { shape: 'plante', hue: 250, symbol: 'k()' }),
    creature('4e-doublix', 'Doublix', 'Deux parenthèses, quatre produits : il ne s’en lasse pas.', ['4e-double-distributivite'], { shape: 'bete', hue: 300, symbol: '()²' }),
    creature('4e-factoriel', 'Factoriel', 'Il repère le facteur commun et le met de côté.', ['4e-factoriser', '4e-developper-simple'], { shape: 'spectre', hue: 260, symbol: 'k·' }),
  ],
  boss: bossOf('4e-litteralis', 'Littéralis, gardienne des grottes', 'Ses cristaux renferment des expressions qu’elle développe ou factorise à volonté.', CALCUL_LITTERAL_SKILLS, { shape: 'golem', hue: 280, symbol: 'ab' }),
  guide: [
    'Dans ces grottes, les cristaux sont des expressions littérales.',
    'Développer, c’est transformer un produit en somme ; factoriser, c’est l’inverse.',
  ],
};
