# Audit du matériel — cartes imprimées vs code

Les images des cartes (édition anglaise, `app/src/images/`) comparées aux descripteurs de `rules/src/material`.

## Bâtiments (5, deux faces)

Lecture des 10 faces, comparées à `BuildingCaracteristics.ts`. Coût niveau 1 / niveau 2 (en plus du niveau 1 si
construit directement en niveau 2), ressources produites, effets, points de Légende.

| Bâtiment | Carte | Code | Verdict |
|----------|-------|------|---------|
| Mine | N1 : coût bois, produit cristal. N2 : coût bois + cristal ; guerre : 2 PL par cristal du royaume. Points 1 / 3. | Identique. | Conforme |
| Taverne | N1 : coût viande ; revenu : 1 or par viande. N2 : coût bois + viande ; guerre : 1 PL par viande. Points 1 / 3. | Identique. | Conforme |
| Caserne | N1 : coût bois ; guerre : +1 force par bois. N2 : coût bois + viande ; guerre : 1 PL par unité de force 3 ou plus. Points 1 / 3. | Identique. | Conforme |
| Ville | N1 : coût bois, produit bois + viande. N2 : coût bois + bois, produit en plus un cristal. Points 1 / 3. | Identique (ressources N1 conservées au N2). | Conforme |
| Temple | N1 : coût cristal ou 2 or ; revenu : 2 or. N2 : coût 2 cristaux ou 3 or ; guerre : 2 PL. Points 1 / 3. | Identique (coûts alternatifs en or). | Conforme |

Au niveau 2, la carte garde le cartouche du niveau 1 (grisé, toujours actif) : le code ajoute bien `effect1` et
`resources1` aux bâtiments de niveau 2.

## Unités (42)

Détail carte par carte : `cards-audit-units-a.md` (Commander → LandLord) et `cards-audit-units-b.md` (Manticore →
Adventurer). Coûts, forces et ressources conformes pour les 42 unités ; les écarts portent sur les effets et un nombre
d'exemplaires. Chaque écart a été revérifié sur l'image de la carte. Tests : `cards.test.ts`, et un test par effet imprimé dans `units-a.test.ts` / `units-b.test.ts` (valeurs tirées des cartes).

### Corrigé

| Unité | Carte | Code avant | Correction |
|-------|-------|------------|------------|
| Peddler | 3 exemplaires | 2 dans `theRealDeck` | 3 exemplaires |
| Shapeshifter | Piocher et défausser jusqu'à révéler une unité de coût 3 ou moins | Condition inversée : rejetait le coût 0, gardait tout coût ≥ 1 (Kraken compris) | Rejette les unités de coût > 3 |
| Landlord | Ignorez le coût du terrain | Aucun effet déclaré (le moteur savait le gérer) | Effet `IgnoreFieldCost` |
| Master Alchemist | 1 jeton Âge par viande | 2 par viande | 1 par viande |
| Kraken | −3 PL par bâtiment niveau 2, à la révélation | +3 PL | −3 PL |
| Demon | −3 PL s'il meurt avec un seul jeton Âge | Dès un jeton ou plus | Exactement un jeton (`ifSingleAgeToken`) |
| Palm Reader | 1 PL par jeton Âge sur vos unités qui meurent | Effet jamais appliqué (`perAgeToken` manquant) | `perAgeToken` |
| Adventurer | Ressource par jeton Âge | Comptait les piles de jetons, pas les jetons (2 jetons posés en une pile → 1 ressource) | Compte la quantité |
| Ogre | +1 force par or gagné à la phase de revenu | Sans les 2 or de base de la phase | Les 2 or de base comptés |
| Commander, Rogue, Colossus, Master Alchemist (2 joueurs) | « par Guerre gagnée » ; livret p. 8 : au moins le double = 2 Guerres | Effets appliqués une seule fois à 2 joueurs | Appliqués pour chaque Guerre gagnée |
| Shapeshifter (pioche rejetée) | Tout se résout en phase 2 | Après une carte rejetée, la Guerre démarrait avant le jeton Âge de l'unité gardée | Le tour du joueur se termine une fois l'unité gardée |
| Mystical Healer (vieillissement) | Livret p. 8 : un jeton Âge sur chaque unité encore en jeu | L'unité sauvée ne vieillissait pas (sauvable à l'infini) | Toute unité encore en jeu vieillit |
| Mystical Healer | (règle de l'Âge) | Après un sauvetage, l'étape « effets d'Âge » était sautée : les effets « quand elle meurt » perdus pour tous | Enchaîne sur les effets d'Âge |

Conséquence : un malus peut faire passer un score sous 0. Le score est borné à 0 (la piste commence à 0).

### Tranché par les cartes (appliqué)

- **Mystical Healer** : « vous pouvez » sauver une unité → un coup « Ne sauver personne ».
- **Master Alchemist** : pas d'icône « une seule fois » → son effet s'applique à chaque déploiement (et aucun choix
  n'est demandé sans viande).
- **Veteran, Cave Spirit** : « déployé ce tour » compare l'exemplaire de carte, plus son nom.

### Bugs de règles trouvés en jouant

- **Blocage du draft** : le sauvetage mystique terminait le tour de joueurs pour qui la règle n'avait pas démarré ; ces
  « fin de tour » tombaient dans le draft suivant (pioches sautées, mains inégales, partie bloquée). Corrigé : seuls les
  joueurs actifs.
- **Paiement des constructions** : terrain et coûts retirés en plusieurs fois sur la même bourse (plantage), et un
  bâtiment construit directement au niveau 2 payait chaque niveau séparément au lieu de leur somme. Corrigé : un seul
  calcul, le moins cher payable, utilisé pour la légalité comme pour le paiement.

- **Ville niveau 2** : son cristal n’était jamais produit (le niveau lu comme `rotation as number` valait `true`, jamais 2). Trouvé par les tests des bâtiments, corrigé.

### Reste ouvert

- **Golem + Kraken** révélés le même tour : l'ordre décide si les bâtiments améliorés par le Golem comptent pour le
  malus du Kraken ; la carte ne tranche pas. Le code calcule le Kraken avant les améliorations du Golem.
