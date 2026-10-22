import type { GradeDef } from '../types';
import { ARITHMETIQUE } from './arithmetique';
import { CALCUL_LITTERAL } from './calcul-litteral';
import { DROITES } from './droites';
import { ENSEMBLES } from './ensembles';
import { ETUDE_FONCTIONS } from './etude-fonctions';
import { FONCTIONS_REFERENCE } from './fonctions-reference';
import { GEOMETRIE_PLAN } from './geometrie-plan';
import { INFORMATION_CHIFFREE } from './information-chiffree';
import { POSITIONS } from './positions';
import { PROBABILITES } from './probabilites';
import { STATISTIQUES } from './statistiques';
import { VARIATIONS } from './variations';
import { VECTEURS } from './vecteurs';

/** Seconde : un fichier par chapitre dans ce dossier, dans l'ordre du manuel Variations 2de (Hatier). */
export const SECONDE: GradeDef = {
  id: '2nde',
  name: 'Seconde',
  stage: 'lycee',
  island: 'Île des Fondations',
  chapters: [
    ENSEMBLES,
    ARITHMETIQUE,
    CALCUL_LITTERAL,
    GEOMETRIE_PLAN,
    VECTEURS,
    DROITES,
    POSITIONS,
    FONCTIONS_REFERENCE,
    ETUDE_FONCTIONS,
    VARIATIONS,
    INFORMATION_CHIFFREE,
    STATISTIQUES,
    PROBABILITES,
  ],
};
