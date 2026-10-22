import { FONCTIONS_3E } from '../../exercises/troisieme/fonctions';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const FONCTIONS: ChapterDef = {
  id: '3e-fonctions',
  title: 'Notion de fonction',
  region: 'Marais des Images',
  theme: 'marais',
  terrain: 'marais',
  skills: FONCTIONS_3E,
  creatures: [
    creature('imagelle', 'Imagelle', 'Une grenouille qui renvoie l’image de tout nombre qu’on lui lance.', ['3e-image'], 'blob', 100, 'f'),
    creature('tabloton', 'Tabloton', 'Un insecte qui range ses valeurs en deux lignes bien alignées.', ['3e-tableau-valeurs', '3e-image'], 'insecte', 80, 'x↦'),
    creature('motmarais', 'Motmarais', 'Un spectre qui confond parfois image et antécédent… mais jamais devant toi.', ['3e-vocabulaire-fonction'], 'spectre', 140, '↦'),
    creature('antecedor', 'Antécédor', 'Un poisson qui remonte le courant : donne-lui une image, il retrouve le nombre de départ.', ['3e-antecedent', '3e-vocabulaire-fonction'], 'poisson', 120, 'f⁻'),
    creature('courbouille', 'Courbouille', 'Une plante qui ne pousse que sur les points de sa courbe.', ['3e-point-courbe', '3e-antecedent'], 'plante', 90, '𝒞'),
  ],
  boss: creature('fonctionnaire', 'Grand Fonctionnaire, gardien du marais', 'Le gardien du marais, qui associe à chaque nombre une seule image.', FONCTIONS_3E.map((s) => s.id), 'golem', 110, 'f'),
  guide: ['Dans le Marais des Images, chaque nombre a une image… et parfois plusieurs antécédents.', 'Calcule, lis les tableaux et vérifie si les points sont sur la courbe.'],
};
