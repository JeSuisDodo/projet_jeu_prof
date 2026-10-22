import { ENSEMBLES_SKILLS } from '../../exercises/seconde/ensembles';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const ENSEMBLES: ChapterDef = {
  id: '2nde-ensembles',
  title: 'Ensembles de nombres',
  region: 'Prairie des Nombres',
  theme: 'prairie',
  skills: ENSEMBLES_SKILLS,
  creatures: [
    creature('naturon', 'Naturon', 'Un petit blob qui ne compte que sur ses doigts. Il range chaque nombre dans le bon ensemble.', ['2nde-ensemble'], 'blob', 110, 'ℕ'),
    creature('crochetin', 'Crochetin', 'Un scarabée aux mandibules en crochets : ouvertes ou fermées, elles disent si la borne est incluse.', ['2nde-intervalle', '2nde-ensemble'], 'insecte', 40, '[ ]'),
    creature('absolon', 'Absolon', 'Un oiseau qui ne vole jamais en dessous de zéro : il mesure les distances sans se soucier du signe.', ['2nde-distance-abs', '2nde-abs-equation'], 'oiseau', 200, '|x|'),
    creature('unissou', 'Unissou', 'Une plante à deux tiges qui se rejoignent : elle sait ce que deux intervalles ont en commun.', ['2nde-inter-union', '2nde-intervalle'], 'plante', 150, '∩'),
  ],
  boss: creature('reelix', 'Réélix, gardien de la prairie', 'Le gardien de la région. Il connaît tous les nombres réels, même ceux qui ne s’écrivent pas en fraction.', ENSEMBLES_SKILLS.map((s) => s.id), 'golem', 95, 'ℝ'),
  guide: [
    'Bienvenue dans la Prairie des Nombres, la première région de l’Île des Fondations !',
    'Ici, les créatures te demanderont de ranger les nombres dans $\\mathbb{N}$, $\\mathbb{Z}$, $\\mathbb{D}$, $\\mathbb{Q}$ ou $\\mathbb{R}$, et de manier intervalles et valeurs absolues.',
  ],
};
