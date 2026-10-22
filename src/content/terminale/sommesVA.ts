import { SOMMES_VA_SKILLS } from '../../exercises/terminale/probabilites';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const SOMMES_VA: ChapterDef = {
  id: 'tle-sommes-variables-aleatoires',
  title: 'Sommes de variables aléatoires, concentration et loi des grands nombres',
  region: 'Cratère des Grands Nombres',
  theme: 'volcan',
  skills: SOMMES_VA_SKILLS,
  creatures: [
    creature('tle-esperix', 'Espérix', 'Une braise qui calcule la moyenne pondérée de ses étincelles.', ['tle-esperance-loi', 'tle-esperance-lineaire'], { shape: 'blob', hue: 20, symbol: 'E' }),
    creature('tle-variancendre', 'Variancendre', 'Un esprit de cendre qui mesure la dispersion.', ['tle-variance-somme', 'tle-esperance-lineaire'], { shape: 'spectre', hue: 10, symbol: 'V' }),
    creature('tle-echantillave', 'Échantillave', 'Une salamandre de lave qui prélève des échantillons.', ['tle-moyenne-echantillon', 'tle-variance-somme'], { shape: 'poisson', hue: 30, symbol: 'M' }),
    creature('tle-tchebyflamme', 'Tchebyflamme', 'Une flamme qui borne l’imprévisible.', ['tle-bienayme-tchebychev', 'tle-concentration'], { shape: 'oiseau', hue: 5, symbol: 'δ²' }),
  ],
  boss: bossOf('tle-grandnombrus', 'Grandnombrus, gardien du cratère', 'Il a lancé des milliards de pièces et sait que la moyenne finit par se stabiliser.', SOMMES_VA_SKILLS, { shape: 'golem', hue: 15, symbol: 'LGN' }),
  guide: [
    'Au Cratère des Grands Nombres, plus on répète une expérience, plus la moyenne se rapproche de l’espérance.',
    'C’est la loi des grands nombres : le dernier sommet de l’île !',
  ],
};
