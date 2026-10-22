import { NOMBRES_SKILLS } from '../../exercises/sixieme/nombres';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const NOMBRES: ChapterDef = {
  id: '6e-nombres',
  title: 'Nombres entiers et décimaux',
  region: 'Prairie des Chiffres',
  theme: 'prairie',
  terrain: 'riviere',
  skills: NOMBRES_SKILLS,
  creatures: [
    creature('chiffrot', 'Chiffrot', 'Un petit blob qui range chaque chiffre dans sa case : unités, dizaines, centaines…', ['6e-chiffre-rang', '6e-lettres'], 'blob', 120, '123'),
    creature('virgulin', 'Virgulin', 'Un oiseau dont la queue en virgule sépare la partie entière des décimales.', ['6e-fraction-decimale', '6e-chiffre-rang'], 'oiseau', 200, ','),
    creature('compario', 'Compario', 'Une bête qui ouvre toujours sa gueule du côté du plus grand nombre.', ['6e-comparer', '6e-encadrer'], 'bete', 30, '<'),
    creature('graduelle', 'Graduelle', 'Une chenille dont chaque anneau est une graduation de la demi-droite.', ['6e-demi-droite', '6e-encadrer'], 'insecte', 90, '|'),
    creature('arrondelle', 'Arrondelle', 'Un poisson très rare qui arrondit tout ce qu’il touche, au dixième près.', ['6e-arrondir', '6e-comparer', '6e-demi-droite'], 'poisson', 180, '≈'),
  ],
  boss: creature('numeros', 'Numéros, gardien de la prairie', 'Le gardien de la prairie : il connaît chaque nombre par son nom et sa place.', NOMBRES_SKILLS.map((s) => s.id), 'golem', 140, '0,1'),
  guide: [
    'Bienvenue dans la Prairie des Chiffres, première région de l’île !',
    'Ici, chaque chiffre a sa place : unités, dizaines, dixièmes, centièmes… Lis bien les nombres avant de les comparer.',
  ],
};
