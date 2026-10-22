import { PUISSANCES_3E } from '../../exercises/troisieme/puissances';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const PUISSANCES: ChapterDef = {
  id: '3e-puissances',
  title: 'Puissances et racines carrées',
  region: 'Pics des Exposants',
  theme: 'neige',
  terrain: 'montagne',
  skills: PUISSANCES_3E,
  creatures: [
    creature('carrinou', 'Carrinou', 'Un blob de neige qui se multiplie par lui-même dès qu’il a froid.', ['3e-puissance-calcul', '3e-puissances-priorites'], 'blob', 200, 'x²'),
    creature('racinelle', 'Racinelle', 'Une plante des cimes dont les racines retrouvent toujours le côté d’un carré.', ['3e-racine-carree'], 'plante', 150, '√'),
    creature('exponix', 'Exponix', 'Un oiseau qui grimpe d’un étage d’exposant à chaque battement d’aile.', ['3e-regles-puissances'], 'oiseau', 210, 'aⁿ'),
    creature('scientifouine', 'Scientifouine', 'Une bête minuscule qui écrit les nombres géants et microscopiques avec une puissance de 10.', ['3e-notation-scientifique', '3e-regles-puissances'], 'bete', 190, '10ⁿ'),
  ],
  boss: creature('everest-10', 'Dix-Puissance, gardien des pics', 'Le gardien des sommets : il ne parle qu’en puissances de dix.', PUISSANCES_3E.map((s) => s.id), 'golem', 220, '10ⁿ'),
  guide: ['Les Pics des Exposants montent très haut… jusqu’à $10^{9}$ !', 'Puissances, notation scientifique et racines carrées t’attendent au sommet.'],
};
