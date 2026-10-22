import { CALCUL_DIFFERENTIEL_SKILLS } from '../../exercises/licence3/calculDifferentiel';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const CALCUL_DIFFERENTIEL: ChapterDef = {
  id: 'l3-calcul-differentiel',
  title: 'Calcul différentiel',
  region: 'Cimes des Différentielles',
  theme: 'neige',
  terrain: 'montagne',
  skills: CALCUL_DIFFERENTIEL_SKILLS,
  creatures: [
    creature('l3-differentin', 'Différentin', 'Un oiseau des neiges qui approche chaque pente par sa partie linéaire.', ['l3-differentielle'], { shape: 'oiseau', hue: 200, symbol: 'df' }),
    creature('l3-jacobot', 'Jacobot', 'Un robot de glace dont le cœur est une matrice jacobienne.', ['l3-jacobien', 'l3-differentielle'], { shape: 'golem', hue: 210, symbol: 'J' }),
    creature('l3-implicite', 'Implicite', 'Un spectre caché dans une équation : on ne le voit jamais explicitement.', ['l3-fonctions-implicites'], { shape: 'spectre', hue: 230, symbol: 'φ' }),
    creature('l3-inversaure', 'Inversaure', 'Une bête qui peut faire demi-tour… seulement là où son jacobien ne s’annule pas.', ['l3-inversion-locale', 'l3-jacobien'], { shape: 'bete', hue: 190, symbol: 'F⁻¹' }),
    creature('l3-lagrangeline', 'Lagrangeline', 'Une plante qui grimpe le long d’une contrainte en cherchant le sommet.', ['l3-extrema-lies'], { shape: 'plante', hue: 170, symbol: 'λ' }),
    creature('l3-matrixou', 'Matrixou', 'Un insecte à quatre ailes, une par coefficient d’une matrice 2×2.', ['l3-differentielle-matricielle', 'l3-extrema-lies'], { shape: 'insecte', hue: 250, symbol: 'dM' }),
  ],
  boss: bossOf('l3-frechetor', 'Fréchetor, gardien des cimes', 'Il différencie tout ce qui bouge, même les applications entre matrices.', CALCUL_DIFFERENTIEL_SKILLS, { shape: 'oiseau', hue: 220, symbol: 'D' }),
  guide: [
    'Sur les Cimes des Différentielles, chaque pente se lit dans sa différentielle.',
    '$df_a(h)$ est la meilleure approximation linéaire de $f(a + h) - f(a)$.',
  ],
};
