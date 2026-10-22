import { GRANDEURS_3E } from '../../exercises/troisieme/proportionnalite';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const GRANDEURS: ChapterDef = {
  id: '3e-grandeurs',
  title: 'Grandeurs composées',
  region: 'Désert des Vitesses',
  theme: 'desert',
  terrain: 'desert',
  skills: GRANDEURS_3E,
  creatures: [
    creature('filasable', 'Filasable', 'Un lézard qui file à vitesse constante sur les dunes.', ['3e-vitesse'], 'bete', 35, 'v'),
    creature('chronopion', 'Chronopion', 'Un scorpion qui chronomètre tous les trajets du désert.', ['3e-duree', '3e-vitesse'], 'insecte', 25, 't'),
    creature('debitruche', 'Débitruche', 'Une autruche qui boit à débit constant aux oasis.', ['3e-debit'], 'oiseau', 190, 'L'),
    creature('convertigre', 'Convertigre', 'Un fauve des sables qui passe des km/h aux m/s sans ralentir.', ['3e-conversion-vitesse', '3e-duree'], 'bete', 15, 'm/s'),
  ],
  boss: creature('mirage', 'Mirage, gardien du désert', 'Le gardien du désert : on ne sait jamais à quelle vitesse il approche.', GRANDEURS_3E.map((s) => s.id), 'spectre', 40, 'd/t'),
  guide: ['Le Désert des Vitesses est immense : mieux vaut savoir calculer un temps de trajet.', 'Vitesses, durées, débits et conversions t’attendent dans les dunes.'],
};
