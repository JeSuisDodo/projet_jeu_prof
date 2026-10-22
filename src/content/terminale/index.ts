import type { GradeDef } from '../types';
import { SUITES } from './suites';
import { LIMITES_SUITES } from './limitesSuites';
import { LIMITES_FONCTIONS } from './limitesFonctions';
import { CONTINUITE } from './continuite';
import { DERIVATION } from './derivation';
import { LOGARITHME } from './logarithme';
import { TRIGONOMETRIE } from './trigonometrie';
import { PRIMITIVES } from './primitives';
import { INTEGRALES } from './integrales';
import { DENOMBREMENT } from './denombrement';
import { VECTEURS_ESPACE } from './vecteursEspace';
import { ORTHOGONALITE } from './orthogonalite';
import { PARAMETRIQUES } from './parametriques';
import { BINOMIALE } from './binomiale';
import { SOMMES_VA } from './sommesVA';

/** Terminale spécialité : un fichier par chapitre dans ce dossier, ajouté à la liste ci-dessous. */
export const TERMINALE: GradeDef = {
  id: 'tle-spe',
  name: 'Terminale spécialité',
  stage: 'lycee',
  island: 'Île des Sommets',
  chapters: [SUITES, LIMITES_SUITES, LIMITES_FONCTIONS, CONTINUITE, DERIVATION, LOGARITHME, TRIGONOMETRIE, PRIMITIVES, INTEGRALES, DENOMBREMENT, VECTEURS_ESPACE, ORTHOGONALITE, PARAMETRIQUES, BINOMIALE, SOMMES_VA],
};
