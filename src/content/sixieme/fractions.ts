import { FRACTIONS_SKILLS } from '../../exercises/sixieme/fractions';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const FRACTIONS: ChapterDef = {
  id: '6e-fractions',
  title: 'Fractions',
  region: 'Plage des Parts',
  theme: 'plage',
  terrain: 'cote',
  skills: FRACTIONS_SKILLS,
  creatures: [
    creature('partelle', 'Partelle', 'Une étoile de mer à huit branches qui partage tout en parts égales.', ['6e-fraction-partage', '6e-fraction-quantite'], 'blob', 20, '½'),
    creature('quotiplouf', 'Quotiplouf', 'Un poisson qui sait que trois septièmes, c’est trois divisé par sept.', ['6e-fraction-quotient', '6e-fraction-decimal'], 'poisson', 195, 'a/b'),
    creature('mouettiers', 'Mouettiers', 'Une mouette qui se pose toujours sur la bonne graduation.', ['6e-fraction-demi-droite', '6e-encadrer-fraction'], 'oiseau', 210, '¾'),
    creature('egalitou', 'Égalitou', 'Un crabe qui multiplie le haut et le bas par le même nombre sans changer de valeur.', ['6e-fractions-egales', '6e-fraction-et-un'], 'insecte', 10, '='),
    creature('sommarine', 'Sommarine', 'Une créature des vagues, rare, qui additionne les fractions de même dénominateur.', ['6e-somme-fractions', '6e-fractions-egales', '6e-fraction-quantite'], 'poisson', 230, '+'),
  ],
  boss: creature('fractalon', 'Fractalon, gardien de la plage', 'Le gardien de la plage, dont la carapace est partagée en parts parfaitement égales.', FRACTIONS_SKILLS.map((s) => s.id), 'golem', 35, '⅝'),
  guide: [
    'Sur la Plage des Parts, chaque vague emporte une fraction du sable.',
    'Numérateur en haut, dénominateur en bas : le dénominateur dit en combien on partage.',
  ],
};
