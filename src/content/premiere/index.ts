import type { GradeDef } from '../types';
import { SECOND_DEGRE } from './second-degre';

/** 1re spécialité : un fichier par chapitre dans ce dossier, ajouté à la liste ci-dessous. */
export const PREMIERE: GradeDef = {
  id: '1re-spe',
  name: '1re spécialité',
  island: 'Île des Variations',
  chapters: [SECOND_DEGRE],
};
