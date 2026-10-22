import { SERIES_NUMERIQUES_SKILLS } from '../../exercises/licence2/seriesNumeriques';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const SERIES_NUMERIQUES: ChapterDef = {
  id: 'l2-series-numeriques',
  title: 'Séries numériques',
  region: 'Désert des Séries',
  theme: 'desert',
  terrain: 'desert',
  skills: SERIES_NUMERIQUES_SKILLS,
  creatures: [
    creature('l2-geometron', 'Géométron', 'Un scarabée qui avance chaque jour d’une fraction du chemin de la veille.', ['l2-serie-geometrique', 'l2-serie-telescopique'], { shape: 'insecte', hue: 40, symbol: 'qⁿ' }),
    creature('l2-telescopard', 'Télescopard', 'Il replie sa longue-vue : presque tous les termes disparaissent.', ['l2-serie-telescopique', 'l2-nature-riemann'], { shape: 'bete', hue: 30, symbol: '⇥' }),
    creature('l2-riemannite', 'Riemannite', 'Un cactus dont les épines décroissent en 1/n^α.', ['l2-nature-riemann', 'l2-nature-equivalents'], { shape: 'plante', hue: 90, symbol: 'nᵅ' }),
    creature('l2-alembertin', 'Alembertin', 'Un mirage qui compare chaque terme au suivant.', ['l2-critere-dalembert', 'l2-serie-exponentielle'], { shape: 'spectre', hue: 45, symbol: 'ℓ' }),
    creature('l2-exposable', 'Exposable', 'Un serpent rare qui se mord la queue en sommant xⁿ/n!.', ['l2-serie-exponentielle', 'l2-critere-dalembert', 'l2-nature-equivalents'], { shape: 'bete', hue: 20, symbol: 'eˣ' }),
  ],
  boss: bossOf('l2-sommatrix', 'Sommatrix, gardien du désert', 'Il additionne les grains de sable à l’infini, sans jamais déborder.', SERIES_NUMERIQUES_SKILLS, { shape: 'golem', hue: 35, symbol: 'Σ' }),
  guide: ['Dans le Désert des Séries, on additionne une infinité de grains de sable.', 'Le terme général doit tendre vers $0$, mais cela ne suffit pas : pense à $\\sum \\frac{1}{n}$.'],
};
