import { ANALYSE_NUMERIQUE_SKILLS } from '../../exercises/licence3/analyseNumerique';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const ANALYSE_NUMERIQUE: ChapterDef = {
  id: 'l3-analyse-numerique',
  title: 'Analyse numérique',
  region: 'Gorges de Newton',
  theme: 'volcan',
  terrain: 'canyon',
  skills: ANALYSE_NUMERIQUE_SKILLS,
  creatures: [
    creature('l3-dichotome', 'Dichotome', 'Un insecte qui coupe chaque galerie en deux pour trouver la sortie.', ['l3-dichotomie'], { shape: 'insecte', hue: 35, symbol: '½' }),
    creature('l3-newtonnerre', 'Newtonnerre', 'Un oiseau-éclair qui fonce le long de la tangente.', ['l3-methode-newton'], { shape: 'oiseau', hue: 50, symbol: 'xₙ' }),
    creature('l3-trapezoide', 'Trapézoïde', 'Un golem fait de trapèzes empilés sous une courbe.', ['l3-quadrature'], { shape: 'golem', hue: 25, symbol: '∫ₕ' }),
    creature('l3-interpolux', 'Interpolux', 'Un esprit qui passe exactement par tous les points qu’on lui donne.', ['l3-interpolation-lagrange'], { shape: 'spectre', hue: 10, symbol: 'P' }),
    creature('l3-schemouette', 'Schémouette', 'Une bulle qui avance pas à pas, à la façon d’Euler.', ['l3-euler-explicite', 'l3-ordres-convergence'], { shape: 'blob', hue: 45, symbol: 'yₖ' }),
  ],
  boss: bossOf('l3-algorythme', 'Algorythme, gardien des gorges', 'Il calcule vite et bien, et connaît l’ordre de chaque méthode.', ANALYSE_NUMERIQUE_SKILLS, { shape: 'golem', hue: 30, symbol: '≈' }),
  guide: [
    'Dans les Gorges de Newton, on approche les solutions qu’on ne sait pas écrire.',
    'Newton double le nombre de chiffres exacts à chaque étape ; la dichotomie en gagne un tous les trois ou quatre pas.',
  ],
};
