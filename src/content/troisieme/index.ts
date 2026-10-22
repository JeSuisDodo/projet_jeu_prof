import type { GradeDef } from '../types';
import { ALGORITHMIQUE } from './algorithmique';
import { ARITHMETIQUE } from './arithmetique';
import { CALCUL_LITTERAL } from './calcul-litteral';
import { EQUATIONS } from './equations';
import { ESPACE } from './espace';
import { FONCTIONS } from './fonctions';
import { FONCTIONS_AFFINES } from './fonctions-affines';
import { GRANDEURS } from './grandeurs';
import { PROBABILITES } from './probabilites';
import { PROPORTIONNALITE } from './proportionnalite';
import { PUISSANCES } from './puissances';
import { PYTHAGORE } from './pythagore';
import { STATISTIQUES } from './statistiques';
import { THALES } from './thales';
import { TRANSFORMATIONS } from './transformations';
import { TRIGONOMETRIE } from './trigonometrie';

/** 3e (cycle 4, programme du brevet) : un fichier par chapitre dans ce dossier, dans l'ordre de l'année. */
export const TROISIEME: GradeDef = {
  id: '3e',
  name: '3e',
  stage: 'college',
  island: 'Île du Brevet',
  chapters: [
    ARITHMETIQUE,
    PUISSANCES,
    CALCUL_LITTERAL,
    EQUATIONS,
    FONCTIONS,
    FONCTIONS_AFFINES,
    PROPORTIONNALITE,
    GRANDEURS,
    PYTHAGORE,
    THALES,
    TRIGONOMETRIE,
    TRANSFORMATIONS,
    ESPACE,
    STATISTIQUES,
    PROBABILITES,
    ALGORITHMIQUE,
  ],
};
