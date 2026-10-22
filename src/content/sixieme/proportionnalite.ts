import { PROPORTIONNALITE_SKILLS } from '../../exercises/sixieme/proportionnalite';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PROPORTIONNALITE: ChapterDef = {
  id: '6e-proportionnalite',
  title: 'Proportionnalité',
  region: 'Vergers de la Proportion',
  theme: 'automne',
  terrain: 'riviere',
  skills: PROPORTIONNALITE_SKILLS,
  creatures: [
    creature('pommier', 'Pommier', 'Un arbre dont le prix des pommes suit toujours la même règle.', ['6e-quatrieme-proportionnelle', '6e-proportionnel-ou-pas'], 'plante', 25, '×k'),
    creature('tableron', 'Tableron', 'Une bête dont les rayures forment un tableau de proportionnalité.', ['6e-tableau-proportionnalite', '6e-coefficient'], 'bete', 40, '⇄'),
    creature('pourcentouille', 'Pourcentouille', 'Une chouette qui calcule les soldes à la vitesse de l’éclair.', ['6e-pourcentage'], 'oiseau', 30, '%'),
    creature('echellon', 'Échellon', 'Un écureuil qui se promène sur les cartes à l’échelle 1/25 000.', ['6e-echelle', '6e-coefficient'], 'bete', 15, '1:n'),
    creature('proportionix', 'Proportionix', 'Un esprit des vergers, rare, qui reconnaît toute situation proportionnelle.', ['6e-proportionnel-ou-pas', '6e-pourcentage', '6e-quatrieme-proportionnelle'], 'spectre', 45, '∝'),
  ],
  boss: creature('vergeron', 'Vergeron, gardien des vergers', 'Le gardien des vergers : chaque fruit qu’il porte est proportionnel à ses branches.', PROPORTIONNALITE_SKILLS.map((s) => s.id), 'golem', 35, '∝'),
  guide: [
    'Bienvenue dans les Vergers de la Proportion.',
    'Ici, quand une quantité double, l’autre double aussi… mais pas toujours : méfie-toi !',
  ],
};
