import { THALES_3E } from '../../exercises/troisieme/thales';
import type { ChapterDef } from '../types';
import { creature } from './outils';

export const THALES: ChapterDef = {
  id: '3e-thales',
  title: 'Théorème de Thalès',
  region: 'Archipel des Parallèles',
  theme: 'plage',
  terrain: 'archipel',
  skills: THALES_3E,
  creatures: [
    creature('ombrelle', 'Ombrelle', 'Un spectre d’ombre qui mesure les arbres à partir de leur ombre.', ['3e-thales-probleme'], 'spectre', 230, '∥'),
    creature('rapporteau', 'Rapporteau', 'Un poisson qui écrit toujours ses rapports dans le bon ordre.', ['3e-thales-rapports'], 'poisson', 180, '∶'),
    creature('paralleon', 'Paralléon', 'Un oiseau qui vole en formation parfaitement parallèle.', ['3e-thales-longueur', '3e-thales-rapports'], 'oiseau', 200, '∥'),
    creature('papillonde', 'Papillonde', 'Un papillon dont les ailes forment une configuration de Thalès croisée.', ['3e-thales-longueur', '3e-thales-reciproque'], 'insecte', 300, '⋈'),
    creature('reciprocrabe', 'Réciprocrabe', 'Un crabe qui marche à l’envers : il démontre que des droites sont parallèles.', ['3e-thales-reciproque', '3e-thales-probleme'], 'insecte', 10, '⇐'),
  ],
  boss: creature('thalassa', 'Thalassa, gardienne de l’archipel', 'La gardienne de l’archipel, dont les ponts sont tous parallèles.', THALES_3E.map((s) => s.id), 'golem', 190, '∥'),
  guide: ['Les îles de l’Archipel des Parallèles sont reliées par des ponts bien droits.', 'Thalès te permettra de calculer des longueurs inaccessibles.'],
};
