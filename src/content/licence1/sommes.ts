import { SOMMES_SKILLS } from '../../exercises/licence1/sommes';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const SOMMES: ChapterDef = {
  id: 'l1-sommes-binome',
  title: 'Sommes et binôme de Newton',
  region: 'Forêt des Sommes',
  theme: 'automne',
  terrain: 'foret',
  skills: SOMMES_SKILLS,
  creatures: [
    creature('l1-sigmousse', 'Sigmousse', 'Une mousse qui additionne toutes les feuilles tombées, de 1 à n.', ['l1-sommes-usuelles', 'l1-somme-geometrique'], { shape: 'plante', hue: 30, symbol: 'Σ' }),
    creature('l1-telescopin', 'Télescopin', 'Un écureuil qui empile ses noisettes : presque toutes s’annulent deux à deux.', ['l1-somme-telescopique', 'l1-sommes-usuelles'], { shape: 'bete', hue: 20, symbol: '⇲' }),
    creature('l1-binomouette', 'Binomouette', 'Elle développe (a + b)ⁿ en un battement d’ailes.', ['l1-binome-newton', 'l1-somme-binomiale'], { shape: 'oiseau', hue: 45, symbol: '(ⁿₖ)' }),
    creature('l1-doublesigma', 'Doublesigma', 'Un spectre à deux indices qui parcourt toute la forêt, ligne par ligne.', ['l1-somme-double', 'l1-somme-geometrique'], { shape: 'spectre', hue: 15, symbol: 'ΣΣ' }),
  ],
  boss: bossOf('l1-pascalor', 'Pascalor, gardien de la forêt', 'Un arbre immense dont les branches forment le triangle de Pascal.', SOMMES_SKILLS, { shape: 'golem', hue: 35, symbol: '△' }),
  guide: [
    'Les feuilles de cette forêt tombent en suites : il faut savoir toutes les additionner.',
    'Pense aux formules : $\\sum k = \\frac{n(n+1)}{2}$ et $\\sum q^k = \\frac{1 - q^{n+1}}{1 - q}$.',
  ],
};
