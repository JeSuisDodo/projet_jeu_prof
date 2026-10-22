import { VECTEURS_ESPACE_SKILLS } from '../../exercises/terminale/espace';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const VECTEURS_ESPACE: ChapterDef = {
  id: 'tle-vecteurs-espace',
  title: 'Vecteurs, droites et plans de l’espace',
  region: 'Pics de l’Espace',
  theme: 'neige',
  terrain: 'montagne',
  skills: VECTEURS_ESPACE_SKILLS,
  creatures: [
    creature('tle-vectaigle', 'Vectaigle', 'Un aigle qui vole en ligne droite d’un point à un autre.', ['tle-espace-vecteur', 'tle-espace-milieu'], { shape: 'oiseau', hue: 210, symbol: '→' }),
    creature('tle-colinours', 'Colinours', 'Un ours polaire qui ne marche que dans une seule direction.', ['tle-espace-colineaires', 'tle-espace-point-droite'], { shape: 'bete', hue: 200, symbol: 'k·u' }),
    creature('tle-coplanete', 'Coplanète', 'Une petite sphère qui décompose tout vecteur selon deux directions.', ['tle-espace-combinaison', 'tle-espace-colineaires'], { shape: 'blob', hue: 220, symbol: 'αβ' }),
    creature('tle-droitelle', 'Droitelle', 'Une étoile filante qui suit une droite paramétrée.', ['tle-espace-point-droite', 'tle-espace-milieu'], { shape: 'spectre', hue: 190, symbol: 't' }),
  ],
  boss: bossOf('tle-tridimon', 'Tridimon, gardien des pics', 'Un géant de glace qui vit dans les trois dimensions.', VECTEURS_ESPACE_SKILLS, { shape: 'golem', hue: 215, symbol: 'xyz' }),
  guide: [
    'Sur les Pics de l’Espace, on ne se déplace plus sur une carte plate : il faut trois coordonnées !',
    'Les vecteurs de l’espace se manipulent comme ceux du plan, avec une coordonnée $z$ en plus.',
  ],
};
