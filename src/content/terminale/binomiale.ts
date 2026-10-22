import { BINOMIALE_SKILLS } from '../../exercises/terminale/probabilites';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const BINOMIALE: ChapterDef = {
  id: 'tle-loi-binomiale',
  title: 'Succession d’épreuves indépendantes, loi binomiale',
  region: 'Prairie de Bernoulli',
  theme: 'prairie',
  terrain: 'riviere',
  skills: BINOMIALE_SKILLS,
  creatures: [
    creature('tle-bernoullapin', 'Bernoullapin', 'Un lapin qui saute ou ne saute pas : succès ou échec.', ['tle-epreuves-independantes', 'tle-binomiale-modele'], { shape: 'bete', hue: 100, symbol: 'p' }),
    creature('tle-binomouche', 'Binomouche', 'Une mouche qui compte ses succès sur n essais.', ['tle-binomiale-proba', 'tle-au-moins-un'], { shape: 'insecte', hue: 80, symbol: 'B' }),
    creature('tle-esperanceau', 'Espéranceau', 'Un oiseau qui prévoit en moyenne np succès.', ['tle-binomiale-esperance', 'tle-binomiale-cumul'], { shape: 'oiseau', hue: 60, symbol: 'np' }),
    creature('tle-cumulipe', 'Cumulipe', 'Une tulipe qui accumule les probabilités.', ['tle-binomiale-cumul', 'tle-au-moins-un'], { shape: 'plante', hue: 340, symbol: '≤k' }),
  ],
  boss: bossOf('tle-binomastodonte', 'Binomastodonte, gardien de la prairie', 'Il lance n dés à chaque pas.', BINOMIALE_SKILLS, { shape: 'golem', hue: 110, symbol: 'pᵏ' }),
  guide: [
    'La Prairie de Bernoulli est pleine de pièces, de dés et d’urnes : succès ou échec, à chaque fois !',
    'Quand on répète $n$ fois la même épreuve indépendante, le nombre de succès suit une loi binomiale.',
  ],
};
