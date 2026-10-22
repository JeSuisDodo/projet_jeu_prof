import { CALCUL_LITTERAL_SKILLS } from '../../exercises/cinquieme/calculLitteral';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const CALCUL_LITTERAL: ChapterDef = {
  id: '5e-calcul-litteral',
  title: 'Calcul littéral',
  region: 'Marais des Lettres',
  theme: 'marais',
  terrain: 'marais',
  skills: CALCUL_LITTERAL_SKILLS,
  creatures: [
    creature('remplacou', 'Remplaçou', 'Un blob qui remplace chaque lettre par un nombre pour voir ce que ça donne.', ['5e-substituer'], 'blob', 100, 'x'),
    creature('testard', 'Testard', 'Une grenouille qui teste les égalités en sautant d’un membre à l’autre.', ['5e-tester-egalite', '5e-substituer'], 'bete', 110, '='),
    creature('fois-cache', 'Foiscaché', 'Un insecte qui fait disparaître les signes × devant les lettres.', ['5e-simplifier-ecriture'], 'insecte', 80, '3a'),
    creature('reduisor', 'Réduisor', 'Un poisson qui regroupe les x avec les x et les nombres avec les nombres.', ['5e-reduire', '5e-programme-calcul'], 'poisson', 150, 'x²'),
    creature('distributeau', 'Distributeau', 'Une plante aquatique qui développe et factorise ses racines.', ['5e-developper', '5e-factoriser'], 'plante', 130, 'k()'),
  ],
  boss: creature('litteralis', 'Littéralis, gardien du marais', 'Le gardien du marais écrit tous ses calculs avec des lettres.', CALCUL_LITTERAL_SKILLS.map((s) => s.id), 'golem', 120, 'ax'),
  guide: [
    'Dans le Marais des Lettres, les nombres se cachent derrière des x.',
    'Remplace, réduis, développe : les lettres n’auront plus de secret.',
  ],
};
