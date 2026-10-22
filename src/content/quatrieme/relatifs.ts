import { RELATIFS_SKILLS } from '../../exercises/quatrieme/relatifs';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const RELATIFS: ChapterDef = {
  id: '4e-relatifs',
  title: 'Nombres relatifs : multiplication et division',
  region: 'Glacier des Relatifs',
  theme: 'neige',
  terrain: 'riviere',
  skills: RELATIFS_SKILLS,
  creatures: [
    creature('4e-givron', 'Givron', 'Un flocon qui change de signe à chaque fois qu’il croise un « − ».', ['4e-produit-relatifs'], { shape: 'blob', hue: 200, symbol: '×' }),
    creature('4e-signalon', 'Signalon', 'Il compte les signes « − » avant de dire si le produit sera chaud ou glacé.', ['4e-signe-produit'], { shape: 'oiseau', hue: 210, symbol: '±' }),
    creature('4e-partagel', 'Partagel', 'Une stalactite qui se divise sans jamais perdre le nord… ni le signe.', ['4e-quotient-relatifs'], { shape: 'spectre', hue: 190, symbol: '÷' }),
    creature('4e-priorix', 'Priorix', 'Il ne laisse passer une addition qu’après toutes les multiplications.', ['4e-priorites-relatifs', '4e-produit-relatifs'], { shape: 'bete', hue: 220, symbol: '()' }),
  ],
  boss: bossOf('4e-moinsmoins', 'Moinsmoins, gardien du glacier', 'Deux « moins » font un « plus » : c’est sa devise, gravée dans la glace.', RELATIFS_SKILLS, { shape: 'golem', hue: 205, symbol: '−×−' }),
  guide: [
    'Bienvenue sur l’Île des Passerelles, l’île de la 4e ! Ici, au Glacier des Relatifs, il fait parfois $-12$ °C.',
    'Retiens la règle des signes : un nombre pair de facteurs négatifs donne un produit positif.',
  ],
};
