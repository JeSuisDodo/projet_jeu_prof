import { ANNEAUX_SKILLS } from '../../exercises/licence3/anneaux';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const ANNEAUX: ChapterDef = {
  id: 'l3-anneaux-corps',
  title: 'Anneaux et corps',
  region: 'Volcan des Idéaux',
  theme: 'volcan',
  terrain: 'canyon',
  skills: ANNEAUX_SKILLS,
  creatures: [
    creature('l3-inversinge', 'Inversinge', 'Un singe de lave qui retrouve l’inverse de tout nombre premier avec n.', ['l3-inverse-modulaire'], { shape: 'bete', hue: 15, symbol: 'a⁻¹' }),
    creature('l3-eulerette', 'Eulerette', 'Une braise qui compte les inversibles de ℤ/nℤ.', ['l3-indicatrice-euler'], { shape: 'blob', hue: 25, symbol: 'φ' }),
    creature('l3-congruor', 'Congruor', 'Un oiseau de feu qui voit le même nombre dans deux congruences.', ['l3-restes-chinois', 'l3-inverse-modulaire'], { shape: 'oiseau', hue: 5, symbol: '≡' }),
    creature('l3-idealis', 'Idéalis', 'Un spectre qui absorbe tous les multiples qu’il croise.', ['l3-ideaux-z'], { shape: 'spectre', hue: 350, symbol: 'nℤ' }),
    creature('l3-racinoir', 'Racinoir', 'Une plante de cendre qui cherche ses racines dans un corps fini.', ['l3-racines-fp', 'l3-ideaux-z'], { shape: 'plante', hue: 30, symbol: '𝔽ₚ' }),
    creature('l3-galoisard', 'Galoisard', 'Un golem en cristal de corps fini, emboîté dans ses sous-corps.', ['l3-corps-fini', 'l3-racines-fp'], { shape: 'golem', hue: 10, symbol: '𝔽q' }),
  ],
  boss: bossOf('l3-anneaurus', 'Anneaurus, gardien du volcan', 'Il additionne et multiplie dans la lave sans jamais diviser par zéro.', ANNEAUX_SKILLS, { shape: 'golem', hue: 20, symbol: 'ℤ' }),
  guide: [
    'Le Volcan des Idéaux bouillonne de congruences : on y calcule modulo $n$.',
    '$\\bar a$ est inversible dans $\\mathbb{Z}/n\\mathbb{Z}$ si et seulement si $\\operatorname{pgcd}(a, n) = 1$.',
  ],
};
