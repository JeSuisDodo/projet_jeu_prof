import { PROPORTIONNALITE_SKILLS } from '../../exercises/quatrieme/proportionnalite';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const PROPORTIONNALITE: ChapterDef = {
  id: '4e-proportionnalite',
  title: 'Proportionnalité',
  region: 'Côte des Proportions',
  theme: 'plage',
  terrain: 'cote',
  skills: PROPORTIONNALITE_SKILLS,
  creatures: [
    creature('4e-croisette', 'Croisette', 'Une étoile de mer qui calcule en croix avec ses bras.', ['4e-quatrieme-proportionnelle'], { shape: 'insecte', hue: 20, symbol: '×' }),
    creature('4e-tableaucrabe', 'Tableaucrabe', 'Il vérifie que toutes les colonnes de son tableau ont le même coefficient.', ['4e-reconnaitre-proportionnalite'], { shape: 'bete', hue: 10, symbol: 'k' }),
    creature('4e-pourcentouille', 'Pourcentouille', 'Une mouette qui prélève toujours le même pourcentage du butin.', ['4e-pourcentage'], { shape: 'oiseau', hue: 200, symbol: '%' }),
    creature('4e-soldine', 'Soldine', 'Elle augmente ou baisse les prix au fil des marées.', ['4e-evolution'], { shape: 'poisson', hue: 180, symbol: '±%' }),
    creature('4e-cartographe', 'Cartographe', 'Il dessine la côte à l’échelle $\\frac{1}{25\\,000}$.', ['4e-echelle', '4e-quatrieme-proportionnelle'], { shape: 'oiseau', hue: 40, symbol: '1:n' }),
  ],
  boss: bossOf('4e-proportionnel', 'Proportionnel, gardien de la côte', 'Les vagues et le vent sont proportionnels sous son regard.', PROPORTIONNALITE_SKILLS, { shape: 'golem', hue: 190, symbol: '∝' }),
  guide: [
    'Sur la Côte des Proportions, tout grandit ensemble : double la quantité, double le prix.',
    'Produit en croix, pourcentages et échelles t’attendent.',
  ],
};
