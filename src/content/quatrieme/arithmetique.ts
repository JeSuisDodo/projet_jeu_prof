import { ARITHMETIQUE_SKILLS } from '../../exercises/quatrieme/arithmetique';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const ARITHMETIQUE: ChapterDef = {
  id: '4e-arithmetique',
  title: 'Nombres premiers et divisibilité',
  region: 'Marais des Diviseurs',
  theme: 'marais',
  terrain: 'marais',
  skills: ARITHMETIQUE_SKILLS,
  creatures: [
    creature('4e-criterix', 'Critérix', 'D’un coup d’œil sur les chiffres, il sait par quoi un nombre se divise.', ['4e-criteres-divisibilite'], { shape: 'insecte', hue: 100, symbol: '÷3' }),
    creature('4e-diviseurbe', 'Diviseurbe', 'Une grenouille qui saute de diviseur en diviseur.', ['4e-liste-diviseurs'], { shape: 'bete', hue: 110, symbol: 'd' }),
    creature('4e-primevere', 'Primevère', 'Une fleur rare : elle n’a que deux diviseurs, 1 et elle-même.', ['4e-nombre-premier'], { shape: 'plante', hue: 80, symbol: 'p' }),
    creature('4e-multiplouf', 'Multiplouf', 'Deux bulles qui remontent ensemble au premier multiple commun.', ['4e-multiple-commun'], { shape: 'blob', hue: 130, symbol: 'm' }),
    creature('4e-decompost', 'Décompost', 'Il décompose tout en facteurs premiers, même les plus coriaces.', ['4e-decomposition', '4e-nombre-premier'], { shape: 'spectre', hue: 90, symbol: '2·3' }),
  ],
  boss: bossOf('4e-eratos', 'Ératos, gardien du marais', 'Il crible le marais pour ne garder que les nombres premiers.', ARITHMETIQUE_SKILLS, { shape: 'golem', hue: 95, symbol: 'ℙ' }),
  guide: [
    'Bienvenue au Marais des Diviseurs. Les nombres premiers y sont rares et précieux.',
    'Un nombre premier a exactement deux diviseurs : 1 et lui-même.',
  ],
};
