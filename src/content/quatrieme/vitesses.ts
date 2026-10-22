import { VITESSES_SKILLS } from '../../exercises/quatrieme/vitesses';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const VITESSES: ChapterDef = {
  id: '4e-vitesses',
  title: 'Vitesses et grandeurs composées',
  region: 'Plaine des Vitesses',
  theme: 'prairie',
  terrain: 'riviere',
  skills: VITESSES_SKILLS,
  creatures: [
    creature('4e-trotteur', 'Trotteur', 'Il trotte toujours à vitesse constante.', ['4e-distance-parcourue'], { shape: 'bete', hue: 60, symbol: 'd' }),
    creature('4e-chronolle', 'Chronolle', 'Elle mesure chaque trajet en minutes.', ['4e-duree-trajet'], { shape: 'insecte', hue: 50, symbol: 't' }),
    creature('4e-ventilos', 'Ventilos', 'Il convertit ses rafales de m/s en km/h.', ['4e-conversion-vitesse'], { shape: 'oiseau', hue: 180, symbol: 'm/s' }),
    creature('4e-debitor', 'Débitor', 'Un ruisseau qui connaît son débit au litre près.', ['4e-grandeur-composee'], { shape: 'poisson', hue: 200, symbol: 'L' }),
    creature('4e-eclairon', 'Éclairon', 'Le plus rapide de la plaine : il divise la distance par la durée en un éclair.', ['4e-vitesse-moyenne', '4e-duree-trajet'], { shape: 'spectre', hue: 55, symbol: 'v' }),
  ],
  boss: bossOf('4e-velocis', 'Vélocis, gardien de la plaine', 'Il traverse la plaine en battant tous les records de vitesse moyenne.', VITESSES_SKILLS, { shape: 'golem', hue: 70, symbol: 'v' }),
  guide: [
    'La Plaine des Vitesses est immense. Pour la traverser, il faut savoir calculer vitesse, distance et durée.',
    'Retiens : $v = \\dfrac{d}{t}$, avec la durée en heures pour une vitesse en km/h.',
  ],
};
