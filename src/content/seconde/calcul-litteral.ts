import { CALCUL_LITTERAL_SKILLS } from '../../exercises/seconde/calculLitteral';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const CALCUL_LITTERAL: ChapterDef = {
  id: '2nde-calcul-litteral',
  title: 'Calcul littéral',
  region: 'Forêt des Lettres',
  theme: 'foret',
  skills: CALCUL_LITTERAL_SKILLS,
  creatures: [
    creature('fractinou', 'Fractinou', 'Un blob coupé en parts, qui additionne les fractions sans jamais se tromper de dénominateur.', ['2nde-fractions', '2nde-puissances'], 'blob', 90, '½'),
    creature('distribou', 'Distribou', 'Une bête aux longs bras qui distribue chaque terme à tous les autres.', ['2nde-developper', '2nde-identite'], 'bete', 30, '( )'),
    creature('racinard', 'Racinard', 'Une plante qui sort les carrés parfaits de sous ses racines.', ['2nde-racines', '2nde-puissances'], 'plante', 130, '√'),
    creature('egalix', 'Égalix', 'Un oiseau équilibriste : ce qu’il fait d’un côté, il le fait aussi de l’autre.', ['2nde-equation-1', '2nde-produit-nul'], 'oiseau', 60, '='),
    creature('factorus', 'Factorus', 'Un insecte qui repère le facteur commun dans n’importe quel feuillage.', ['2nde-factoriser', '2nde-produit-nul', '2nde-identite'], 'insecte', 160, 'ab'),
  ],
  boss: creature('litteron', 'Littéron, gardien de la forêt', 'Le gardien de la forêt, fait de lettres entremêlées. Il développe et factorise à la vitesse du vent.', CALCUL_LITTERAL_SKILLS.map((s) => s.id), 'golem', 120, 'x²'),
  guide: [
    'Bienvenue dans la Forêt des Lettres : ici, les nombres se cachent derrière des $x$.',
    'Développe, factorise, résous : chaque créature t’attend avec une expression à transformer.',
  ],
};
