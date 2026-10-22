import { ARITHMETIQUE_3E } from '../../exercises/troisieme/arithmetique';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const ARITHMETIQUE: ChapterDef = {
  id: '3e-arithmetique',
  title: 'Arithmétique',
  region: 'Grottes des Diviseurs',
  theme: 'cristal',
  terrain: 'canyon',
  skills: ARITHMETIQUE_3E,
  creatures: [
    creature('divisou', 'Divisou', 'Un blob qui ne se laisse couper qu’en parts égales : il connaît tous les critères de divisibilité par cœur.', ['3e-divisibilite'], 'blob', 265, '÷'),
    creature('primelin', 'Primelin', 'Un insecte de cristal indivisible : on ne peut le partager qu’en un, ou en lui-même.', ['3e-premier', '3e-divisibilite'], 'insecte', 300, 'p'),
    creature('facteurock', 'Facteurock', 'Une bête qui casse les grands nombres en petits cailloux premiers.', ['3e-decomposition', '3e-premier'], 'bete', 240, '×'),
    creature('bouquetin', 'Bouquetin', 'Un oiseau fleuriste qui compose toujours le plus grand nombre de bouquets identiques.', ['3e-partage', '3e-irreductible'], 'oiseau', 330, '∣'),
    creature('phareau', 'Phareau', 'Un spectre lumineux qui clignote en rythme avec les autres phares des grottes.', ['3e-multiples-communs', '3e-partage', '3e-irreductible'], 'spectre', 200, '⊛'),
  ],
  boss: creature('diviseur-roi', 'Gardien Diviseur', 'Le gardien des grottes, taillé dans un nombre premier géant.', ARITHMETIQUE_3E.map((s) => s.id), 'golem', 280, '÷'),
  guide: ['Bienvenue dans les Grottes des Diviseurs !', 'Ici, on découpe les nombres en facteurs premiers et on partage sans rien laisser.'],
};
