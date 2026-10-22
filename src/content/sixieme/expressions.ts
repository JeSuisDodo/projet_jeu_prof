import { EXPRESSIONS_SKILLS } from '../../exercises/sixieme/expressions';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const EXPRESSIONS: ChapterDef = {
  id: '6e-expressions',
  title: 'Calculs en ligne et priorités',
  region: 'Marais des Parenthèses',
  theme: 'marais',
  terrain: 'marais',
  skills: EXPRESSIONS_SKILLS,
  creatures: [
    creature('prioritard', 'Prioritard', 'Un crapaud qui fait toujours passer les multiplications avant les additions.', ['6e-priorites'], 'bete', 90, '×+'),
    creature('parenthor', 'Parenthor', 'Un blob qui s’enroule autour des calculs à faire en premier.', ['6e-parentheses', '6e-priorites'], 'blob', 150, '( )'),
    creature('traducteur', 'Traducteur', 'Une libellule qui transforme les phrases en calculs.', ['6e-traduire'], 'insecte', 170, 'Σ'),
    creature('formulin', 'Formulin', 'Une plante qui remplace chaque lettre par sa valeur.', ['6e-formule', '6e-test-egalite'], 'plante', 120, 'P='),
    creature('trouvetout', 'Trouvetout', 'Un spectre des brumes qui retrouve n’importe quel nombre manquant.', ['6e-nombre-manquant', '6e-test-egalite', '6e-parentheses'], 'spectre', 140, '?'),
  ],
  boss: creature('crochetor', 'Crochetor, gardien du marais', 'Le gardien du marais : rien ne lui échappe, ni les parenthèses ni les crochets.', EXPRESSIONS_SKILLS.map((s) => s.id), 'golem', 110, '[ ]'),
  guide: [
    'Le Marais des Parenthèses est plein de calculs en ligne.',
    'Parenthèses d’abord, puis multiplications et divisions, puis additions et soustractions !',
  ],
};
