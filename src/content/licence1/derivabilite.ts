import { DERIVABILITE_SKILLS } from '../../exercises/licence1/derivabilite';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const DERIVABILITE: ChapterDef = {
  id: 'l1-derivabilite',
  title: 'Dérivabilité',
  region: 'Crêtes des Dérivées',
  theme: 'foret',
  terrain: 'montagne',
  skills: DERIVABILITE_SKILLS,
  creatures: [
    creature('l1-tangentil', 'Tangentil', 'Un bouquetin qui suit toujours la pente de la tangente.', ['l1-derivee-composee', 'l1-tangente'], { shape: 'bete', hue: 120, symbol: 'f′' }),
    creature('l1-sommetin', 'Sommetin', 'Il se perche toujours là où la dérivée s’annule.', ['l1-extremum-local', 'l1-tangente'], { shape: 'oiseau', hue: 100, symbol: 'max' }),
    creature('l1-leibnizard', 'Leibnizard', 'Un lézard qui se dérive n fois sans se fatiguer.', ['l1-derivee-nieme', 'l1-derivee-composee'], { shape: 'insecte', hue: 140, symbol: 'f⁽ⁿ⁾' }),
    creature('l1-rollon', 'Rollon', 'Un rocher qui roule d’une crête à l’autre : quelque part, sa pente est la pente moyenne.', ['l1-accroissements-finis', 'l1-extremum-local'], { shape: 'golem', hue: 90, symbol: 'c' }),
  ],
  boss: bossOf('l1-derivatrix', 'Dérivatrix, gardienne des crêtes', 'Elle connaît la pente de chaque sentier, à chaque instant.', DERIVABILITE_SKILLS, { shape: 'golem', hue: 110, symbol: 'd/dx' }),
  guide: [
    'Les sentiers de ces crêtes montent et descendent : leur pente, c’est la dérivée.',
    'Accroissements finis : il existe $c$ entre $a$ et $b$ avec $f\'(c) = \\frac{f(b) - f(a)}{b - a}$.',
  ],
};
