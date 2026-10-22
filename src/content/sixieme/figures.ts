import { FIGURES_SKILLS } from '../../exercises/sixieme/figures';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const FIGURES: ChapterDef = {
  id: '6e-figures',
  title: 'Triangles et quadrilatères',
  region: 'Désert des Polygones',
  theme: 'desert',
  terrain: 'desert',
  skills: FIGURES_SKILLS,
  creatures: [
    creature('trigonet', 'Trigonet', 'Un scarabée triangulaire dont les trois côtés sont parfois égaux.', ['6e-nature-triangle', '6e-isocele-longueur'], 'insecte', 40, '△'),
    creature('rectangor', 'Rectangor', 'Une bête trapue aux quatre angles droits.', ['6e-quadrilateres'], 'bete', 30, '▭'),
    creature('losangelle', 'Losangelle', 'Un oiseau du désert aux quatre côtés de même longueur.', ['6e-quadrilateres', '6e-vocabulaire-quadrilatere'], 'oiseau', 50, '◇'),
    creature('verifaux', 'Vérifaux', 'Un mirage qui affirme des choses vraies… ou fausses.', ['6e-vrai-faux-figures'], 'spectre', 45, 'V/F'),
    creature('isocelix', 'Isocélix', 'Un cactus rare à deux bras égaux.', ['6e-isocele-longueur', '6e-nature-triangle', '6e-vrai-faux-figures'], 'plante', 90, '≅'),
  ],
  boss: creature('polygonor', 'Polygonor, gardien du désert', 'Le gardien du désert, une pyramide de pierre aux faces parfaitement taillées.', FIGURES_SKILLS.map((s) => s.id), 'golem', 35, '□'),
  guide: [
    'Le Désert des Polygones est jonché de figures de pierre.',
    'Côtés égaux, angles droits, diagonales : ce sont les propriétés qui donnent leur nom aux figures.',
  ],
};
