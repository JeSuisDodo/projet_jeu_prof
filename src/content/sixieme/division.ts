import { DIVISION_SKILLS } from '../../exercises/sixieme/division';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const DIVISION: ChapterDef = {
  id: '6e-division',
  title: 'Division et divisibilité',
  region: 'Grottes du Partage',
  theme: 'cristal',
  terrain: 'canyon',
  skills: DIVISION_SKILLS,
  creatures: [
    creature('partageon', 'Partageon', 'Un blob de cristal qui partage tout en parts égales… et garde le reste.', ['6e-division-euclidienne', '6e-probleme-division'], 'blob', 270, '÷'),
    creature('multiplume', 'Multiplume', 'Un papillon qui ne se pose que sur les nombres de sa table.', ['6e-multiples'], 'insecte', 300, '×'),
    creature('critero', 'Critéro', 'Une bête qui devine d’un coup d’œil si un nombre se divise par 3 ou par 9.', ['6e-criteres', '6e-multiples'], 'bete', 250, '3|9'),
    creature('quotientin', 'Quotientin', 'Un poisson des lacs souterrains qui poursuit les décimales jusqu’au bout.', ['6e-division-decimale', '6e-quotient-approche'], 'poisson', 190, 'q'),
    creature('restegrotte', 'Restegrotte', 'Un spectre qui hante les grottes avec tous les restes oubliés.', ['6e-probleme-division', '6e-quotient-approche', '6e-criteres'], 'spectre', 280, 'r'),
  ],
  boss: creature('diviseron', 'Diviseron, gardien des grottes', 'Le gardien des grottes, taillé dans un bloc de cristal parfaitement divisible.', DIVISION_SKILLS.map((s) => s.id), 'golem', 260, '÷'),
  guide: [
    'Les Grottes du Partage brillent de cristaux bien rangés.',
    'Quotient, reste, multiples, critères de divisibilité : ici, tout se partage équitablement.',
  ],
};
