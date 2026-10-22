import { TRIGONOMETRIE_SKILLS } from '../../exercises/terminale/trigonometrie';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const TRIGONOMETRIE: ChapterDef = {
  id: 'tle-trigonometrie',
  title: 'Fonctions sinus et cosinus',
  region: 'Désert des Sinus',
  theme: 'desert',
  terrain: 'desert',
  skills: TRIGONOMETRIE_SKILLS,
  creatures: [
    creature('tle-sinuscorpion', 'Sinuscorpion', 'Un scorpion dont la queue ondule comme une sinusoïde.', ['tle-trigo-valeurs', 'tle-trigo-derivee'], { shape: 'insecte', hue: 40, symbol: 'sin' }),
    creature('tle-cosinard', 'Cosinard', 'Un renard des sables qui fait toujours le tour du cercle avant de revenir.', ['tle-trigo-valeurs', 'tle-trigo-periode'], { shape: 'bete', hue: 30, symbol: 'cos' }),
    creature('tle-paritruche', 'Paritruche', 'Une autruche symétrique : elle sait si une fonction est paire ou impaire.', ['tle-trigo-parite', 'tle-trigo-equation'], { shape: 'oiseau', hue: 50, symbol: '±x' }),
    creature('tle-dunapi', 'Dunapi', 'Un ver des dunes qui revient toujours à son point de départ après un tour complet.', ['tle-trigo-equation', 'tle-trigo-limite'], { shape: 'poisson', hue: 35, symbol: 'π' }),
  ],
  boss: bossOf('tle-cyclopharaon', 'Cyclopharaon, gardien du désert', 'Gardien du cercle trigonométrique, tourné vers toutes les directions.', TRIGONOMETRIE_SKILLS, { shape: 'golem', hue: 45, symbol: '2π' }),
  guide: [
    'Dans le Désert des Sinus, les dunes se répètent à l’infini, toutes les $2\\pi$.',
    'Connais bien ton cercle trigonométrique : il te servira de boussole.',
  ],
};
