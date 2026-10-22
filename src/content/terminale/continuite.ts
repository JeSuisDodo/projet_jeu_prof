import { CONTINUITE_SKILLS } from '../../exercises/terminale/continuite';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const CONTINUITE: ChapterDef = {
  id: 'tle-continuite',
  title: 'Continuité',
  region: 'Vallée Continue',
  theme: 'prairie',
  skills: CONTINUITE_SKILLS,
  creatures: [
    creature('tle-pontinu', 'Pontinu', 'Une chenille qui relie les deux rives sans jamais faire de saut.', ['tle-tvi-encadrement', 'tle-continuite-morceaux'], { shape: 'insecte', hue: 110, symbol: '∫' }),
    creature('tle-dichotaupe', 'Dichotaupe', 'Une taupe qui coupe toujours son terrier en deux pour trouver le trésor.', ['tle-dichotomie', 'tle-tvi-encadrement'], { shape: 'bete', hue: 35, symbol: '½' }),
    creature('tle-tvillon', 'Tvillon', 'Un papillon qui visite chaque valeur entre deux fleurs.', ['tle-tvi-tableau', 'tle-dichotomie'], { shape: 'oiseau', hue: 300, symbol: 'TVI' }),
    creature('tle-fixeuil', 'Fixeuil', 'Un écureuil qui tourne en rond jusqu’à trouver le point fixe.', ['tle-suite-point-fixe', 'tle-continuite-morceaux'], { shape: 'bete', hue: 25, symbol: 'ℓ' }),
  ],
  boss: bossOf('tle-continuum', 'Continuum, gardien de la vallée', 'Il n’a jamais levé le crayon de sa vie.', CONTINUITE_SKILLS, { shape: 'golem', hue: 130, symbol: 'C⁰' }),
  guide: [
    'Dans la Vallée Continue, on peut tracer chaque chemin sans lever le crayon.',
    'Si une fonction continue passe d’une valeur négative à une valeur positive, elle s’annule forcément quelque part : c’est le théorème des valeurs intermédiaires.',
  ],
};
