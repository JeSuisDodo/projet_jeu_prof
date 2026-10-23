import { DL_SKILLS } from '../../exercises/licence1/dl';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const DL: ChapterDef = {
  id: 'l1-developpements-limites',
  title: 'Développements limités',
  region: 'Marais des Développements',
  theme: 'marais',
  terrain: 'marais',
  skills: DL_SKILLS,
  creatures: [
    creature('l1-taylorette', 'Taylorette', 'Une grenouille qui récite les développements usuels en coassant.', ['l1-dl-usuel', 'l1-dl-limite'], { shape: 'bete', hue: 100, symbol: 'o(x)' }),
    creature('l1-negligeon', 'Négligeon', 'Il ne garde que le premier terme non nul et néglige tout le reste.', ['l1-dl-equivalent', 'l1-dl-usuel'], { shape: 'blob', hue: 80, symbol: '∼' }),
    creature('l1-produisse', 'Produisse', 'Une libellule qui multiplie deux développements sans dépasser l’ordre voulu.', ['l1-dl-produit', 'l1-dl-limite'], { shape: 'insecte', hue: 120, symbol: '×' }),
    creature('l1-composite', 'Composite', 'Une plante qui pousse dans une autre plante : f(g(x)).', ['l1-dl-composition', 'l1-dl-equivalent'], { shape: 'plante', hue: 90, symbol: 'f∘g' }),
  ],
  boss: bossOf('l1-maclaurus', 'Maclaurus, gardien du marais', 'Il approche toute fonction par un polynôme, à o(xⁿ) près.', DL_SKILLS, { shape: 'golem', hue: 105, symbol: 'DL' }),
  guide: [
    'Ce marais est trouble : on n’y voit que les premiers termes des fonctions.',
    'Retiens : $e^x = 1 + x + \\frac{x^2}{2} + o(x^2)$ et $\\ln(1 + x) = x - \\frac{x^2}{2} + o(x^2)$.',
  ],
};
