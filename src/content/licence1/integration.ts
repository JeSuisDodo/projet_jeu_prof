import { INTEGRATION_SKILLS } from '../../exercises/licence1/integration';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const INTEGRATION: ChapterDef = {
  id: 'l1-integration',
  title: 'Intégration',
  region: 'Lac des Intégrales',
  theme: 'cristal',
  terrain: 'lac',
  skills: INTEGRATION_SKILLS,
  creatures: [
    creature('l1-arctanguille', 'Arctanguille', 'Une anguille qui reconnaît toutes les primitives usuelles.', ['l1-primitives-usuelles', 'l1-changement-variable'], { shape: 'poisson', hue: 280, symbol: '∫' }),
    creature('l1-substitue', 'Substitue', 'Un cristal qui change de variable pour mieux briller.', ['l1-changement-variable', 'l1-elements-simples'], { shape: 'blob', hue: 260, symbol: 'φ' }),
    creature('l1-parpartie', 'Parpartie', 'Un esprit qui découpe chaque intégrale en [uv] − ∫u′v.', ['l1-integration-parties', 'l1-primitives-usuelles'], { shape: 'spectre', hue: 290, symbol: 'uv′' }),
    creature('l1-riemanta', 'Riemanta', 'Une raie qui découpe l’aire en rectangles de plus en plus fins.', ['l1-sommes-riemann', 'l1-elements-simples'], { shape: 'poisson', hue: 250, symbol: 'Σ/n' }),
  ],
  boss: bossOf('l1-integrallax', 'Intégrallax, gardien du lac', 'Il mesure l’aire de chaque reflet sur le lac de cristal.', INTEGRATION_SKILLS, { shape: 'golem', hue: 270, symbol: '∫ₐᵇ' }),
  guide: [
    'Les cristaux de ce lac mesurent des aires : c’est le domaine des intégrales.',
    'Intégration par parties : $\\int_a^b uv\' = [uv]_a^b - \\int_a^b u\'v$.',
  ],
};
