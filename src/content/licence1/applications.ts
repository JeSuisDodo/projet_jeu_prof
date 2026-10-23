import { APPLICATIONS_SKILLS } from '../../exercises/licence1/applications';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const APPLICATIONS: ChapterDef = {
  id: 'l1-applications',
  title: 'Applications',
  region: 'Prairie des Applications',
  theme: 'prairie',
  terrain: 'riviere',
  skills: APPLICATIONS_SKILLS,
  creatures: [
    creature('l1-imagelle', 'Imagelle', 'Une gazelle qui envoie chaque élément vers son image, sans jamais hésiter.', ['l1-image-directe', 'l1-composition'], { shape: 'bete', hue: 110, symbol: 'f(A)' }),
    creature('l1-composard', 'Composard', 'Un oiseau à deux têtes : la première applique f, la seconde g.', ['l1-composition', 'l1-compter-applications'], { shape: 'oiseau', hue: 90, symbol: '∘' }),
    creature('l1-injectule', 'Injectule', 'Une fleur dont chaque pétale pointe vers une abeille différente.', ['l1-injective-surjective', 'l1-image-directe'], { shape: 'plante', hue: 130, symbol: '↪' }),
    creature('l1-bijecteur', 'Bijecteur', 'Il fait l’aller et le retour : chaque arrivée a exactement un départ.', ['l1-reciproque', 'l1-injective-surjective'], { shape: 'poisson', hue: 150, symbol: 'f⁻¹' }),
  ],
  boss: bossOf('l1-applicatrix', 'Applicatrix, gardienne de la prairie', 'Elle relie chaque brin d’herbe à un nuage, et sait dire si tous les nuages sont atteints.', APPLICATIONS_SKILLS, { shape: 'golem', hue: 120, symbol: '↦' }),
  guide: [
    'Dans cette prairie, chaque ruisseau relie un point de départ à un point d’arrivée : ce sont des applications.',
    'Injective : jamais deux départs pour la même arrivée. Surjective : chaque arrivée est atteinte.',
  ],
};
