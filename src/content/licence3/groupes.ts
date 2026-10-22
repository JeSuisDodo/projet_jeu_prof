import { GROUPES_SKILLS } from '../../exercises/licence3/groupes';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const GROUPES: ChapterDef = {
  id: 'l3-groupes',
  title: 'Groupes',
  region: 'Forêt des Permutations',
  theme: 'foret',
  terrain: 'foret',
  skills: GROUPES_SKILLS,
  creatures: [
    creature('l3-cyclon', 'Cyclon', 'Un insecte qui tourne en rond dans ℤ/nℤ.', ['l3-ordre-zn'], { shape: 'insecte', hue: 120, symbol: 'ℤₙ' }),
    creature('l3-permuton', 'Permuton', 'Une bête qui échange la place des arbres de la forêt.', ['l3-ordre-permutation'], { shape: 'bete', hue: 100, symbol: 'σ' }),
    creature('l3-signaline', 'Signaline', 'Un oiseau qui ne dit que « +1 » ou « −1 ».', ['l3-signature', 'l3-ordre-permutation'], { shape: 'oiseau', hue: 140, symbol: 'ε' }),
    creature('l3-generax', 'Générax', 'Un golem qui engendre tout le groupe à lui seul.', ['l3-generateurs-cycliques', 'l3-ordre-zn'], { shape: 'golem', hue: 110, symbol: '⟨g⟩' }),
    creature('l3-lagrangier', 'Lagrangier', 'Un arbre dont chaque branche a un ordre qui divise celui du tronc.', ['l3-lagrange', 'l3-groupe-produit'], { shape: 'plante', hue: 130, symbol: '|H|' }),
  ],
  boss: bossOf('l3-groupix', 'Groupix, gardien de la forêt', 'Il connaît chaque sous-groupe de la forêt et l’ordre de chacun de ses habitants.', GROUPES_SKILLS, { shape: 'bete', hue: 115, symbol: 'G' }),
  guide: [
    'Dans la Forêt des Permutations, les arbres changent de place selon des cycles.',
    'L’ordre d’une permutation est le PPCM des longueurs de ses cycles disjoints.',
  ],
};
