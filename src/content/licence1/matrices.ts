import { MATRICES_SKILLS } from '../../exercises/licence1/matrices';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const MATRICES: ChapterDef = {
  id: 'l1-matrices',
  title: 'Matrices',
  region: 'Glacier des Matrices',
  theme: 'neige',
  terrain: 'desert',
  skills: MATRICES_SKILLS,
  creatures: [
    creature('l1-produitrix', 'Produitrix', 'Un pingouin qui multiplie les lignes par les colonnes.', ['l1-produit-matriciel', 'l1-trace-transposee'], { shape: 'oiseau', hue: 210, symbol: 'AB' }),
    creature('l1-determinou', 'Déterminou', 'Un bloc de glace dont le volume est son déterminant.', ['l1-determinant', 'l1-produit-matriciel'], { shape: 'golem', hue: 200, symbol: 'det' }),
    creature('l1-inversaile', 'Inversaile', 'Il défait tout ce qu’une matrice a fait.', ['l1-inverse-matrice', 'l1-trace-transposee'], { shape: 'spectre', hue: 220, symbol: 'A⁻¹' }),
    creature('l1-nilpotin', 'Nilpotin', 'Une créature qui disparaît après quelques puissances : Nᵏ = 0.', ['l1-puissance-matrice', 'l1-rang-matrice'], { shape: 'blob', hue: 190, symbol: 'Aⁿ' }),
  ],
  boss: bossOf('l1-matrixor', 'Matrixor, gardien du glacier', 'Ses cristaux de glace sont rangés en lignes et en colonnes.', MATRICES_SKILLS, { shape: 'golem', hue: 205, symbol: 'aᵢⱼ' }),
  guide: [
    'Ce glacier est fait de blocs rangés en tableaux : des matrices.',
    'Le coefficient $(i, j)$ de $AB$ est la ligne $i$ de $A$ fois la colonne $j$ de $B$.',
  ],
};
