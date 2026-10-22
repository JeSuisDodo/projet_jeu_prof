import { ALGORITHMIQUE_3E } from '../../exercises/troisieme/algorithmique';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const ALGORITHMIQUE: ChapterDef = {
  id: '3e-algorithmique',
  title: 'Algorithmique et programmation',
  region: 'Îlots du Code',
  theme: 'nuit',
  terrain: 'archipel',
  skills: ALGORITHMIQUE_3E,
  creatures: [
    creature('lutinot', 'Lutinot', 'Un petit lutin qui avance, tourne et trace des polygones.', ['3e-algo-figure'], 'insecte', 190, '↻'),
    creature('boucleron', 'Boucleron', 'Un serpent qui se mord la queue : il répète les mêmes instructions.', ['3e-algo-boucle'], 'bete', 170, '⟳'),
    creature('sinonou', 'Sinonou', 'Un blob qui hésite à chaque carrefour : si… alors… sinon.', ['3e-algo-condition', '3e-algo-figure'], 'blob', 150, '?'),
    creature('variablaireau', 'Variablaireau', 'Un oiseau qui change de valeur à chaque instruction.', ['3e-algo-variables', '3e-algo-boucle'], 'oiseau', 210, 'a←'),
  ],
  boss: creature('scriptor', 'Scriptor, gardien des îlots', 'Le gardien des îlots, écrit en blocs emboîtés.', ALGORITHMIQUE_3E.map((s) => s.id), 'golem', 180, '{ }'),
  guide: ['Les Îlots du Code s’allument au rythme des programmes.', 'Boucles, conditions et variables : suis les instructions pas à pas.'],
};
