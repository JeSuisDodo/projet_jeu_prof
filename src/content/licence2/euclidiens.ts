import { EUCLIDIENS_SKILLS } from '../../exercises/licence2/euclidiens';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const EUCLIDIENS: ChapterDef = {
  id: 'l2-espaces-euclidiens',
  title: 'Espaces préhilbertiens et euclidiens',
  region: 'Archipel Orthonormé',
  theme: 'plage',
  terrain: 'archipel',
  skills: EUCLIDIENS_SKILLS,
  creatures: [
    creature('l2-scalairon', 'Scalairon', 'Un crabe qui pince deux vecteurs pour en sortir un nombre.', ['l2-orthogonalite-parametre', 'l2-produit-scalaire-integrale'], { shape: 'insecte', hue: 190, symbol: '⟨,⟩' }),
    creature('l2-projectile', 'Projectile', 'Une mouette qui projette son ombre bien à la verticale.', ['l2-projection-orthogonale', 'l2-orthogonalite-parametre'], { shape: 'oiseau', hue: 200, symbol: 'p' }),
    creature('l2-gramouette', 'Gramouette', 'Elle redresse les vecteurs un par un pour les rendre orthogonaux.', ['l2-gram-schmidt', 'l2-produit-scalaire-integrale'], { shape: 'poisson', hue: 185, symbol: '⊥' }),
    creature('l2-rotatonne', 'Rotatonne', 'Une tortue qui tourne sans jamais se déformer.', ['l2-matrice-orthogonale', 'l2-projection-orthogonale', 'l2-gram-schmidt'], { shape: 'bete', hue: 175, symbol: 'O' }),
  ],
  boss: bossOf('l2-hilbertin', 'Hilbertin, gardien de l’archipel', 'Toutes les îles de l’archipel sont deux à deux orthogonales, et c’est lui qui y veille.', EUCLIDIENS_SKILLS, { shape: 'poisson', hue: 195, symbol: '‖x‖' }),
  guide: ['Dans l’Archipel Orthonormé, toutes les passerelles se croisent à angle droit.', 'Le projeté orthogonal de $v$ sur $\\mathrm{Vect}(u)$ est $\\dfrac{\\langle u, v\\rangle}{\\|u\\|^2}u$.'],
};
