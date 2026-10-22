import { PROGRAMMATION_SKILLS } from '../../exercises/cinquieme/programmation';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PROGRAMMATION: ChapterDef = {
  id: '5e-programmation',
  title: 'Algorithmique et programmation',
  region: 'Îlots du Code',
  theme: 'nuit',
  terrain: 'archipel',
  skills: PROGRAMMATION_SKILLS,
  creatures: [
    creature('boucleur', 'Boucleur', 'Un blob qui répète toujours la même chose… et trace des polygones parfaits.', ['5e-algo-polygone'], 'blob', 120, '↺'),
    creature('variablo', 'Variablo', 'Un insecte lumineux dont la valeur change à chaque tour de boucle.', ['5e-algo-variable'], 'insecte', 90, 'x'),
    creature('sialor', 'Sialor', 'Un oiseau qui choisit sa route : si… alors… sinon.', ['5e-algo-condition'], 'oiseau', 60, 'si'),
    creature('lutinou', 'Lutinou', 'Un spectre qui se déplace en ajoutant des nombres à x et à y.', ['5e-algo-deplacement', '5e-algo-variable'], 'spectre', 150, 'xy'),
  ],
  boss: creature('scriptor', 'Scriptor, gardien des îlots', 'Le gardien des îlots exécute ses scripts sans jamais se tromper.', PROGRAMMATION_SKILLS.map((s) => s.id), 'golem', 110, '{}'),
  guide: [
    'Les Îlots du Code brillent dans la nuit.',
    'Boucles, variables et conditions : le lutin obéit à tes instructions.',
  ],
};
