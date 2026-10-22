import { SYMETRIE_SKILLS } from '../../exercises/sixieme/symetrie';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const SYMETRIE: ChapterDef = {
  id: '6e-symetrie',
  title: 'Symétrie axiale',
  region: 'Lac Miroir',
  theme: 'cristal',
  terrain: 'lac',
  skills: SYMETRIE_SKILLS,
  creatures: [
    creature('reflette', 'Reflette', 'Un papillon dont les deux ailes sont parfaitement symétriques.', ['6e-axes-symetrie', '6e-point-sur-axe'], 'insecte', 290, '⟷'),
    creature('quadrillon', 'Quadrillon', 'Un poisson qui saute d’une case à sa symétrique, de l’autre côté de l’axe.', ['6e-symetrique-quadrillage'], 'poisson', 200, 'A1'),
    creature('mediatrix', 'Médiatrix', 'Un oiseau qui se pose à égale distance des deux rives.', ['6e-mediatrice', '6e-point-sur-axe'], 'oiseau', 250, '⊥'),
    creature('miroiton', 'Miroiton', 'Un blob de cristal qui conserve toutes les longueurs et tous les angles.', ['6e-conservation', '6e-axes-symetrie'], 'blob', 270, '='),
  ],
  boss: creature('specularis', 'Specularis, gardien du lac', 'Le gardien du Lac Miroir : son reflet est exactement son symétrique.', SYMETRIE_SKILLS.map((s) => s.id), 'golem', 280, '|'),
  guide: [
    'Le Lac Miroir reflète tout ce qui l’entoure.',
    'Un point et son symétrique sont à la même distance de l’axe, de part et d’autre.',
  ],
};
