import { DENOMBREMENT_SKILLS } from '../../exercises/terminale/denombrement';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const DENOMBREMENT: ChapterDef = {
  id: 'tle-denombrement',
  title: 'Combinatoire et dénombrement',
  region: 'Grottes du Dénombrement',
  theme: 'nuit',
  terrain: 'canyon',
  skills: DENOMBREMENT_SKILLS,
  creatures: [
    creature('tle-factorielle', 'Factoriguêpe', 'Une guêpe qui range ses n alvéoles de n! façons.', ['tle-permutations', 'tle-arrangements'], { shape: 'insecte', hue: 50, symbol: 'n!' }),
    creature('tle-combinours', 'Combinours', 'Un ours qui choisit ses pots de miel sans se soucier de l’ordre.', ['tle-combinaisons', 'tle-denombrement-condition'], { shape: 'bete', hue: 30, symbol: 'C' }),
    creature('tle-uplechauve', 'Upléchauve', 'Une chauve-souris qui teste tous les codes possibles, chiffre par chiffre.', ['tle-k-uplets', 'tle-parties'], { shape: 'oiseau', hue: 260, symbol: 'nᵏ' }),
    creature('tle-modelfe', 'Modelfe', 'Un elfe des grottes qui reconnaît le bon modèle de dénombrement.', ['tle-denombrement-modele', 'tle-arrangements'], { shape: 'spectre', hue: 230, symbol: '2ⁿ' }),
  ],
  boss: bossOf('tle-pascalithe', 'Pascalithe, gardien des grottes', 'Un golem bâti en triangle, chaque pierre est la somme des deux du dessus.', DENOMBREMENT_SKILLS, { shape: 'golem', hue: 240, symbol: '△' }),
  guide: [
    'Dans les Grottes du Dénombrement, il faut compter sans se tromper : chaque chemin, chaque rangement, chaque tirage.',
    'Pose-toi toujours deux questions : l’ordre compte-t-il ? Les répétitions sont-elles possibles ?',
  ],
};
