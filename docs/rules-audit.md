# Audit des règles — livret vs implémentation

Jeu de base (livret FR, p. 3 à 8), comparé au code de `rules/src`. Tests : `rules/src/__tests__/rulebook.test.ts`.

## Corrigé

| # | Phase | Livret | Code avant | Correction |
|---|-------|--------|------------|------------|
| 1 | Recrutement (p. 5) | La défausse n'est remélangée **que si la pioche s'épuise** pendant la distribution. | À chaque distribution, toute la défausse repartait dans la pioche (la comparaison `moves.length !== missingCardsTotal` était toujours vraie). | `Deal` distribue ce que la pioche permet ; si elle s'épuise, défausse mélangée → pioche, puis la distribution reprend. 3 tests. |
| 2 | Fin du jeu (p. 8) | Chaque Monarque ajoute les **points de Légende de ses Bâtiments construits**. | Aucun point de bâtiment n'était compté (les descripteurs n'avaient pas de valeur de points). | `points1` / `points2` dans `BuildingCaracteristics` (1 et 3 pour les 5 bâtiments de base, lus sur les cartes) ; `EndGame` les ajoute. 2 tests. |
| 3 | Fin du jeu (p. 8) | Égalité : **l'or restant** départage. | Pas de départage. | `getTieBreaker` renvoie l'or. 1 test. |
| 4 | Guerres (p. 6, p. 8) | Force supérieure ou égale, sans minimum ; à 2 joueurs, au moins le double = 2 guerres. | À 2 joueurs, une force > 0 était exigée (pas à 3+). | Condition retirée : le livret prime. 0 contre 0 → les deux gagnent (2 guerres chacun à 2 joueurs). 2 tests. |
| 5 | Déploiement (p. 5) | Chaque effet « gagne des points au déploiement » s'applique. | `scoreToAdd = …` : avec plusieurs effets de points, seul le dernier comptait ; et dans le cas de la Métamorphe le score était poussé une fois par effet. | `+=`, et un seul mouvement de score après la boucle. |

## Conforme

- Mise en place : 3 or, 5 bâtiments, marqueur de score à 0, pion Temps au tour 1, pioche mélangée.
- Recrutement : 5 cartes (9 à 2), garder 1 et passer ; sens gauche aux tours 1 et 3, droite aux tours 2 et 4 ; à 2 joueurs, garder puis défausser. La carte conservée au tour précédent reste en main.
- Déploiement : pose face cachée, défausse / réorganisation des unités déjà en jeu, révélation simultanée, paiement des nouvelles unités seulement, une seule carte conservée. 5ᵉ emplacement à l'Avant avec un bâtiment niveau 2.
- Guerres : force de l'Avant (+ unités qui combattent de l'Arrière), ≥ gagne, 3 PL par guerre, égalité = les deux gagnent ; 2 joueurs : ≥ une guerre, ≥ double deux guerres.
- Revenu : 2 or + effets de revenu.
- Construction : une seule action ; terrain 2 or par bâtiment possédé ; ressources jamais dépensées ; niveau 2 direct = coûts niveau 1 + niveau 2 ; amélioration = coût niveau 2 seul ; coût alternatif en or du Temple.
- Âge : les unités portant un jeton meurent (avec leurs jetons), les autres en reçoivent un ; effet mystique pour en sauver.

## Écart conservé (sans effet sur la partie)

| # | Livret | Code | Proposition |
|---|--------|------|-------------|
| A | Déploiement : une nouvelle unité dont on ne peut pas payer le coût est **défaussée à la révélation**. | Le code **empêche de poser** une unité qu'on ne peut pas payer (filtre sur l'or). Résultat identique en pratique, mais on ne peut pas « tenter » une pose. | Gardé : le résultat est le même que de défausser la carte soi-même en fin de déploiement, sans risque de la perdre par erreur. |

## Hors règles (qualité)

- `console.log` / `console.error` de débogage dans `SaveUnitsWithMysticEffect` et `Income`.
- Les noms d'unités n'ont pas de traduction (`card.{id}`) : l'aide et le journal affichent le nom anglais.
- `app/public/rules-fr.pdf` (4,7 Mo) pas encore optimisé pour le web (pas d'outil installé ici).
