import { SYSTEMES_SKILLS } from '../../exercises/licence1/systemes';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const SYSTEMES: ChapterDef = {
  id: 'l1-systemes-lineaires',
  title: 'Systèmes linéaires',
  region: 'Gorges des Systèmes',
  theme: 'automne',
  terrain: 'canyon',
  skills: SYSTEMES_SKILLS,
  creatures: [
    creature('l1-cramerou', 'Cramerou', 'Un hibou qui résout les systèmes 2 × 2 d’un coup de déterminant.', ['l1-systeme-2x2', 'l1-systeme-nombre-solutions'], { shape: 'oiseau', hue: 30, symbol: '2×2' }),
    creature('l1-pivoton', 'Pivoton', 'Il échelonne les rochers des gorges, ligne après ligne.', ['l1-systeme-3x3', 'l1-systeme-2x2'], { shape: 'golem', hue: 20, symbol: 'Lᵢ' }),
    creature('l1-compatin', 'Compatin', 'Un esprit qui sait dire si un système a zéro, une ou une infinité de solutions.', ['l1-systeme-nombre-solutions', 'l1-systeme-3x3'], { shape: 'spectre', hue: 40, symbol: '∅/∞' }),
    creature('l1-parametron', 'Paramétron', 'Une créature qui change de forme selon la valeur de m.', ['l1-systeme-parametre', 'l1-systeme-nombre-solutions'], { shape: 'bete', hue: 15, symbol: 'm' }),
  ],
  boss: bossOf('l1-gaussalith', 'Gaussalith, gardien des gorges', 'Un géant de pierre qui élimine les inconnues une à une.', SYSTEMES_SKILLS, { shape: 'golem', hue: 25, symbol: '⇄' }),
  guide: [
    'Dans ces gorges, chaque passage est une équation : il faut toutes les satisfaire en même temps.',
    'Pivot de Gauss : élimine une inconnue à la fois, puis remonte.',
  ],
};
