import { LOGIQUE_SKILLS } from '../../exercises/licence1/logique';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const LOGIQUE: ChapterDef = {
  id: 'l1-logique-ensembles',
  title: 'Logique et ensembles',
  region: 'Labyrinthe des Quantificateurs',
  theme: 'cristal',
  terrain: 'canyon',
  skills: LOGIQUE_SKILLS,
  creatures: [
    creature('l1-veritin', 'Véritin', 'Un petit cristal qui s’allume quand une proposition est vraie et s’éteint quand elle est fausse.', ['l1-table-verite', 'l1-operations-ensembles'], { shape: 'blob', hue: 270, symbol: 'V/F' }),
    creature('l1-quantifouine', 'Quantifouine', 'Elle retourne chaque « pour tout » en « il existe » pour se faufiler dans les galeries.', ['l1-negation-quantificateurs', 'l1-table-verite'], { shape: 'bete', hue: 285, symbol: '∀∃' }),
    creature('l1-cribleur', 'Cribleur', 'Un insecte qui trie les foules en comptant chaque élément une seule fois.', ['l1-cardinal-union', 'l1-operations-ensembles'], { shape: 'insecte', hue: 250, symbol: '∪' }),
    creature('l1-partitor', 'Partitor', 'Un esprit qui se divise en autant de morceaux qu’il y a de parties d’un ensemble.', ['l1-parties', 'l1-negation-quantificateurs'], { shape: 'spectre', hue: 300, symbol: '𝒫' }),
  ],
  boss: bossOf('l1-logicius', 'Logicius, gardien du labyrinthe', 'Il ne laisse passer que ceux qui savent nier une phrase sans se tromper.', LOGIQUE_SKILLS, { shape: 'golem', hue: 275, symbol: '¬' }),
  guide: [
    'Bienvenue à l’université ! Ici, chaque couloir du labyrinthe est une proposition : vraie ou fausse.',
    'Pour nier « pour tout $x$, $P(x)$ », il suffit de trouver un $x$ qui ne vérifie pas $P$.',
  ],
};
