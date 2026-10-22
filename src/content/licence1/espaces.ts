import { ESPACES_SKILLS } from '../../exercises/licence1/espaces';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const ESPACES: ChapterDef = {
  id: 'l1-espaces-vectoriels',
  title: 'Espaces vectoriels',
  region: 'Archipel des Bases',
  theme: 'nuit',
  terrain: 'archipel',
  skills: ESPACES_SKILLS,
  creatures: [
    creature('l1-librellule', 'Librellule', 'Une libellule dont les ailes ne sont jamais combinaison les unes des autres.', ['l1-famille-libre', 'l1-dimensions-usuelles'], { shape: 'insecte', hue: 260, symbol: 'λᵢ' }),
    creature('l1-dimensiole', 'Dimensiole', 'Elle compte les vecteurs de chaque base, sans en oublier un.', ['l1-dimensions-usuelles', 'l1-coordonnees-base'], { shape: 'oiseau', hue: 240, symbol: 'dim' }),
    creature('l1-coordonnee', 'Coordonnée', 'Un poisson qui se repère dans n’importe quelle base.', ['l1-coordonnees-base', 'l1-famille-libre'], { shape: 'poisson', hue: 225, symbol: 'xᵢ' }),
    creature('l1-grassmanne', 'Grassmanne', 'Un spectre qui vit dans l’intersection de deux sous-espaces.', ['l1-dimension-sous-espace', 'l1-famille-parametre'], { shape: 'spectre', hue: 280, symbol: 'F∩G' }),
  ],
  boss: bossOf('l1-vectorion', 'Vectorion, gardien de l’archipel', 'Il engendre chaque île par combinaisons linéaires de ses vecteurs.', ESPACES_SKILLS, { shape: 'golem', hue: 250, symbol: 'Vect' }),
  guide: [
    'Chaque île de cet archipel est un espace vectoriel : on s’y déplace par combinaisons linéaires.',
    'Trois vecteurs de $\\mathbb{R}^3$ forment une base si et seulement si leur déterminant est non nul.',
  ],
};
