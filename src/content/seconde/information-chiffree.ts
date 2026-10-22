import { INFORMATION_CHIFFREE_SKILLS } from '../../exercises/seconde/informationChiffree';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const INFORMATION_CHIFFREE: ChapterDef = {
  id: '2nde-information-chiffree',
  title: 'Information chiffrée',
  region: 'Bazar des Pourcentages',
  theme: 'desert',
  terrain: 'desert',
  skills: INFORMATION_CHIFFREE_SKILLS,
  creatures: [
    creature('proportionnel', 'Proportionnel', 'Un blob marchand qui sait toujours quelle part du gâteau revient à chacun.', ['2nde-proportion', '2nde-proportion-proportion'], 'blob', 50, '%'),
    creature('soldine', 'Soldine', 'Un oiseau des étals qui applique remises et hausses en un battement d’ailes.', ['2nde-valeur-finale', '2nde-coef-multiplicateur'], 'oiseau', 35, '×1,2'),
    creature('evolutor', 'Évolutor', 'Une bête qui grandit et rétrécit de quelques pour cent à chaque marché.', ['2nde-taux-evolution', '2nde-evolutions-successives'], 'bete', 45, 't'),
    creature('reciprok', 'Réciprok', 'Un insecte qui défait toujours ce qui a été fait : après une hausse, il trouve la baisse qui annule tout.', ['2nde-evolution-reciproque', '2nde-evolutions-successives', '2nde-coef-multiplicateur'], 'insecte', 55, '1/CM'),
  ],
  boss: creature('pourcentaure', 'Pourcentaure, gardien du bazar', 'Le gardien du bazar, mi-marchand mi-calculatrice. Personne ne le trompe sur un prix.', INFORMATION_CHIFFREE_SKILLS.map((s) => s.id), 'golem', 40, '%'),
  guide: [
    'Bienvenue au Bazar des Pourcentages ! Ici, tout augmente et tout baisse.',
    'Proportions, taux d’évolution et coefficients multiplicateurs : ne te fais pas avoir sur les prix.',
  ],
};
