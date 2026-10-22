import { DIVISIBILITE_SKILLS } from '../../exercises/cinquieme/divisibilite';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const DIVISIBILITE: ChapterDef = {
  id: '5e-divisibilite',
  title: 'Multiples, diviseurs et nombres premiers',
  region: 'Grottes des Diviseurs',
  theme: 'cristal',
  terrain: 'canyon',
  skills: DIVISIBILITE_SKILLS,
  creatures: [
    creature('critero', 'Critéro', 'Un blob de cristal qui devine d’un coup d’œil si un nombre est divisible par 2, 3, 5 ou 9.', ['5e-divisibilite'], 'blob', 280, '÷'),
    creature('primou', 'Primou', 'Un papillon indivisible : il ne se partage qu’en un ou en lui-même.', ['5e-premier'], 'insecte', 300, 'p'),
    creature('divisaure', 'Divisaure', 'Une bête qui collectionne tous les diviseurs d’un nombre.', ['5e-diviseurs', '5e-divisibilite'], 'bete', 260, 'd'),
    creature('restolin', 'Restolin', 'Un poisson des lacs souterrains qui garde toujours le reste de la division.', ['5e-division-euclidienne'], 'poisson', 220, 'r'),
    creature('multipede', 'Multipède', 'Un mille-pattes qui avance de multiple en multiple.', ['5e-multiples', '5e-premier'], 'insecte', 320, '×'),
  ],
  boss: creature('cristalor', 'Cristalor, gardien des grottes', 'Le gardien des grottes, taillé dans un nombre premier géant.', DIVISIBILITE_SKILLS.map((s) => s.id), 'golem', 290, '÷'),
  guide: [
    'Les Grottes des Diviseurs scintillent de cristaux.',
    'Multiples, diviseurs, restes et nombres premiers t’attendent au fond des galeries.',
  ],
};
