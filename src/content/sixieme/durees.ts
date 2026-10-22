import { DUREES_SKILLS } from '../../exercises/sixieme/durees';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const DUREES: ChapterDef = {
  id: '6e-durees',
  title: 'Durées et horaires',
  region: 'Côte des Horloges',
  theme: 'nuit',
  terrain: 'cote',
  skills: DUREES_SKILLS,
  creatures: [
    creature('minutin', 'Minutin', 'Un crabe pressé qui sait qu’une heure fait soixante minutes.', ['6e-convertir-duree'], 'insecte', 220, '60'),
    creature('trajetoile', 'Trajetoile', 'Une étoile de mer qui calcule la durée de chaque voyage.', ['6e-calcul-duree'], 'blob', 250, 'Δt'),
    creature('horairon', 'Horairon', 'Une mouette qui annonce l’heure d’arrivée des bateaux.', ['6e-heure-arrivee'], 'oiseau', 200, 'h'),
    creature('decimaree', 'Décimarée', 'Une méduse rare qui sait que 1,5 h n’est pas 1 h 50.', ['6e-duree-decimale', '6e-somme-durees'], 'poisson', 270, '1,5'),
  ],
  boss: creature('chronos', 'Chronos, gardien de la côte', 'Le gardien de la côte, un phare dont la lumière tourne comme une aiguille.', DUREES_SKILLS.map((s) => s.id), 'golem', 240, 't'),
  guide: [
    'La Côte des Horloges vit au rythme des marées et des horaires.',
    'Attention : une heure, c’est 60 minutes, pas 100 !',
  ],
};
