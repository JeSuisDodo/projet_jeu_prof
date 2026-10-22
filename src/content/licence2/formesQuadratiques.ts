import { FORMES_QUADRATIQUES_SKILLS } from '../../exercises/licence2/formesQuadratiques';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const FORMES_QUADRATIQUES: ChapterDef = {
  id: 'l2-formes-quadratiques',
  title: 'Formes quadratiques et matrices symétriques',
  region: 'Cristaux Symétriques',
  theme: 'cristal',
  terrain: 'montagne',
  skills: FORMES_QUADRATIQUES_SKILLS,
  creatures: [
    creature('l2-quadrillon', 'Quadrillon', 'Un cristal qui range ses coefficients dans une matrice symétrique.', ['l2-matrice-forme-quadratique', 'l2-forme-polaire'], { shape: 'golem', hue: 275, symbol: 'q' }),
    creature('l2-polarix', 'Polarix', 'Il retrouve la forme bilinéaire cachée derrière chaque carré.', ['l2-forme-polaire', 'l2-matrice-forme-quadratique'], { shape: 'spectre', hue: 260, symbol: 'φ' }),
    creature('l2-gaussine', 'Gaussine', 'Une fée qui regroupe les termes en carrés parfaits.', ['l2-signature', 'l2-forme-definie-positive'], { shape: 'oiseau', hue: 290, symbol: 'sg' }),
    creature('l2-symetrion', 'Symétrion', 'Un cristal rare, identique à sa transposée.', ['l2-vp-symetrique', 'l2-forme-definie-positive', 'l2-signature'], { shape: 'golem', hue: 250, symbol: 'ᵗS' }),
  ],
  boss: bossOf('l2-sylvestor', 'Sylvestor, gardien des cristaux', 'Selon sa loi d’inertie, la signature ne change jamais.', FORMES_QUADRATIQUES_SKILLS, { shape: 'golem', hue: 280, symbol: 'S' }),
  guide: ['Les Cristaux Symétriques reflètent tout : chaque cristal est égal à sa transposée.', 'Une forme quadratique est définie positive quand $q(x) > 0$ pour tout $x \\neq 0$.'],
};
