# Comptes professeur et élèves

Le menu principal propose trois entrées : **Je suis élève**, **Je suis professeur** et
**Jouer librement** (sans compte, comme avant).

## Le parcours

1. Le professeur crée un compte (nom, e-mail, mot de passe). Si Supabase demande de confirmer
   l'adresse, le jeu affiche un écran d'attente : dès que le lien de l'e-mail est cliqué (sur
   le même appareil ou un autre), l'espace professeur s'ouvre tout seul. Le lien ouvre aussi
   directement l'espace professeur. Il crée ensuite une **partie** : un nom,
   un niveau (6e à L3) et la liste de ses élèves, un « Prénom Nom » par ligne (un copier-coller
   depuis un tableur marche).
2. La partie reçoit un **code** de 6 caractères et un **lien d'invitation**
   (`…/projet_jeu_prof/?partie=CODE`), à copier ou partager.
3. Comme sur Tricount, l'élève qui ouvre le lien (ou tape le code) voit la liste des noms et
   choisit le sien. La première fois, il choisit un mot de passe ; ensuite il le redonne pour
   retrouver sa partie sur un autre appareil.
4. Le jeu démarre sur l'île du niveau de la partie. Après chaque combat, la progression est
   envoyée au professeur (indicateur ☁ en haut ; ⚠ si l'envoi a échoué, nouvel essai ensuite).
5. Le professeur voit pour chaque élève : inscrit ou non, XP, gardiens battus, taux de réussite,
   dernière activité ; et en cliquant, le détail par chapitre et les compétences à retravailler.
   Il peut ajouter des élèves, réinitialiser le mot de passe d'un élève (sa progression est
   gardée), retirer un élève ou supprimer la partie.

## Mode démo et mode en ligne

Une étiquette à côté du titre de l'espace professeur indique **En ligne** ou **Mode démo**.

Tant que Supabase n'est pas configuré, le jeu est en **mode démo** : comptes, parties et
progression restent dans le navigateur (`localStorage`). Pratique pour essayer le parcours :
créer la partie, puis ouvrir le lien d'invitation dans un autre onglet du même navigateur.

Pour que professeurs et élèves se retrouvent depuis des appareils différents, il faut le
service en ligne **Supabase** (gratuit pour un usage scolaire modeste).

### Mettre en place Supabase (une seule fois)

1. Créer un compte sur <https://supabase.com>, puis **New project**. Région : **Europe**
   (Paris ou Francfort), pour le RGPD. Garder le mot de passe de la base pour soi.
2. **Authentication → Sign In / Providers** : activer **Allow anonymous sign-ins**
   (les élèves n'ont pas d'e-mail : leur navigateur reçoit une session anonyme, rattachée
   à leur nom par leur mot de passe). Laisser **Email** activé pour les professeurs.
3. **Authentication → URL Configuration** : **Site URL** =
   `https://jesuisdodo.github.io/projet_jeu_prof/` (lien des e-mails de confirmation).
4. **SQL Editor → New query** : coller tout le fichier [`supabase/schema.sql`](../supabase/schema.sql)
   puis **Run**.
5. Récupérer l'**URL du projet** et la clé publique **anon** (ou **publishable**), via le
   bouton **Connect** ou **Project Settings → API Keys**, et les mettre dans
   `src/online/config.ts` (ou dans les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`).

La clé anon est faite pour être publique. **Ne jamais publier la clé `service_role` / secret.**

## Protection des données

Les règles sont dans la base (`supabase/schema.sql`), pas dans le jeu : même avec la clé
publique, personne ne peut les contourner.

- Un professeur ne lit et ne modifie que ses parties et les élèves de ses parties.
- Un élève ne lit que sa propre ligne, depuis un appareil où il s'est connecté avec son mot de
  passe ; il ne peut écrire que sa progression.
- Avec un code de partie, on ne voit que le nom de la partie, du professeur et la liste des
  noms (le principe de Tricount) : le code se partage donc seulement avec la classe.
- Les mots de passe des élèves sont chiffrés (bcrypt) dans une table illisible depuis
  l'application ; 5 erreurs de suite bloquent le compte 5 minutes.
- Aucune adresse e-mail d'élève n'est demandée ; on peut se contenter du prénom et de
  l'initiale du nom.

## Code

- `src/online/types.ts` : le contrat `Backend`, commun aux deux modes.
- `src/online/local.ts` : mode démo ; `src/online/supabase.ts` : mode en ligne.
- `src/online/progress.ts` : bilan par chapitre affiché au professeur.
- `src/ui/menu.ts` (décor animé), `src/ui/home.ts` (accueil), `src/ui/student.ts`,
  `src/ui/teacher.ts`.
