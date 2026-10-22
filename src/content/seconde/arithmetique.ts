import { ARITHMETIQUE_SKILLS } from '../../exercises/seconde/arithmetique';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const ARITHMETIQUE: ChapterDef = {
  id: '2nde-arithmetique',
  title: 'Arithmétique',
  region: 'Grottes des Premiers',
  theme: 'cristal',
  terrain: 'canyon',
  skills: ARITHMETIQUE_SKILLS,
  creatures: [
    creature('restou', 'Restou', 'Un blob qui partage tout en parts égales et garde toujours le reste pour lui.', ['2nde-reste', '2nde-diviseurs'], 'blob', 270, 'r'),
    creature('primelle', 'Primelle', 'Un papillon de cristal indivisible : on ne peut le partager qu’en un ou en lui-même.', ['2nde-premier'], 'insecte', 300, 'p'),
    creature('facteurix', 'Facteurix', 'Une bête qui casse les grands nombres en petits cristaux premiers.', ['2nde-decomposition', '2nde-diviseurs'], 'bete', 250, '×'),
    creature('simplifiou', 'Simplifiou', 'Un poisson des lacs souterrains qui réduit toutes les fractions à leur plus simple expression.', ['2nde-irreductible', '2nde-pgcd'], 'poisson', 190, '÷'),
  ],
  boss: creature('cristallon', 'Cristallon, gardien des grottes', 'Le gardien des grottes, taillé dans un nombre premier géant.', ARITHMETIQUE_SKILLS.map((s) => s.id), 'golem', 280, '÷'),
  guide: [
    'Les Grottes des Premiers brillent de cristaux indivisibles.',
    'Diviseurs, multiples, nombres premiers et fractions irréductibles : c’est ici que tout se décompose.',
  ],
};
