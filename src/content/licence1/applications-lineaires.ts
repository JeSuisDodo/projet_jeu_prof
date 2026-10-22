import { APPLICATIONS_LINEAIRES_SKILLS } from '../../exercises/licence1/applicationsLineaires';
import type { ChapterDef } from '../types';
import { bossOf, creature } from './creature';

export const APPLICATIONS_LINEAIRES: ChapterDef = {
  id: 'l1-applications-lineaires',
  title: 'Applications linéaires',
  region: 'Bois des Noyaux',
  theme: 'prairie',
  terrain: 'foret',
  skills: APPLICATIONS_LINEAIRES_SKILLS,
  creatures: [
    creature('l1-linearbre', 'Linéarbre', 'Un arbre qui respecte les sommes et les multiples : f(au + bv) = af(u) + bf(v).', ['l1-image-vecteur', 'l1-matrice-application'], { shape: 'plante', hue: 100, symbol: 'f(u)' }),
    creature('l1-matricerf', 'Matricerf', 'Un cerf dont les bois dessinent la matrice de f dans la base canonique.', ['l1-matrice-application', 'l1-rang-noyau'], { shape: 'bete', hue: 80, symbol: 'Mat' }),
    creature('l1-noyautin', 'Noyautin', 'Il ramasse tous les vecteurs que f envoie sur zéro.', ['l1-noyau-forme-lineaire', 'l1-rang-noyau'], { shape: 'blob', hue: 60, symbol: 'ker' }),
    creature('l1-changebase', 'Changebase', 'Un esprit qui voit la même application sous un autre angle : P⁻¹AP.', ['l1-changement-base', 'l1-noyau-forme-lineaire'], { shape: 'spectre', hue: 130, symbol: 'P⁻¹' }),
  ],
  boss: bossOf('l1-rangnar', 'Rangnar, gardien du bois', 'Il sait que noyau et image se partagent la dimension de l’espace.', APPLICATIONS_LINEAIRES_SKILLS, { shape: 'golem', hue: 90, symbol: 'rg' }),
  guide: [
    'Dans ce bois, chaque sentier transforme des vecteurs en d’autres vecteurs, linéairement.',
    'Théorème du rang : $\\dim\\ker f + \\operatorname{rg} f = \\dim E$.',
  ],
};
