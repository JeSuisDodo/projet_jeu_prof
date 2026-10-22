# Mathoria (nom provisoire)

Jeu d'aventure web en monde ouvert pour faire travailler les mathématiques au lycée
(2nde, 1re spécialité, Terminale, manuels Variations Hatier). Chaque rencontre avec une
créature est un exercice généré automatiquement selon la classe de l'élève ; à terme, le
professeur suivra la progression de ses élèves.

## Ce que contient le prototype

Chaque classe est une **île** (Seconde, 1re spécialité, Terminale spécialité) et chaque chapitre
du programme une **région** de l'île, avec son ambiance (volcan, neige, désert, forêt, nuit…),
ses créatures et son gardien. La carte de l'île (bouton carte, touche V) permet de changer de
région. Voir `docs/contenu.md` pour ajouter un chapitre.

- Écran d'accueil : choix de la classe et du pseudo, puis de la région de départ.
- Carte explorable de 80 × 60 cases, dessinée par le code (aucune image à fournir) :
  rivière de lave et son bras nord, trois ponts, plateaux rocheux, forêt, chemins, panneaux
  à lire. Le décor a du relief : falaises avec leur face éclairée et leur ombre, lave en
  contrebas, buissons et arbres qui débordent sur la case du dessus, angles arrondis.
  Flèches, ZQSD ou WASD au clavier ; doigt maintenu sur l'écran au téléphone.
- 11 zones de hautes herbes, de niveau 1 (plaine du sud) à 3 (pentes du volcan).
- Dans chaque région, 3 à 6 créatures (dessinées par le jeu à partir d'une silhouette, d'une
  couleur et d'un symbole) et un gardien qu'on peut défier après avoir capturé 3 espèces.
- Combat = exercice : chaque bonne réponse retire un cœur, une erreur fait fuir la créature
  et affiche la correction pas à pas. Un indice est disponible (moins d'expérience gagnée).
- 10 modèles d'exercices générés aléatoirement (dossier `src/exercises`) :
  image d'un nombre, discriminant, nombre de solutions, résolution, sommet, forme canonique,
  factorisation, seconde racine, inéquation, extremum.
- Les compétences ratées reviennent plus souvent, celles réussies récemment moins.
- Carnet (touche C) : créatures capturées et taux de réussite par compétence.
- Personnages détaillés (héros vu de face, de dos et de profil) et créatures redessinées.
- Animations : marche et respiration des personnages, herbe qui ondule et se plie au passage,
  lave qui bouillonne, braises et fumée du cratère, transition de combat, apparition, coups,
  capture et fuite des créatures. Le réglage « réduire les animations » est respecté.
- Son : musique d'exploration, de combat et du gardien, bruitages (herbes, rencontre, bonne et
  mauvaise réponse, capture, fuite, panneaux). Tout est synthétisé par le navigateur (Web Audio),
  sans fichier son : compositions originales, aucun droit à gérer.
- En haut à droite, des boutons-icônes : couper le son (M), carte de l'île (V), carnet (C), paramètres (P).
  Paramètres : volume de la musique et des effets, couper le son, réduire les animations
  (coché d'office si le système le demande), texte plus grand. Gardés sur l'appareil.
- Sauvegarde dans le navigateur (`localStorage`). Pas encore de comptes ni d'espace professeur.

## Lancer le jeu

Il faut [Node.js](https://nodejs.org) 20 ou plus récent.

```bash
npm install
npm run dev      # puis ouvrir l'adresse affichée (http://localhost:5173)
npm test         # vérifie les modèles d'exercices et la carte
npm run build    # version à mettre en ligne, dans dist/
```

## Mise en ligne

Le workflow `.github/workflows/pages.yml` publie le jeu sur GitHub Pages à chaque mise à jour
de `main`. Il faut l'activer une fois : *Settings → Pages → Build and deployment → Source :
GitHub Actions*.

## Organisation du code

| Dossier | Rôle |
| --- | --- |
| `src/audio` | Musique et bruitages synthétisés (Web Audio). |
| `src/content` | Programme : une classe par dossier, un chapitre par fichier (`types.ts` décrit le format). |
| `src/exercises` | Modèles d'exercices, saisie des réponses (entiers, décimaux, fractions), vérification. |
| `src/game` | Carte (`map.ts`), décor peint en relief (`terrain.ts`), créatures, sauvegarde, textures animées et scène Phaser de l'exploration. |
| `src/ui` | Écrans HTML par-dessus le jeu : accueil, combat, carnet, dialogues, paramètres. |
| `tests` | Tests Vitest : chaque modèle est essayé sur des centaines de tirages. |

Ajouter un exercice : écrire un objet `Skill` dans `src/exercises/secondDegre.ts` (ou un nouveau
fichier de chapitre), l'ajouter à la liste exportée, puis à une créature dans `src/game/creatures.ts`.
