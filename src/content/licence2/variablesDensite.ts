import { VARIABLES_DENSITE_SKILLS } from '../../exercises/licence2/variablesDensite';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const VARIABLES_DENSITE: ChapterDef = {
  id: 'l2-variables-densite',
  title: 'Variables aléatoires à densité',
  region: 'Volcan des Densités',
  theme: 'volcan',
  terrain: 'foret',
  skills: VARIABLES_DENSITE_SKILLS,
  creatures: [
    creature('l2-densinet', 'Densinet', 'Une braise dont l’aire totale vaut exactement 1.', ['l2-constante-densite', 'l2-esperance-densite'], { shape: 'blob', hue: 20, symbol: 'f' }),
    creature('l2-uniformite', 'Uniformite', 'Une pierre de lave parfaitement plate entre a et b.', ['l2-lois-usuelles-densite', 'l2-constante-densite'], { shape: 'golem', hue: 30, symbol: '𝒰' }),
    creature('l2-repartiton', 'Répartiton', 'Il accumule les probabilités en montant de 0 à 1.', ['l2-fonction-repartition', 'l2-esperance-densite'], { shape: 'bete', hue: 10, symbol: 'F' }),
    creature('l2-sansmemoire', 'Sans-Mémoire', 'Un oiseau de feu rare qui oublie tout ce qui s’est passé avant.', ['l2-loi-exponentielle', 'l2-lois-usuelles-densite', 'l2-fonction-repartition'], { shape: 'oiseau', hue: 5, symbol: 'ℰ' }),
  ],
  boss: bossOf('l2-lavaloi', 'Lavaloi, gardien du volcan', 'Sa lave coule selon une densité bien choisie.', VARIABLES_DENSITE_SKILLS, { shape: 'golem', hue: 0, symbol: '∫f' }),
  guide: ['Le Volcan des Densités crache une lave continue : ici, $P(X = x) = 0$ pour tout $x$.', '$P(a \\leq X \\leq b) = \\int_a^b f(t)\\,dt$.'],
};
