# Paper Tales : spécification de la table, phase par phase

Source : livret FR (`app/public/rules-fr.pdf`, pages citées) et règles codées (`rules/src/rules`). Ce que le code fait au-delà du livret n'est pas affiché. Les points ouverts sont en fin de document.

## 1. Principes

- **Un seul layout**, le même sur un téléphone en paysage (844 × 390) et sur un écran de bureau. Sur bureau, tout est simplement plus grand. La table est aussi serrée que possible : chaque bande vide coûte de la taille à chaque carte.
- **Une zone de joueur à la fois**, en grand. La mienne par défaut. Le royaume d'un autre Monarque s'ouvre par l'œil de son panneau. Une **vue Voisins** montre les trois royaumes qui comptent pour la guerre (p. 6 : on ne combat que ses deux voisins directs).
- **Même orientation pour tout le monde** : rangée Avant en haut, Arrière en bas, 5ᵉ emplacement à gauche de l'Avant.
- **Uniquement React + framework.** Pas d'accès au DOM. Les panneaux et widgets sont des composants posés dans la `GameTable`.
- **Thème du livret** : fond vitrail existant, étiquettes crème `#f4efe4` texte brun `#2a2a2a`, police Mulish (celle du framework), titres gras. Pas de couleurs de joueur sur les emplacements du royaume (neutres, légèrement translucides) ; la couleur du joueur reste sur son panneau et ses pions.

### Structure de la table (en em, largeur ≈ 100, hauteur ≈ 47)

```
┌──────────┬───────────────────────────────────────┬─────────┐
│ Panneaux │ Zone du joueur affiché                │ Tour    │
│ (gauche) │  Royaume 3×2   │ Bâtiments 2×3 fixes  │ 1← 2→   │
│ voisin G │                │ (gris = pas construit)│ 3← 4→   │
│ moi      │                │                      │ Pioche  │
│ voisin D │                │                      │ Défausse│
│ autres…  │  Mains / or (ma zone seulement)       │ Réserves│
└──────────┴───────────────────────────────────────┴─────────┘
```

### Panneaux (colonne de gauche)

- Ordre : **voisin de gauche, moi, voisin de droite**, puis les autres dans l'ordre de table. Étiquettes « Gauche » / « Droite » sur les deux voisins. À 2 joueurs : moi puis l'adversaire.
- Contenu sur deux lignes : nom + chrono ; score, or (jamais caché, p. 3), force de l'Avant, cartes en main ; puis bois, nourriture, minerai produits (p. 4 : les ressources ne sont pas des jetons, elles sont comptées tant que les cartes sont en jeu).
- **Œil** : languette dans la couleur du panneau, sur son bord intérieur (côté table), qui ouvre la zone de ce joueur. Le panneau affiché est entouré d'un liseré clair. Anneau sur le joueur actif (framework).
- Pendant le Recrutement, le panneau du Monarque qui **reçoit mes cartes** porte une étiquette.

### Colonne de droite (commun)

- **Compte-tours** dessiné : 4 cases numérotées, la case du tour en cours en surbrillance, flèche de sens du draft sur chaque case (← tours 1 et 3, → tours 2 et 4, p. 5). Remplace le livre `time1..4.png`.
- **Pioche** (dos) et **défausse** (dos assombri, p. 3 : la défausse est face cachée), aux proportions d'une carte, avec étiquettes.
- **Réserves** : un jeton Or et un jeton Âge, chacun avec son étiquette, pas des tas.
- Le pion Temps physique et les piles de jetons disparaissent de la table.

### Zone du joueur

- **Royaume** : 2 Avant + 2 Arrière, plus le 5ᵉ (Avant, gauche) hachuré tant qu'aucun Bâtiment niveau 2 n'est en jeu (p. 8). Jetons Âge posés sur les unités, à la même échelle que la carte.
- **Bâtiments** : grille fixe de 2 colonnes à droite du royaume, un emplacement par bâtiment (Mine, Temple, Taverne, Caserne, Ville). Non construit : grisé. Construit : net, niveau 1 ou retourné niveau 2. Le livret pose les construits « à proximité des unités » et les autres « à l'écart » (p. 4) ; la grille fixe rend les deux lisibles d'un coup d'œil, c'est le choix retenu.
- **Ma main** (ma zone seulement) : sous le royaume. Les mains des autres ne sont jamais montrées (information cachée), seulement comptées dans leur panneau.
- **Mon or** : pile de pièces près de ma main, compté aussi dans mon panneau.

### Vue Voisins

- Trois royaumes réduits (≈ 70 %) côte à côte : voisin de gauche, joueur central, voisin de droite. Le **joueur central est le joueur affiché** : depuis le royaume de Bleu, la vue Voisins montre les voisins de Bleu. À 2 joueurs : deux royaumes.
- Sous chaque royaume : nom et **force** (somme des forces de l'Avant + unités Arrière avec attaque à distance, p. 6). Les unités de l'Arrière sont assombries.
- **Aucun « gagné / perdu » hors phase de Guerre.** La guerre se résout d'un coup (`War.onRuleStart`) : le résultat se lit dans l'animation des marqueurs de score, l'entête de la phase et le journal (« Marie gagne contre Fred : +3 PL »). La vue Voisins s'ouvre automatiquement de la Révélation à la Guerre, puis on revient à la vue précédente.
- Boutons : « Mon royaume » (retour) et « Voisins », stylés comme les étiquettes.

## 2. Phases (p. 4 : 4 tours de 6 phases simultanées)

### Phase 1 : Recrutement (Deal, Draft, GiveDraftToNeighbor)

- **Règle** (p. 5) : 5 cartes reçues, on en garde une, on passe le reste au voisin (gauche aux tours 1 et 3, droite aux tours 2 et 4), jusqu'à avoir 5 cartes. Dès le tour 2 on y ajoute la carte conservée au tour précédent. Pioche vide → la défausse est mélangée.
- **Vue** : ma zone.
- **Visible** : mon royaume et mes bâtiments (pour choisir en connaissance de cause) ; en bas, à gauche l'**éventail à drafter**, à droite **mes cartes gardées** (dont la carte conservée du tour précédent, qui est déjà dans ma main). Étiquette « Tes autres cartes vont à {Monarque} » avec une flèche vers son panneau, et le compte-tours qui montre le sens.
- **Actions** : « Garder » sur une carte de l'éventail (bouton sur la carte, `ItemMenuButton`). À 2 joueurs : « Garder » et « Défausser » (9 cartes, p. 8).
- **Attente** : entête « En attente des autres Monarques », l'éventail reste visible.

### Phase 2 : Déploiement (PlaceUnitOnBoard → RevealBoards → PayDeployedUnits → DeployEffects → ChooseWherePlacingAgeToken)

- **Règle** (p. 5) : poser des unités de sa main **face cachée** sur les emplacements libres ; on peut défausser des unités en jeu et réarranger ; révélation simultanée, paiement en or ; **conserver une seule** carte non jouée, défausser les autres ; effets de déploiement.
- **Vue** : ma zone.
- **Visible** : royaume avec emplacements libres mis en avant, 5ᵉ hachuré si verrouillé ; étiquette **« {or} or, {coût} prévus »** mise à jour à chaque pose (le coût n'est pas encore payé, p. 5) ; ma main ; zone « Défausser » ; rappel « Conserve 1 carte ».
- **Actions** : glisser une carte sur un emplacement ; glisser une unité en jeu vers un autre emplacement ou la défausse ; défausser des cartes de la main ; « Terminer » quand il reste 0 ou 1 carte en main.
- **Après** : bascule automatique en **vue Voisins** pendant Révélation / Paiement / Effets : les cartes se retournent, l'or part, les jetons Âge et points des effets arrivent. Choix « Sur quelle unité placer le jeton Âge » : bouton sur chaque unité éligible (`ItemMenuButton`) dans ma zone.

### Phase 3 : Guerres (War, automatique)

- **Règle** (p. 6) : force = Avant (+ à distance) ; contre chaque voisin, ≥ gagne 3 PL (égalité : les deux gagnent). À 2 joueurs : ≥ gagne 1 guerre, ≥ double gagne 2 (p. 8).
- **Vue** : Voisins, déjà ouverte.
- **Visible** : forces sous chaque royaume ; marqueurs de score qui avancent ; journal.
- **Actions** : aucune.

### Phase 4 : Revenu (Income, automatique)

- **Règle** (p. 6) : 2 or + effets de revenu.
- **Visible** : l'or arrive de la réserve vers ma pile ; journal. Vue inchangée.

### Phase 5 : Construction (Build)

- **Règle** (p. 7) : une seule action : construire un bâtiment (niveau 1 ou directement 2) **ou** en améliorer un. Coût du terrain : 2 or par bâtiment déjà possédé. Coût en ressources : produites par le royaume, jamais dépensées. Temple : coût alternatif en or. Niveau 2 → 5ᵉ emplacement.
- **Vue** : ma zone.
- **Visible** : étiquette **ressources produites + or** et **« Terrain : {n} or »** ; dans la grille, les bâtiments constructibles sont nets, les autres restent gris ; boutons **🔨 1** / **🔨 2** sur chaque bâtiment constructible (grisés sinon) ; bouton **niveau 2** sur un bâtiment niveau 1 améliorable.
- **Actions** : les boutons ci-dessus ; « Passer ».

### Phase 6 : Âge (SaveUnitsWithMysticEffect → AgeEffects → AgeUnitsDie → AgeUnitsAge)

- **Règle** (p. 8) : les unités qui ont déjà un jeton Âge meurent (défaussées avec leurs jetons) ; les autres reçoivent un jeton ; effets d'âge.
- **Vue** : ma zone (les morts chez les autres se lisent au journal).
- **Visible** : animation : jetons retirés, cartes vers la défausse, nouveaux jetons posés. Choix « sauver une unité » (effet mystique) : bouton sur chaque unité éligible.
- **Fin de tour** : le compte-tours avance. **Fin de partie** (tour 4) : écran de score du framework (`ScoringDescription`) avec le détail : points en cours, points des bâtiments construits ; départage : or restant (p. 8).

## 3. Information cachée (règles codées)

- Pioche et défausse : identité cachée à tous.
- Mains à drafter et mains gardées : cachées aux autres.
- Unités posées face cachée : cachées aux autres jusqu'à la Révélation.

## 4. États de test (port 3100 uniquement)

Pour vérifier chaque phase sur un état réaliste, un script prépare des parties sur mon serveur (jamais sur le 3000) et sauvegarde l'état dans `localStorage`, comme décrit par le skill : `scratchpad/state.mjs` joue des coups aléatoires jusqu'à la phase voulue, `shot.mjs` recharge cet état pour la capture. États prévus : Recrutement tour 2 (carte conservée), Déploiement avec unités en jeu, Construction avec ressources, Âge avec jetons, fin de partie ; à 7 joueurs puis à 2.

## 5. Points ouverts

1. **Extension.** Le code ne contient que le jeu de base : 5 bâtiments, 42 unités (90 cartes), pas d'artefacts, pas de mode solo. Le livret ne prévoit 6 et 7 joueurs qu'avec *Au-delà des portes* (p. 2). Tu m'as dit que l'extension est là : où ? Si elle reste à faire, la grille de bâtiments passera à 7 emplacements (4 de base + 3 tirés au sort, p. 9) le moment venu ; la spec ci-dessus reste valable.
2. **Piste de score.** Elle n'est pas affichée aujourd'hui (`ScoreBoard` absent de `Material.tsx`) et prendrait beaucoup de place. Proposition : le score vit dans les panneaux et l'écran de fin ; le compte-tours dessiné reprend la fonction du compte-tours imprimé sur la piste.
3. **Unité impayable.** Le livret dit « défaussée si tu ne peux pas payer » (p. 5) ; le code empêche de poser au-delà de son or. On garde le code (plus simple à jouer), l'étiquette d'or prévu rend la contrainte lisible.
