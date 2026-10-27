import { VARIANTES_6E } from '../../exercises/sixieme/variantes';
import { enrichChapters } from '../../exercises/variantes';
import type { GradeDef } from '../types';
import { AIRES } from './aires';
import { ANGLES } from './angles';
import { DIVISION } from './division';
import { DONNEES } from './donnees';
import { DROITES } from './droites';
import { DUREES } from './durees';
import { EXPRESSIONS } from './expressions';
import { FIGURES } from './figures';
import { FRACTIONS } from './fractions';
import { NOMBRES } from './nombres';
import { OPERATIONS } from './operations';
import { PERIMETRES } from './perimetres';
import { PROPORTIONNALITE } from './proportionnalite';
import { SOLIDES } from './solides';
import { SYMETRIE } from './symetrie';

/**
 * 6e (cycle 3) : un fichier par chapitre dans ce dossier, ajouté à la liste ci-dessous.
 * Les chapitres suivent le programme de cycle 3 et ses repères annuels de 6e : nombres et calculs,
 * puis géométrie, puis grandeurs et mesures.
 */
export const SIXIEME: GradeDef = {
  id: '6e',
  name: '6e',
  stage: 'college',
  island: 'Île des Découvertes',
  chapters: enrichChapters(
    [
      NOMBRES,
      OPERATIONS,
      DIVISION,
      FRACTIONS,
      EXPRESSIONS,
      PROPORTIONNALITE,
      DONNEES,
      DROITES,
      ANGLES,
      FIGURES,
      SYMETRIE,
      PERIMETRES,
      AIRES,
      SOLIDES,
      DUREES,
    ],
    VARIANTES_6E,
  ),
};
