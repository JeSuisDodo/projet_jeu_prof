import { PROBABILITES_SKILLS } from '../../exercises/quatrieme/probabilites';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const PROBABILITES: ChapterDef = {
  id: '4e-probabilites',
  title: 'Probabilités',
  region: 'Grottes du Hasard',
  theme: 'nuit',
  terrain: 'canyon',
  skills: PROBABILITES_SKILLS,
  creatures: [
    creature('4e-pilouface', 'Pileouface', 'Une pièce vivante qui tombe une fois sur deux sur pile.', ['4e-proba-vocabulaire'], { shape: 'blob', hue: 240, symbol: '½' }),
    creature('4e-dedale', 'Dédale', 'Un dé qui roule dans les couloirs de la grotte.', ['4e-proba-de'], { shape: 'golem', hue: 230, symbol: '⚀' }),
    creature('4e-urnelle', 'Urnelle', 'Elle cache des boules de couleur dans son ventre.', ['4e-proba-urne'], { shape: 'spectre', hue: 260, symbol: 'P' }),
    creature('4e-contrarius', 'Contrarius', 'Il fait toujours le contraire : $1 - P(A)$.', ['4e-evenement-contraire'], { shape: 'oiseau', hue: 250, symbol: 'Ā' }),
    creature('4e-atout', 'Atout', 'Une chauve-souris qui tire toujours la bonne carte.', ['4e-proba-cartes', '4e-proba-urne'], { shape: 'insecte', hue: 280, symbol: '♠' }),
  ],
  boss: bossOf('4e-aleatus', 'Aléatus, gardien des grottes', 'Personne ne sait ce qu’il va faire… mais il connaît toutes les probabilités.', PROBABILITES_SKILLS, { shape: 'golem', hue: 245, symbol: 'P' }),
  guide: [
    'Dans les Grottes du Hasard, rien n’est certain, mais tout peut se calculer.',
    'Quand les issues sont équiprobables, $P = \\dfrac{\\text{issues favorables}}{\\text{issues possibles}}$.',
  ],
};
