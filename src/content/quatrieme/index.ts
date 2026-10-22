import type { GradeDef } from '../types';
import { ARITHMETIQUE } from './arithmetique';
import { CALCUL_LITTERAL } from './calcul-litteral';
import { EQUATIONS } from './equations';
import { ESPACE } from './espace';
import { FRACTIONS } from './fractions';
import { PROBABILITES } from './probabilites';
import { PROPORTIONNALITE } from './proportionnalite';
import { PUISSANCES } from './puissances';
import { PYTHAGORE } from './pythagore';
import { RELATIFS } from './relatifs';
import { STATISTIQUES } from './statistiques';
import { THALES } from './thales';
import { TRANSFORMATIONS } from './transformations';
import { VITESSES } from './vitesses';

/**
 * 4e (cycle 4) : un fichier par chapitre dans ce dossier, ajouté à la liste ci-dessous.
 * Ordre : nombres et calculs, puis grandeurs, géométrie, enfin données et hasard.
 */
export const QUATRIEME: GradeDef = {
  id: '4e',
  name: '4e',
  stage: 'college',
  island: 'Île des Passerelles',
  chapters: [
    RELATIFS,
    FRACTIONS,
    PUISSANCES,
    CALCUL_LITTERAL,
    EQUATIONS,
    ARITHMETIQUE,
    PROPORTIONNALITE,
    VITESSES,
    PYTHAGORE,
    THALES,
    TRANSFORMATIONS,
    ESPACE,
    STATISTIQUES,
    PROBABILITES,
  ],
};
