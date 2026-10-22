import { EQUATIONS_3E } from '../../exercises/troisieme/equations';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const EQUATIONS: ChapterDef = {
  id: '3e-equations',
  title: 'Équations et inéquations',
  region: 'Lac de l’Équilibre',
  theme: 'prairie',
  terrain: 'lac',
  skills: EQUATIONS_3E,
  creatures: [
    creature('balancine', 'Balancine', 'Un poisson qui garde toujours les deux plateaux de la balance en équilibre.', ['3e-equation'], 'poisson', 190, '='),
    creature('enigmouette', 'Énigmouette', 'Un oiseau qui pense à un nombre et te demande de le retrouver.', ['3e-mise-en-equation', '3e-equation'], 'oiseau', 45, '?'),
    creature('nulinot', 'Nulinot', 'Un blob persuadé qu’un produit est nul dès qu’un de ses facteurs l’est (et il a raison).', ['3e-produit-nul'], 'blob', 170, '0'),
    creature('carrelac', 'Carrelac', 'Un poisson à deux têtes : une positive, une négative.', ['3e-equation-carre', '3e-produit-nul'], 'poisson', 220, '±'),
    creature('inegalion', 'Inégalion', 'Une bête qui fait volte-face dès qu’on la divise par un nombre négatif.', ['3e-inequation', '3e-mise-en-equation'], 'bete', 260, '<'),
  ],
  boss: creature('equilibrium', 'Équilibrium, gardien du lac', 'Le gardien du lac, posé sur une immense balance de pierre.', EQUATIONS_3E.map((s) => s.id), 'golem', 200, '='),
  guide: ['Le Lac de l’Équilibre est calme : ce qui est fait à gauche doit être fait à droite.', 'Équations, produits nuls et inéquations : garde l’équilibre !'],
};
