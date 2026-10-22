import { POSITIONS_SKILLS } from '../../exercises/seconde/positions';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const POSITIONS: ChapterDef = {
  id: '2nde-positions',
  title: 'Positions relatives de droites',
  region: 'Col des Parallèles',
  theme: 'neige',
  terrain: 'montagne',
  skills: POSITIONS_SKILLS,
  creatures: [
    creature('secantin', 'Sécantin', 'Un oiseau des neiges qui vole là où deux pistes se croisent.', ['2nde-position-droites', '2nde-intersection'], 'oiseau', 190, '×'),
    creature('skieuse', 'Skieuse', 'Une bête qui glisse sur deux traces parallèles sans jamais les croiser.', ['2nde-parallele-point', '2nde-position-droites'], 'bete', 210, '∥'),
    creature('systemou', 'Systémou', 'Un blob de glace qui résout deux équations à la fois, une dans chaque main.', ['2nde-systeme', '2nde-intersection'], 'blob', 180, '{'),
    creature('confondue', 'Confondue', 'Un spectre du blizzard : on ne sait jamais s’il y en a un, aucun ou une infinité.', ['2nde-systeme-nb', '2nde-systeme'], 'spectre', 220, '∞'),
  ],
  boss: creature('glacior', 'Glacior, gardien du col', 'Le gardien du col, sculpté dans un bloc de glace. Ses équations ne fondent jamais.', POSITIONS_SKILLS.map((s) => s.id), 'golem', 200, '∦'),
  guide: [
    'Brr ! Bienvenue au Col des Parallèles.',
    'Sécantes, parallèles ou confondues ? Et quand elles se croisent, un système te dira où.',
  ],
};
