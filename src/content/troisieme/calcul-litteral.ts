import { CALCUL_LITTERAL_3E } from '../../exercises/troisieme/calculLitteral';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const CALCUL_LITTERAL: ChapterDef = {
  id: '3e-calcul-litteral',
  title: 'Calcul littéral',
  region: 'Forêt des Identités',
  theme: 'foret',
  terrain: 'foret',
  skills: CALCUL_LITTERAL_3E,
  creatures: [
    creature('distribulle', 'Distribulle', 'Une bulle qui distribue son facteur à chaque terme de la parenthèse.', ['3e-developper-simple', '3e-programme-calcul'], 'blob', 120, 'k·'),
    creature('programmouche', 'Programmouche', 'Un insecte qui suit son programme de calcul à la lettre, étape par étape.', ['3e-programme-calcul'], 'insecte', 95, '→'),
    creature('doublarbre', 'Doublarbre', 'Un arbre à quatre branches : chaque terme de la première parenthèse serre la main de chaque terme de la seconde.', ['3e-developper-double', '3e-developper-simple'], 'plante', 110, '()²'),
    creature('identitigre', 'Identitigre', 'Une bête rayée de trois identités remarquables.', ['3e-identites', '3e-factoriser-identite'], 'bete', 40, 'a²'),
    creature('factoriseau', 'Factoriseau', 'Un oiseau rare qui range tout ce qui se répète devant une seule parenthèse.', ['3e-factoriser', '3e-factoriser-identite'], 'oiseau', 160, '×'),
  ],
  boss: creature('sylve-litterale', 'Sylve Littérale, gardienne de la forêt', 'La plus vieille souche de la forêt, gravée de lettres et de parenthèses.', CALCUL_LITTERAL_3E.map((s) => s.id), 'golem', 100, 'x'),
  guide: ['La Forêt des Identités pousse en double distributivité.', 'Développe, factorise… et méfie-toi des signes !'],
};
