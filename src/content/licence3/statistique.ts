import { STATISTIQUE_SKILLS } from '../../exercises/licence3/statistique';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const STATISTIQUE: ChapterDef = {
  id: 'l3-statistique',
  title: 'Statistique inférentielle',
  region: 'Plateaux des Estimateurs',
  theme: 'automne',
  terrain: 'montagne',
  skills: STATISTIQUE_SKILLS,
  creatures: [
    creature('l3-moyennard', 'Moyennard', 'Un renard qui fait la moyenne de tout ce qu’il trouve.', ['l3-moments-empiriques'], { shape: 'blob', hue: 30, symbol: 'x̄' }),
    creature('l3-sansbiais', 'Sansbiais', 'Un oiseau qui vise juste… en moyenne.', ['l3-estimateur-sans-biais', 'l3-moments-empiriques'], { shape: 'oiseau', hue: 40, symbol: 'θ̂' }),
    creature('l3-vraisemblynx', 'Vraisemblynx', 'Un lynx qui choisit toujours le paramètre le plus vraisemblable.', ['l3-maximum-vraisemblance'], { shape: 'bete', hue: 25, symbol: 'ℒ' }),
    creature('l3-intervallon', 'Intervallon', 'Une plante dont les branches encadrent la vraie valeur 95 fois sur 100.', ['l3-intervalle-confiance'], { shape: 'plante', hue: 50, symbol: 'IC' }),
    creature('l3-hypothesar', 'Hypothésar', 'Un spectre qui ne rejette une hypothèse qu’avec de bonnes raisons.', ['l3-test-hypothese', 'l3-intervalle-confiance'], { shape: 'spectre', hue: 15, symbol: 'H₀' }),
  ],
  boss: bossOf('l3-inferus', 'Inférus, gardien des plateaux', 'À partir d’un seul échantillon, il devine toute la population.', STATISTIQUE_SKILLS, { shape: 'spectre', hue: 35, symbol: 'θ' }),
  guide: [
    'Sur les Plateaux des Estimateurs, on remonte des données à la loi qui les a produites.',
    'Un estimateur est sans biais si son espérance est le paramètre cherché.',
  ],
};
