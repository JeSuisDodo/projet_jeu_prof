import { FRACTIONS_SKILLS } from '../../exercises/cinquieme/fractions';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const FRACTIONS: ChapterDef = {
  id: '5e-fractions',
  title: 'Fractions',
  region: 'Bois des Fractions',
  theme: 'automne',
  terrain: 'foret',
  skills: FRACTIONS_SKILLS,
  creatures: [
    creature('egalou', 'Égalou', 'Un blob qui change de taille sans jamais changer de valeur : 1/2, 2/4, 3/6…', ['5e-fraction-egale'], 'blob', 30, '='),
    creature('simplifeuille', 'Simplifeuille', 'Une plante qui perd ses facteurs communs comme des feuilles mortes.', ['5e-fraction-simplifier'], 'plante', 40, '÷'),
    creature('compario', 'Compario', 'Un oiseau qui met les fractions au même dénominateur avant de les comparer.', ['5e-fraction-comparer'], 'oiseau', 20, '<'),
    creature('quantilope', 'Quantilope', 'Une bête qui prend toujours les trois quarts du butin.', ['5e-fraction-quantite', '5e-quotient'], 'bete', 15, '¾'),
    creature('sommurai', 'Sommurai', 'Un spectre d’automne qui additionne les fractions d’un seul coup de lame.', ['5e-fraction-somme', '5e-fraction-egale'], 'spectre', 350, '+'),
  ],
  boss: creature('denominax', 'Dénominax, gardien du bois', 'Le gardien du bois partage chaque arbre en parts égales.', FRACTIONS_SKILLS.map((s) => s.id), 'golem', 25, 'a/b'),
  guide: [
    'Le Bois des Fractions se partage en parts égales.',
    'Simplifie, compare, additionne : chaque feuille compte !',
  ],
};
