import { AIRES_SKILLS } from '../../exercises/sixieme/mesures';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const AIRES: ChapterDef = {
  id: '6e-aires',
  title: 'Aires',
  region: 'Champs des Aires',
  theme: 'prairie',
  terrain: 'riviere',
  skills: AIRES_SKILLS,
  creatures: [
    creature('carrelou', 'Carrelou', 'Un blob carré qui compte combien de carreaux il recouvre.', ['6e-aire-rectangle', '6e-conversion-aire'], 'blob', 80, 'cm²'),
    creature('triangelle', 'Triangelle', 'Une sauterelle qui sait qu’un triangle rectangle est la moitié d’un rectangle.', ['6e-aire-triangle'], 'insecte', 100, '△'),
    creature('disquette', 'Disquette', 'Une fleur ronde qui calcule son aire avec π.', ['6e-aire-disque'], 'plante', 60, 'πr²'),
    creature('hectarus', 'Hectarus', 'Une bête des champs qui convertit les hectares en mètres carrés.', ['6e-conversion-aire', '6e-aire-composee'], 'bete', 50, 'ha'),
    creature('composite', 'Composite', 'Un épouvantail rare fait de morceaux de figures assemblés.', ['6e-aire-composee', '6e-aire-triangle', '6e-aire-disque'], 'golem', 40, '⊞'),
  ],
  boss: creature('surfacor', 'Surfacor, gardien des champs', 'Le gardien des champs, qui connaît la surface de chaque parcelle.', AIRES_SKILLS.map((s) => s.id), 'golem', 70, 'A'),
  guide: [
    'Les Champs des Aires sont découpés en parcelles de toutes formes.',
    'Une aire se mesure en unités carrées : cm², m², ha… Ne la confonds pas avec le périmètre !',
  ],
};
