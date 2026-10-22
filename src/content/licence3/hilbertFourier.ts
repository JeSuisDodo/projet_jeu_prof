import { HILBERT_FOURIER_SKILLS } from '../../exercises/licence3/hilbertFourier';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const HILBERT_FOURIER: ChapterDef = {
  id: 'l3-hilbert-fourier',
  title: 'Espaces de Hilbert et séries de Fourier',
  region: 'Lac des Harmoniques',
  theme: 'nuit',
  terrain: 'lac',
  skills: HILBERT_FOURIER_SKILLS,
  creatures: [
    creature('l3-harmonine', 'Harmonine', 'Un poisson qui chante une note pure : un seul coefficient de Fourier.', ['l3-coefficients-fourier'], { shape: 'poisson', hue: 240, symbol: 'aₙ' }),
    creature('l3-scalairon', 'Scalairon', 'Une luciole qui mesure l’angle entre deux fonctions.', ['l3-produit-scalaire-l2'], { shape: 'blob', hue: 260, symbol: '⟨⟩' }),
    creature('l3-parsevale', 'Parsevale', 'Un esprit qui conserve l’énergie en passant aux coefficients.', ['l3-parseval', 'l3-coefficients-fourier'], { shape: 'spectre', hue: 250, symbol: 'Σ' }),
    creature('l3-projectile', 'Projectile', 'Un oiseau qui tombe toujours à angle droit sur un sous-espace.', ['l3-projection-orthogonale', 'l3-produit-scalaire-l2'], { shape: 'oiseau', hue: 230, symbol: '⊥' }),
    creature('l3-dirichlune', 'Dirichlune', 'Une plante lunaire dont les feuilles comptent π²/6.', ['l3-sommes-fourier', 'l3-parseval'], { shape: 'plante', hue: 270, symbol: 'π²' }),
  ],
  boss: bossOf('l3-hilbertor', 'Hilbertor, gardien du lac', 'Il vit dans un espace complet de dimension infinie, et projette tout ce qui l’approche.', HILBERT_FOURIER_SKILLS, { shape: 'poisson', hue: 245, symbol: 'ℋ' }),
  guide: [
    'Sous le ciel étoilé du Lac des Harmoniques, chaque fonction se décompose en notes pures.',
    'Parseval : l’énergie d’une fonction est la somme des carrés de ses coefficients.',
  ],
};
