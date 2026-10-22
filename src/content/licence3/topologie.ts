import { TOPOLOGIE_SKILLS } from '../../exercises/licence3/topologie';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const TOPOLOGIE: ChapterDef = {
  id: 'l3-espaces-metriques',
  title: 'Espaces métriques et topologie',
  region: 'Archipel des Boules Ouvertes',
  theme: 'cristal',
  terrain: 'archipel',
  skills: TOPOLOGIE_SKILLS,
  creatures: [
    creature('l3-normelin', 'Normelin', 'Un petit cristal qui mesure tout ce qu’il touche, de trois façons différentes.', ['l3-normes', 'l3-equivalence-normes'], { shape: 'blob', hue: 270, symbol: '‖‖' }),
    creature('l3-distancon', 'Distançon', 'Un oiseau qui sait toujours à quelle distance se trouve l’île la plus proche.', ['l3-distance-ensemble', 'l3-normes'], { shape: 'oiseau', hue: 200, symbol: 'd' }),
    creature('l3-ouvertule', 'Ouvertule', 'Une fleur qui ne pousse que sur les ensembles ouverts : jamais sur leur bord.', ['l3-ouvert-ferme'], { shape: 'plante', hue: 150, symbol: '∘' }),
    creature('l3-lipschitzard', 'Lipschitzard', 'Un lézard qui ne court jamais plus vite qu’une constante fixée.', ['l3-lipschitz', 'l3-equivalence-normes'], { shape: 'bete', hue: 30, symbol: 'L' }),
    creature('l3-compactor', 'Compactor', 'Un golem fermé et borné : on peut toujours en extraire une sous-suite.', ['l3-compact', 'l3-ouvert-ferme'], { shape: 'golem', hue: 290, symbol: 'K' }),
  ],
  boss: bossOf('l3-topologos', 'Topologos, gardien de l’archipel', 'Il voit chaque île comme une boule ouverte et l’archipel comme leur réunion.', TOPOLOGIE_SKILLS, { shape: 'golem', hue: 260, symbol: 'τ' }),
  guide: [
    'L’Archipel des Boules Ouvertes : chaque île est une boule, et leurs réunions sont des ouverts.',
    'En dimension finie, toutes les normes sont équivalentes et les compacts sont les fermés bornés.',
  ],
};
