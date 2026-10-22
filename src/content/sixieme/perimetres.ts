import { PERIMETRES_SKILLS } from '../../exercises/sixieme/mesures';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PERIMETRES: ChapterDef = {
  id: '6e-perimetres',
  title: 'Longueurs et périmètres',
  region: 'Sentier des Périmètres',
  theme: 'automne',
  terrain: 'foret',
  skills: PERIMETRES_SKILLS,
  creatures: [
    creature('convertix', 'Convertix', 'Un écureuil qui saute d’une colonne à l’autre du tableau de conversion.', ['6e-conversion-longueur'], 'bete', 30, 'm'),
    creature('tourdumonde', 'Tourdumonde', 'Une chenille qui fait le tour de chaque figure.', ['6e-perimetre-polygone', '6e-cote-manquant'], 'insecte', 60, 'P'),
    creature('piroulette', 'Piroulette', 'Une feuille ronde qui roule et mesure le tour des cercles.', ['6e-perimetre-cercle'], 'plante', 20, 'π'),
    creature('demitour', 'Demi-tour', 'Un oiseau rare qui retrouve un côté à partir du périmètre.', ['6e-cote-manquant', '6e-perimetre-cercle', '6e-conversion-longueur'], 'oiseau', 15, '½P'),
  ],
  boss: creature('arpenteur', 'Arpenteur, gardien du sentier', 'Le gardien du sentier, qui a mesuré chaque chemin de l’île.', PERIMETRES_SKILLS.map((s) => s.id), 'golem', 25, 'km'),
  guide: [
    'Le Sentier des Périmètres fait le tour de toute une forêt.',
    'Mets toutes les longueurs dans la même unité avant de les additionner.',
  ],
};
