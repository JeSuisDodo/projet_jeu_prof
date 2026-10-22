import { PROPORTIONNALITE_3E } from '../../exercises/troisieme/proportionnalite';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PROPORTIONNALITE: ChapterDef = {
  id: '3e-proportionnalite',
  title: 'Proportionnalité et pourcentages',
  region: 'Port des Pourcentages',
  theme: 'plage',
  terrain: 'cote',
  skills: PROPORTIONNALITE_3E,
  creatures: [
    creature('croisille', 'Croisille', 'Un crabe qui fait des produits en croix avec ses pinces.', ['3e-quatrieme-proportionnelle'], 'insecte', 20, '×'),
    creature('centimouette', 'Centimouette', 'Une mouette qui prélève toujours un pourcentage de ta pêche.', ['3e-pourcentage', '3e-quatrieme-proportionnelle'], 'oiseau', 200, '%'),
    creature('coefficiale', 'Coefficiale', 'Une baleine qui grossit d’un coefficient multiplicateur à chaque marée.', ['3e-coefficient-multiplicateur', '3e-evolution'], 'poisson', 210, '×k'),
    creature('ratiolle', 'Ratiolle', 'Un blob qui partage ses trésors selon un ratio parfaitement juste.', ['3e-ratio'], 'blob', 40, '2:3'),
    creature('soldorade', 'Soldorade', 'Un poisson doré des soldes : il enchaîne les hausses et les baisses.', ['3e-evolutions-successives', '3e-evolution'], 'poisson', 45, '±%'),
  ],
  boss: creature('capitaine-cent', 'Capitaine Cent, gardien du port', 'Le gardien du port, qui compte tout sur cent.', PROPORTIONNALITE_3E.map((s) => s.id), 'golem', 30, '%'),
  guide: ['Au Port des Pourcentages, tout se vend, s’achète et se solde.', 'Proportionnalité, coefficients multiplicateurs et ratios : sors ta calculatrice !'],
};
