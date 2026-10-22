import { RELATIFS_SKILLS } from '../../exercises/cinquieme/relatifs';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const RELATIFS: ChapterDef = {
  id: '5e-relatifs',
  title: 'Nombres relatifs',
  region: 'Monts Relatifs',
  theme: 'neige',
  terrain: 'montagne',
  skills: RELATIFS_SKILLS,
  creatures: [
    creature('moinsou', 'Moinsou', 'Un blob glacé qui vit sous zéro et compare les températures négatives.', ['5e-relatifs-comparer'], 'blob', 210, '−'),
    creature('additrou', 'Additrou', 'Un oiseau des neiges : quand il croise un vent contraire, il soustrait les distances à zéro.', ['5e-relatifs-addition'], 'oiseau', 190, '±'),
    creature('opposoir', 'Opposoir', 'Une bête qui change chaque soustraction en addition de l’opposé.', ['5e-relatifs-soustraction', '5e-relatifs-somme'], 'bete', 230, '−'),
    creature('thermoth', 'Thermoth', 'Un insecte qui mesure les écarts de température entre le sommet et la vallée.', ['5e-relatifs-probleme'], 'insecte', 260, '°C'),
    creature('reperix', 'Repérix', 'Un spectre des cimes qui se déplace selon des coordonnées précises.', ['5e-reperage', '5e-relatifs-somme'], 'spectre', 240, 'xy'),
  ],
  boss: creature('glacimus', 'Glacimus, gardien des monts', 'Le gardien des monts trône à des altitudes positives et négatives.', RELATIFS_SKILLS.map((s) => s.id), 'golem', 200, '±'),
  guide: [
    'Les Monts Relatifs grimpent au-dessus de zéro et plongent en dessous.',
    'Signe plus, signe moins : garde bien le cap !',
  ],
};
