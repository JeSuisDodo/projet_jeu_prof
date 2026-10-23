import { SUITES_SKILLS } from '../../exercises/licence1/suites';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const SUITES: ChapterDef = {
  id: 'l1-suites-reelles',
  title: 'Suites réelles',
  region: 'Côte des Suites',
  theme: 'plage',
  terrain: 'cote',
  skills: SUITES_SKILLS,
  creatures: [
    creature('l1-limitule', 'Limitule', 'Une tortue qui s’approche de sa limite, toujours un peu plus près.', ['l1-limite-suite', 'l1-seuil-convergence'], { shape: 'bete', hue: 190, symbol: 'ℓ' }),
    creature('l1-pointfixe', 'Pointfixe', 'Un crabe qui revient toujours au même rocher : ℓ = aℓ + b.', ['l1-suite-arithmetico-geometrique', 'l1-limite-suite'], { shape: 'insecte', hue: 20, symbol: 'f(ℓ)' }),
    creature('l1-vaguenne', 'Vaguenne', 'Ses vagues obéissent à uₙ₊₂ = a·uₙ₊₁ + b·uₙ.', ['l1-recurrence-lineaire-ordre2', 'l1-limite-quotient-geometrique'], { shape: 'poisson', hue: 200, symbol: 'uₙ₊₂' }),
    creature('l1-epsilonde', 'Epsilonde', 'Une onde minuscule : à partir d’un certain rang, elle reste plus petite que ε.', ['l1-seuil-convergence', 'l1-limite-quotient-geometrique'], { shape: 'spectre', hue: 180, symbol: 'ε' }),
  ],
  boss: bossOf('l1-cauchyon', 'Cauchyon, gardien de la côte', 'Il compte les vagues jusqu’à l’infini sans jamais se lasser.', SUITES_SKILLS, { shape: 'golem', hue: 195, symbol: 'lim' }),
  guide: [
    'Sur cette côte, les vagues se suivent et finissent par se calmer : elles convergent.',
    'Pour une fraction en $n$, factorise par les termes dominants.',
  ],
};
