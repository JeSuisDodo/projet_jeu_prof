import { TRANSFORMATIONS_3E } from '../../exercises/troisieme/transformations';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const TRANSFORMATIONS: ChapterDef = {
  id: '3e-transformations',
  title: 'Transformations et homothéties',
  region: 'Jardins des Miroirs',
  theme: 'cristal',
  terrain: 'lac',
  skills: TRANSFORMATIONS_3E,
  creatures: [
    creature('symetrille', 'Symétrille', 'Un papillon parfaitement symétrique, de chaque côté de son axe.', ['3e-transformation'], 'insecte', 290, '↔'),
    creature('homothon', 'Homothon', 'Un blob qui grandit ou rétrécit à partir de son centre.', ['3e-homothetie', '3e-transformation'], 'blob', 270, 'k'),
    creature('semblabeille', 'Semblabeille', 'Une abeille qui construit des triangles semblables, en plus grand ou en plus petit.', ['3e-triangles-semblables'], 'insecte', 50, '∼'),
    creature('maquettor', 'Maquettor', 'Un golem miniature qui sait que les aires varient comme k².', ['3e-agrandissement', '3e-homothetie'], 'golem', 260, 'k²'),
    creature('reflexion', 'Reflétoile', 'Un spectre de miroir qui retourne, tourne et glisse les figures.', ['3e-transformation', '3e-agrandissement', '3e-triangles-semblables'], 'spectre', 310, '⟲'),
  ],
  boss: creature('kaleidos', 'Kaléidos, gardien des jardins', 'Le gardien des jardins, fait de mille miroirs.', TRANSFORMATIONS_3E.map((s) => s.id), 'golem', 280, 'k'),
  guide: ['Les Jardins des Miroirs reflètent, tournent et agrandissent tout.', 'Symétries, rotations, translations, homothéties : reconnais-les toutes.'],
};
