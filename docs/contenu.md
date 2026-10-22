# Ajouter du contenu (classes, chapitres, exercices)

Chaque classe est une **île**, chaque chapitre du manuel une **région** de l'île. Le moteur
(carte, combats, carnet, sauvegarde) lit uniquement les types de `src/content/types.ts`.

## Où écrire

| Classe | Dossier | Liste à compléter |
| --- | --- | --- |
| 6e | `src/content/sixieme/` (exercices dans `src/exercises/sixieme/`) | `SIXIEME.chapters` |
| 5e | `src/content/cinquieme/` (exercices dans `src/exercises/cinquieme/`) | `CINQUIEME.chapters` |
| 4e | `src/content/quatrieme/` | `QUATRIEME.chapters` |
| 3e | `src/content/troisieme/` | `TROISIEME.chapters` |
| Seconde | `src/content/seconde/` (exercices possibles dans `src/exercises/seconde/`) | `SECONDE.chapters` dans `src/content/seconde/index.ts` |
| 1re spécialité | `src/content/premiere/` | `PREMIERE.chapters` |
| Terminale spécialité | `src/content/terminale/` (exercices possibles dans `src/exercises/terminale/`) | `TERMINALE.chapters` |
| Licence 1 | `src/content/licence1/` (exercices dans `src/exercises/licence1/`) | `LICENCE1.chapters` |
| Licence 2 | `src/content/licence2/` (exercices dans `src/exercises/licence2/`) | `LICENCE2.chapters` |
| Licence 3 | `src/content/licence3/` (exercices dans `src/exercises/licence3/`) | `LICENCE3.chapters` |

Un chapitre = un fichier qui exporte un `ChapterDef` :

- `id`, `title`, `region`, `theme` (voir `ThemeId`) ;
- `terrain` (facultatif, voir `TerrainId`) : relief de la carte (rivière, forêt, montagne, côte, archipel, marais, désert, canyon, lac). Évitez deux régions voisines d'une même île avec le même relief ;
- `skills` : des `Skill` (type de `src/exercises/types.ts`) ; les réponses possibles sont
  `number`, `set`, `pair` et `choice` (utiliser `makeChoice` pour un QCM) ; textes en LaTeX entre `$…$` ;
- `creatures` : 3 à 6 `CreatureDef`, de la plus simple à la plus difficile, chacune avec ses
  `skills` et un `look` (silhouette, teinte, symbole) : le jeu les dessine. Leur rareté (commune,
  peu commune, rare, légendaire) suit leur ordre dans la liste, ou le champ `rarity` : une créature
  rare se montre peu et pose des questions plus difficiles (voir `src/game/rarity.ts`) ;
- `boss` : le gardien, qui pose des questions de niveau 3.

**Identifiants** : uniques dans tout le jeu, préfixés par la classe (`6e-…`, `5e-…`, `4e-…`, `3e-…`, `2nde-…`, `1re-…`, `tle-…`, `l1-…`, `l2-…`, `l3-…`)
pour les chapitres, les compétences et les créatures. La sauvegarde s'appuie dessus : ne pas les
renommer une fois publiés.

## Tests

`tests/content.test.ts` vérifie automatiquement tout chapitre ajouté à une liste : identifiants
uniques, compétences existantes et toutes posées, 150 tirages par niveau sans `NaN` ni option de QCM
en double, bonne réponse acceptée. Ajouter des tests propres au chapitre (calculs justes, mauvaise
réponse refusée) dans `tests/`.
