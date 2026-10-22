import { FONCTIONS_REFERENCE_SKILLS } from '../../exercises/seconde/fonctionsReference';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const FONCTIONS_REFERENCE: ChapterDef = {
  id: '2nde-fonctions-reference',
  title: 'Fonctions de référence',
  region: 'Marais des Courbes',
  theme: 'marais',
  skills: FONCTIONS_REFERENCE_SKILLS,
  creatures: [
    creature('carrapaud', 'Carrapaud', 'Un crapaud en forme de parabole. Il saute toujours vers deux solutions opposées.', ['2nde-carre-equation', '2nde-carre-inequation'], 'bete', 100, 'x²'),
    creature('hyperbulle', 'Hyperbulle', 'Une bulle qui flotte en hyperbole et retourne tout ce qu’elle touche.', ['2nde-inverse-equation', '2nde-comparer-images'], 'blob', 140, '1/x'),
    creature('racinoue', 'Racinoue', 'Une plante des marais qui ne pousse que sur les nombres positifs.', ['2nde-racine-equation', '2nde-comparer-images'], 'plante', 80, '√x'),
    creature('cubulle', 'Cubulle', 'Un poisson cubique, toujours croissant, qui nage aussi dans les eaux négatives.', ['2nde-cube-equation', '2nde-carre-inequation'], 'poisson', 160, 'x³'),
  ],
  boss: creature('courbor', 'Courbor, gardien du marais', 'Le gardien du marais. Il connaît par cœur la courbe de chaque fonction de référence.', FONCTIONS_REFERENCE_SKILLS.map((s) => s.id), 'golem', 110, 'f'),
  guide: [
    'Voici le Marais des Courbes, peuplé par les fonctions carré, inverse, racine carrée et cube.',
    'Leurs courbes et leurs variations te permettront de résoudre et de comparer sans calculatrice.',
  ],
};
