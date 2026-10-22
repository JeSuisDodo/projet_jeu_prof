import { COMPLEXES_SKILLS } from '../../exercises/licence1/complexes';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const COMPLEXES: ChapterDef = {
  id: 'l1-nombres-complexes',
  title: 'Nombres complexes',
  region: 'Archipel Imaginaire',
  theme: 'nuit',
  terrain: 'archipel',
  skills: COMPLEXES_SKILLS,
  creatures: [
    creature('l1-imaginou', 'Imaginou', 'Un petit esprit dont le carré vaut −1.', ['l1-forme-algebrique', 'l1-module'], { shape: 'spectre', hue: 230, symbol: 'i' }),
    creature('l1-modulette', 'Modulette', 'Un poisson qui mesure toujours sa distance à l’origine.', ['l1-module', 'l1-equation-second-degre-complexe'], { shape: 'poisson', hue: 210, symbol: '|z|' }),
    creature('l1-argumoth', 'Argumoth', 'Un papillon de nuit qui vole toujours selon le même angle.', ['l1-argument', 'l1-puissance-complexe'], { shape: 'insecte', hue: 250, symbol: 'θ' }),
    creature('l1-racinocte', 'Racinocte', 'Il cache sous chaque île les racines carrées d’un nombre complexe.', ['l1-racine-carree-complexe', 'l1-forme-algebrique'], { shape: 'plante', hue: 260, symbol: '√z' }),
  ],
  boss: bossOf('l1-moivrion', 'Moivrion, gardien de l’archipel', 'Il fait tourner les îles d’un angle θ à chaque puissance.', COMPLEXES_SKILLS, { shape: 'golem', hue: 240, symbol: 'eⁱᶿ' }),
  guide: [
    'Ces îles flottent dans un ciel imaginaire : chacune a une partie réelle et une partie imaginaire.',
    'Pour diviser par un complexe, multiplie en haut et en bas par son conjugué.',
  ],
};
