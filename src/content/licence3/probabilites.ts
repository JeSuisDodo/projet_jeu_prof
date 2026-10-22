import { PROBABILITES_SKILLS } from '../../exercises/licence3/probabilites';
import { bossOf, creature } from '../terminale/creature';
import type { ChapterDef } from '../types';

export const PROBABILITES: ChapterDef = {
  id: 'l3-probabilites',
  title: 'Probabilités',
  region: 'Rivière des Grands Nombres',
  theme: 'prairie',
  terrain: 'riviere',
  skills: PROBABILITES_SKILLS,
  creatures: [
    creature('l3-gaussette', 'Gaussette', 'Une hirondelle dont le vol dessine une cloche.', ['l3-tcl'], { shape: 'oiseau', hue: 90, symbol: '𝒩' }),
    creature('l3-tchebychat', 'Tchebychat', 'Un chat qui majore toujours le risque de s’éloigner de la moyenne.', ['l3-bienayme-tchebychev'], { shape: 'bete', hue: 70, symbol: '≤' }),
    creature('l3-convergeon', 'Convergeon', 'Un poisson qui remonte la rivière presque sûrement.', ['l3-modes-convergence', 'l3-tcl'], { shape: 'poisson', hue: 180, symbol: '→' }),
    creature('l3-conditionnelle', 'Conditionnelle', 'Une bulle qui ne regarde que ce qu’elle sait déjà.', ['l3-esperance-conditionnelle'], { shape: 'blob', hue: 110, symbol: '|' }),
    creature('l3-caracteris', 'Caractéris', 'Un esprit qui reconnaît chaque loi à sa fonction caractéristique.', ['l3-fonction-caracteristique', 'l3-modes-convergence'], { shape: 'spectre', hue: 140, symbol: 'φ' }),
    creature('l3-borelion', 'Borélion', 'Un golem qui sait si un événement se produira une infinité de fois.', ['l3-borel-cantelli', 'l3-bienayme-tchebychev'], { shape: 'golem', hue: 100, symbol: '∞' }),
  ],
  boss: bossOf('l3-aleatorus', 'Aléatorus, gardien de la rivière', 'Il lance une infinité de dés et prédit pourtant leur moyenne.', PROBABILITES_SKILLS, { shape: 'oiseau', hue: 120, symbol: 'Ω' }),
  guide: [
    'Sur la Rivière des Grands Nombres, les moyennes finissent toujours par se stabiliser.',
    'Le théorème central limite : une somme de nombreuses variables indépendantes est presque gaussienne.',
  ],
};
