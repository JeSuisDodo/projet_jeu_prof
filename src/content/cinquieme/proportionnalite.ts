import { PROPORTIONNALITE_SKILLS } from '../../exercises/cinquieme/proportionnalite';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PROPORTIONNALITE: ChapterDef = {
  id: '5e-proportionnalite',
  title: 'Proportionnalité',
  region: 'Côte des Proportions',
  theme: 'plage',
  terrain: 'cote',
  skills: PROPORTIONNALITE_SKILLS,
  creatures: [
    creature('tablo', 'Tablo', 'Un blob carré comme un tableau : il vérifie que chaque colonne a le même coefficient.', ['5e-reconnaitre-proportionnalite'], 'blob', 190, '×k'),
    creature('marchouette', 'Marchouette', 'Une mouette marchande qui calcule le prix de n’importe quelle quantité.', ['5e-quatrieme-proportionnelle'], 'oiseau', 40, '€'),
    creature('pourcentaure', 'Pourcentaure', 'Un poisson qui prend sa part en pour cent de chaque vague.', ['5e-pourcentage'], 'poisson', 170, '%'),
    creature('ratiolle', 'Ratiolle', 'Un crabe qui partage le sable dans le ratio 2 : 3.', ['5e-ratio', '5e-quatrieme-proportionnelle'], 'bete', 10, '2:3'),
    creature('cartographe', 'Cartographe', 'Un spectre des cartes marines, expert des échelles.', ['5e-echelle', '5e-pourcentage'], 'spectre', 210, '1/n'),
  ],
  boss: creature('proportio', 'Proportio, gardienne de la côte', 'La gardienne de la côte fait grandir et rétrécir tout à la même échelle.', PROPORTIONNALITE_SKILLS.map((s) => s.id), 'golem', 185, '×k'),
  guide: [
    'La Côte des Proportions : ici, tout grandit dans les mêmes proportions.',
    'Prix, pourcentages, ratios et échelles : sors ta calculatrice mentale !',
  ],
};
