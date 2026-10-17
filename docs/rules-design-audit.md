# Audit de conception — code des règles (rules/src)

Audit en lecture seule. Les numéros de ligne viennent de HEAD (`18226d8`). Dans la copie de travail, `BuildHelper.ts` est décalé d'une ligne après la l.51 (correction de `getLevel` en cours). Référence : guide Game Park (`GamePark/CLAUDE.md`) et skill `game-park` (`references/rules.md`).

## Résumé

- Les effets sont décrits proprement en données (`Record<Unit, UnitPattern>`, `Record<Building, BuildingPattern>`, union `Effect`). En revanche, il n'y a **aucun point de résolution central** : chaque phase relit les descripteurs avec ses propres filtres `isXxx` et ses propres `if / switch`. Un type d'effet, ou un champ d'effet, qu'aucune phase ne lit est **ignoré sans bruit**. C'est la cause commune des effets « déclarés mais jamais appliqués » (Palm Reader, Landlord), et le même risque existe encore à plusieurs endroits (voir §1).
- Le même calcul est réécrit à plusieurs endroits : jetons Âge sur une unité (4 implémentations), unités du plateau (9), coût du déploiement (3, dont une dans le front), revenu de base « 2 » (2), « unité qui meurt » (2 implémentations qui divergent).
- **Bugs ou risques concrets trouvés** (détails plus bas) :
  1. Jetons Âge : plusieurs piles sur une même carte (`id: 1` dans `AgeUnitsAge`, sans id ailleurs), et `AgeUnitsDie` ne supprime que la première pile. Il reste des jetons **orphelins**.
  2. Shapeshifter défaussé sans retirer ses jetons Âge : encore des orphelins, comptés ensuite par le Strategist.
  3. Ressource niveau 2 de la Ville jamais produite (`getLevel` renvoie un booléen comparé à `2`). La correction est en cours dans la copie de travail.
  4. Les helpers de test jouent les conséquences **en largeur** (`push`), alors que le framework les joue **en profondeur** (`unshift`, `applyAutomaticMoves`). Un test signale un « GAP » Shapeshifter qui n'existe pas en production.
  5. Fuite d'information au draft : les cartes passent au voisin sans mélange, donc on peut suivre un index de carte jusqu'à une carte posée face cachée.
- Les règles simultanées sont maintenant saines, après la correction de `SaveUnitsWithMysticEffect`. Reste un point : `DeployEffects` est une `SimultaneousRule` utilisée comme règle automatique.
- Tests : 7 fichiers. Le travail par carte en cours (`units-a`, `units-b`, `buildings`) couvre bien les descripteurs. Il manque des invariants (jetons orphelins, conservation du matériel, cohérence vue client / serveur) et un test « chaque EffectType a un consommateur ».

---

## 1. Modélisation et résolution des effets

### 1.1 Modèle

- `material/effects/Effect.ts` : `enum EffectType` (23 valeurs) et `Effect` = union de 6 sous-unions par phase (`2_DeploymentEffects.ts` … `7_EndGameEffects.ts`). Les variantes sont des types nommés, ce qui respecte le §14 du guide.
- Les ressources produites suivent un **second modèle parallèle** : `UnitPattern.resources` avec `ResourcesCondition { onLane, perAgeToken, ifAgeToken }` (`UnitCaracteristics.ts` l.10-21), interprété seulement par `ResourcesHelper.getUnitResource` (l.59-81).
- Un même concept est typé de façon différente d'un effet à l'autre :
  - `perResource` vaut `Resources[]` dans `AddWarPower` et `GainTokenIfWinWar` (le commentaire l.20 de `3_WarEffects.ts` dit « Tableau injustifié »), mais `Resources` dans `ScoreAtWar` et `GainAgeTokenOnChosenUnit`.
  - `perAgeToken` vaut `AgeLocation` dans `AddWarPower`, mais `true` dans `GainTokenIfDying` et `ResourcesCondition`.
  - `ifResource` vaut `Resources[]` dans `ChangeWarPower`, mais `true` dans `CantWar`, où il n'est jamais lu.
  - `onDeployment` est obligatoire dans 4 types et optionnel dans `GainAgeTokenOnChosenUnit`.
- On est loin du moteur §3 du guide (pas de pile, pas de trigger, pas de resolver par type). Ce n'est pas forcément un problème : le jeu de base n'a que **deux effets à choix** (Time Master / Master Alchemist et Mystical Healer) et aucune chaîne d'effets. Le vrai problème est l'**absence de dispatch exhaustif**.

### 1.2 Tous les EffectType et leur résolution

| EffectType | Cartes | Résolu où | Constat |
|---|---|---|---|
| `Deploymennt` | aucune | aucun | Type mort, avec une faute de frappe (`2_DeploymentEffects.ts` l.7-10). Il n'est même pas dans l'union. |
| `Shapeshifter` | Shapeshifter | `DeployEffects.getUnitDeployEffectMoves` l.177 → `onShapeShifter` l.205, puis `afterItemMove` l.60-120 | Le traitement est coupé en deux ; voir §2 et §5 pour les jetons orphelins. La deuxième pioche, l.78, ne vérifie pas que la pioche est vide (alors que `onShapeShifter` le fait, l.207), d'où un risque de `dealOne` sur une pioche vide. |
| `GainTokenOnDeploy` | Kraken | `DeployEffects.onRuleStart` l.42-46 **et** `afterItemMove` l.97-101 (copie du même code) | La branche or est un stub vide (l.181-184). Les deux copies comptent différemment : `.length` en l.44, `.getQuantity()` en l.99. |
| `ImproveBuilding` | Golem | `DeployEffects.onImproveBuilding` l.194 | `WhichBuilding.Choice` renvoie `[]` (TODO l.201). |
| `GainAgeToken` | Necromancer, Veteran, Cave Spirit, Kraken, Demon | `DeployEffects.onGainAgeToken` l.222 | `WhichUnit.All` renvoie `[]` sans erreur (l.231-233). |
| `GainAgeTokenOnChosenUnit` | Time Master, Master Alchemist | `DeployEffects.getUnitsWithPlaceAgeToken` l.146 puis `ChooseWherePlacingAgeToken.onCustomMove` l.30 | Seule `getUnitDeployEffectMoves` ne le traite pas : elle le laisse passer sans rien faire. La quantité « par nourriture » est recalculée au moment du choix (l.41-44), pas au moment où l'on décide qu'il y a un choix (l.156). Si un jeton posé change la nourriture (Leviathan), les deux valeurs diffèrent. |
| `GainTokenIfWinWar` | Commander, Rogue, Master Alchemist, Colossus | `War.getGainScoreIfWinWarAmount` l.66 et `War.getGainGoldIfWinWarMoves` l.87 | Deux boucles presque identiques, l'une filtrée sur `ScoreToken`, l'autre sur `Gold`. |
| `ChangeWarPower` | Dragon, Giant Snake, Colossus, Cerberus | `War.getUnitPower` l.152 | `effects.find` (l.138) : un seul effet de ce type est lu par unité. |
| `AddWarPower` | Militiaman, Leviathan, Manticore, Ogre, Strategist, Salamander, **Caserne** | unités : `War.getUnitPower` l.166-180 ; bâtiments : `BuildHelper.getPowerAddedFromBuilding` l.204-223 | **Deux resolvers qui ne disent pas la même chose** (détails après le tableau). |
| `WarFromBacklane` | Strategist, Archer | `War.computePower` l.211 | OK. |
| `CantWar` | Leviathan | `War.getUnitPower` l.142-149 | Un `CantWar` sans condition n'est **pas appliqué** : seul le cas `ifAgeToken` met la force à 0. Le champ `ifResource` n'est jamais lu. |
| `ScoreAtWar` | Mine, Taverne, Caserne, Temple | `BuildHelper.getScoreFromBuilding` l.225, appelé seulement sur les **bâtiments** (`War` l.39) | Une unité qui porterait `ScoreAtWar` serait ignorée. `perUnitStrongerThan` compte aussi les unités de l'Arrière, qui ne combattent pas (l.230-233). C'est conforme à `cards-audit.md` (« unité de force 3 ou plus »), mais à confirmer avec le livret. |
| `Income`, `IncomePerResource`, `IncomeIfAgeToken` | Peddler, Blacksmith, Temple / Cook, Alchemist, Taverne / Giant Snake | `Income.getEffectIncomes`, un `switch` en l.61-80 | `getUnitIncome` fait `effect as IncomeEffect[]` sur **tous** les effets (l.37), qui retombent dans `default`. Pour un bâtiment, `IncomeIfAgeToken` chercherait l'unité en (0,0) (l.58). |
| `Build` | aucune | aucun | Type mort (`5_Build.ts` l.4-6). |
| `IgnoreFieldCost` | Landlord | `BuildHelper.hasIgnoreFieldCostEffect` l.252 | Le calcul est dupliqué dans `Build.getActivePlayerLegalMoves` l.21 (voir `BuildHelper.fieldCost` l.94). |
| `ReplaceResourceByGold` | Grand Architect, Wood Merchant | `BuildHelper.getGoldToPay` l.135 | Un second algorithme est resté : `BuildWithSubstitution.canBuildWithSubstitution`, du code mort. |
| `Age` | aucune | aucun | Valeur d'enum morte. |
| `GainTokenIfDying` | Sculptor, Kraken, Demon, Palm Reader, Monkey | `AgeEffects.onRuleStart` l.24-60 | La couverture des combinaisons dépend de la branche (détails après le tableau). |
| `MysticEffect` | Mystical Healer | `Build.playersWithMysticEffect` l.92, `SaveUnitsWithMysticEffect`, `AgeHelper.isUnitDying` l.44 | `getUnitToSave` (l.30) teste « exactement 1 jeton » sans passer par `isUnitDying` (voir §2). |
| `SpecialDyingCondition` | Relic of Wisdom, Salamander | `AgeHelper.isUnitDying` l.43-50 | `SaveUnitsWithMysticEffect` l'ignore. |
| `RelicEffect` | Relic of Wisdom | `EndScoreHelper.relicsPoints` l.36 | OK. |

Détail de `AddWarPower` :
- `perGoldOnIncomePhase` : côté unité, `(2 + revenu) × p` (l.178, corrigé pour l'Ogre) ; côté bâtiment, `revenu × p` (l.214-217), sans le 2.
- Bonus fixe sans condition : ignoré côté unité (`add` reste à 0), ajouté côté bâtiment (l.219).
- `perAgeToken` : géré côté unité, laissé vide côté bâtiment (« No existing case », l.206-207).

Détail de `GainTokenIfDying` :
- `WhichUnit.Others` n'est géré nulle part (l.46-48).
- `ifAgeToken` et `ifSingleAgeToken` ne sont lus que pour `Myself`.
- `perAgeToken` est lu pour `Myself` et `All`, mais ignoré pour `All` sans `perAgeToken` (l.51).

### 1.3 Pourquoi on retrouve les bugs « effet déclaré mais jamais appliqué »

- Chaque phase choisit ses effets par une liste de gardes `isXxxType` écrite à la main (`isDeploymentType` l.48, `isWarType` l.41, `isIncomeType` l.21, `isBuildEffect` l.19, `isAgeEffect` l.28), puis traite les types avec des `if / else if` sans `default` qui lève une erreur.
- Rien ne vérifie que chaque `EffectType` présent dans les descripteurs a un consommateur. Rien ne vérifie non plus que chaque **champ** d'un effet (`ifSingleAgeToken`, `perAgeToken`, `whichUnit`…) est lu dans la branche concernée.
- Endroits où le même risque est encore présent : `GainAgeToken.All`, `GainTokenIfDying.Others`, `GainTokenOnDeploy` en or, `ImproveBuilding.Choice`, `CantWar` sans condition, `ScoreAtWar` sur une unité, `AddWarPower` à bonus fixe sur une unité, `IncomeIfAgeToken` sur un bâtiment. Aucune carte de base ne les utilise. Le jour où l'on ajoute une carte (le commentaire « Djinn », l.201, parle d'une extension), elle sera ignorée sans erreur.
- Les effets sont lus avec `effects.find(isX)` (`War` l.137-139, `ChooseWherePlacingAgeToken` l.39) : on ne peut avoir qu'un seul effet de chaque type par carte, et rien ne le signale si une carte en a deux.

### 1.4 Couplage entre les règles et les helpers

- Les rules servent de bibliothèques de calcul :
  - `BuildHelper` importe et instancie `War` et `Income` (l.14-15, 215, 229).
  - `War` instancie `Income` (l.178).
  - Le front instancie `War` et `Income` (`Shield.tsx` l.16, `WarInfo.tsx` l.23, `PaperTalesPlayerPanel.tsx` l.42, `WarLog.tsx`, `IncomeLog.tsx`).
- Il y a des imports circulaires : `BuildHelper` ↔ `ResourcesHelper`, `BuildHelper` ↔ `War`, `BuildHelper` ↔ `Income`, `BuildHelper` ↔ `BuildWithSubstitution`. Ils fonctionnent parce que tout est résolu dans des méthodes, mais ils sont fragiles.
- La force, le revenu et les ressources sont des **calculs de lecture**. Leur place est un helper (§15 du guide, `MaterialProvider`), pas une `MaterialRulesPart` de phase.

## 2. Logique dupliquée et comptages incohérents

| Calcul | Copies | Risque |
|---|---|---|
| Jetons Âge sur une unité | `War.getAgeOnUnit(index)` l.188 ; `AgeHelper.howManyAgeTokenOnIndex` l.18 ; `ResourcesHelper.getAgeOnUnit(unit)` l.22, qui retrouve l'index par x/y ; `Income`, branche `IncomeIfAgeToken` l.68-73, qui retrouve l'index par x/y et compte avec `.length > 0`, c'est-à-dire des **piles** et non une quantité | Trois façons de retrouver l'index et deux façons de compter. C'est la famille du bug « piles au lieu de quantité ». |
| Jetons Âge dans le royaume | `War.getAgeInPlayerRealm` l.192 : `location(OnCard).player(p)` | Compte **tous** les jetons du joueur, y compris les orphelins (voir §5). |
| Unités du plateau d'un joueur | `DeployEffects.getPlayerUnits`, `War.getPlayerBoard`, `Income.getPlayerBoard`, `AgeHelper.units`, `ResourcesHelper.units`, `PlaceUnitOnBoard.getPlayerBoard`, plus une version inline dans `BuildHelper.getPlayerBuildEffect` l.242, `getScoreFromBuilding` l.230, `EndScoreHelper` l.38 et `AgeHelper.ageTokensOnDyingUnits` l.32 | Faible, mais 9 copies. |
| Effets d'une unité | `unitCardCaracteristics[item.id as Unit].effect ?? []` répété environ 15 fois | Pas de `getUnitEffects(item)`, et le cast `as Unit` se répète. |
| Coût des unités déployées | `PlaceUnitOnBoard` l.27-29, `PayDeployedUnits` l.15-19, front `DeployGold.tsx` l.26-28 | Trois copies : si le coût change (réduction, Monkey), il faut penser aux trois. |
| Or du joueur | `BuildHelper.gold` l.47 ; `PlaceUnitOnBoard` l.26 inline | Faible. |
| Bâtiments de niveau 2 | `BuildHelper.buildLevel2Buildings` l.63 ; `PlaceUnitOnBoard.hasLevel2Building` l.149 | Faible. Le nom `buildLevel2` ne suit pas la convention `builtLevel1`. |
| Coût du terrain | `BuildHelper.fieldCost` l.94 ; `Build.getActivePlayerLegalMoves` l.21, recalculé, puis le garde-fou `gold >= fieldCost` en l.28 est redondant avec `getGoldToPay` | Faible. |
| Revenu de base « 2 » | `Income` l.20 ; `War` l.178 | Constante magique en double. `BuildHelper` l.216 ne l'a pas : c'est l'incohérence de `AddWarPower` décrite au §1.2. |
| Comptage d'une ressource | `ResourcesHelper.getResource` ; `BuildWithSubstitution.getMissingResourcesForBuilding` l.13-31, un compteur par ressource écrit à la main ; `BuildHelper.canBuildCost` l.152, mort ; `getScoreFromBuilding` l.227 | Faible. |
| « Déployé ce tour » | `Memory.PlayedCardsDuringDeployment`, lue avec ou sans `?? []` selon l'endroit (`DeployEffects` l.31 et l.148 sans, l.87 et l.169 avec), **et** la `rotation` (face cachée) jusqu'à `RevealBoards` | Deux sources de vérité ; un `remind` sans `?? []` plante si la clé n'existe pas. |
| « L'unité meurt » | `AgeHelper.isUnitDying` l.41, qui gère Salamander et Relic ; `SaveUnitsWithMysticEffect.getUnitToSave` l.30, qui teste seulement `== 1 jeton` | Une Salamandre ou une Relique à 1 jeton, qui ne meurent pas, sont proposées au sauvetage. C'est une option dominée : le skill demande de ne jamais en proposer, et un sauvetage est gaspillé. |
| Voisin gauche ou droite | `GiveDraftToNeighbor.getNextPlayer` l.31 ; `War.getNeighbor` l.216 | Faible. |
| Unités vieillissantes | `AgeHelper.agingUnits` l.26 compare des **références** d'objets (`getItems().includes(item)`) | Fragile. Et comme `AgeUnitsDie` oublie `UnitSavedWithMystic` (l.22) **avant** `AgeUnitsAge`, une unité sauvée est recalculée « mourante » et ne reçoit pas de nouveau jeton. Ce comportement est implicite (il dépend de l'endroit du `forget`) et le livret doit trancher. |

## 3. Règles simultanées et fins de tour

| Règle | endPlayerTurn / transitions | Constat |
|---|---|---|
| `Deal` (PlayerTurnRule, `players[0]`) l.10-39 | `startPlayerTurn(Deal)` récursif l.29, `startSimultaneousRule(Draft)` l.31 | Aucun garde-fou : si pioche + défausse ne suffisent pas, `Deal` relance `Deal` à l'infini (le skill demande de lever une erreur). `getPlayerMoves() { return [] }` est mort, et `PlayerTurnRule` n'est pas justifié : une `MaterialRulesPart` lancée par `startRule` suffit. |
| `Draft` l.59-77 | `endPlayerTurn` dans **beforeItemMove** ; à 2 joueurs au 2ᵉ coup | Correct : joueur pris dans `move.location.player`, ou dans l'item à 2 joueurs. `afterItemMove` serait plus naturel. `onRuleStart` (l.12) suppose que chaque joueur a exactement une carte (`getQuantity() === players.length`). |
| `GiveDraftToNeighbor` | `startSimultaneousRule(Draft / PlaceUnitOnBoard)` | OK. Voir §6 pour l'absence de mélange. |
| `PlaceUnitOnBoard` | `endPlayerTurn` comme coup légal, via `new DiscardRemainingUnits(this.game)` l.70 | `DiscardRemainingUnits` est une `SimultaneousRule` **non enregistrée** dans `rules`, utilisée comme helper. Son `onRuleStart` est mort. |
| `DeployEffects` l.26-58 | `onRuleStart` appelle `endPlayerTurn(player)` pour **tous** les joueurs ; `getActivePlayerLegalMoves` renvoie `[]` | `SimultaneousRule` utilisée comme règle automatique. C'est sans danger aujourd'hui parce qu'elle est toujours lancée pour tous (`PayDeployedUnits` l.30). Si un jour on la lance pour un sous-ensemble, on refait le bug du draft bloqué à 7 joueurs. L'ordre est aussi en jeu : les conséquences d'`afterItemMove` (Shapeshifter) passent avant le `endPlayerTurn` suivant **grâce au parcours en profondeur du framework** ; les tests en largeur le montrent mal (voir §8). |
| `ChooseWherePlacingAgeToken` | `endPlayerTurn(data.player)` quand la file est vide | OK : lancée avec `playersPlacingAgeTokenUnits`. Le joueur est pris dans `move.data`, il faudrait plutôt utiliser le joueur du coup. |
| `Build` | `endPlayerTurn` légal (passer) et dans `afterItemMove` | OK. |
| `SaveUnitsWithMysticEffect` | `onRuleStart` filtré par `isTurnToPlay` (corrigé) ; `onCustomMove` | OK. `move.data as PlayerColor` (l.55), cast. |

Cause des bugs du type « fin de tour d'un joueur non démarré » : des `SimultaneousRule` utilisées comme règles automatiques, qui terminent elles-mêmes les tours d'une liste de joueurs **recalculée** (et non la liste des joueurs actifs). Le seul cas qui reste est `DeployEffects`.

## 4. Mutations d'or, de score et de jetons calculées sur le même état

- **Score** : `ScoreHelper.gainOrLoseScore` (l.22-30) émet une position **absolue** (`x: score + amount`) calculée sur l'état courant. Deux mouvements de score du même joueur dans une même liste de conséquences : le second écrase le premier. Aujourd'hui, chaque phase additionne d'abord puis émet un seul mouvement (War l.41, AgeEffects l.63, EndGame l.13, DeployEffects l.53), sauf **`DeployEffects`**, qui a deux sources : `onRuleStart` l.53 et `afterItemMove` l.107. En profondeur, le mouvement de l'`afterItemMove` (carte du Shapeshifter) passe d'abord, puis celui de `onRuleStart`, précalculé, le remplace. Le risque est latent : aucune carte de coût 3 ou moins n'a de `GainTokenOnDeploy` en points.
- **Or** : `MaterialMoney` garde ses `pendingMoves` **par instance** (`MaterialMoney.js` l.82, 96, 110). Chaque appel fait `this.material(Gold).money(golds)` : nouvelle instance, donc deux `removeMoney` dans le même lot prennent les mêmes pièces. C'était la cause du bug de construction, corrigé par un paiement unique (`Build.beforeItemMove` l.64-69).
  - Endroits qui restent : `War.getGainGoldIfWinWarMoves`, un `addMoney` par Rogue et par guerre (l.102-108, appelé jusqu'à 2 fois l.33-35). Sans danger aujourd'hui, car `addMoney` ne fait que créer des pièces qui fusionnent. Mais le schéma est le même : il suffit d'un effet de perte d'or (`addMoney` négatif devient `removeMoney`, l.73-74) pour reproduire le bug.
  - `PayDeployedUnits` l.21 et `AgeEffects` l.64 : un seul mouvement par joueur, OK. Le Monkey (coût −1) donne `removeMoney(-1)`, soit `addMoney(1)`, géré par le framework.
- **Jetons Âge** : voir §5. Des `createItem` sans `id` et avec `id: 1` sur la même carte ne fusionnent pas, et `deleteItem(quantité)` ne touche que la première pile.

## 5. Mémoire

| Clé | Type réel | Écrit | Lu | Oublié | Constat |
|---|---|---|---|---|---|
| `PlayedCardsDuringDeployment` (par joueur) | `number[]` d'index | `PlaceUnitOnBoard.onRuleStart` l.15, `DiscardRemainingUnits.onRuleStart` (mort), `PlaceUnitOnBoard.afterItemMove` l.116-118, `DeployEffects.afterItemMove` l.91-93 | `PlaceUnitOnBoard`, `PayDeployedUnits`, `DeployEffects` (4 endroits), front `DeployGold` | `War.onRuleStart` l.24 | (a) **Mutation sur place** du tableau rendu par `remind` (`push` puis `memorize` de la même référence). En l.87, `deployedUnitsIndexes` est un alias du tableau modifié en l.92 : le `includes(move.itemIndex)` de la l.98 ne marche que grâce à cet alias. (b) **Doublons** : déplacer une carte face cachée (coups l.50-62, `rotation: item.location.rotation`) ou l'échanger (l.103-105) la rajoute dans `afterItemMove`. C'est sans effet aujourd'hui, car `.index(array)` élimine les doublons, mais fragile. (c) L'index du Shapeshifter défaussé reste dans la liste. |
| `UnitSavedWithMystic` | `number[]` | `SaveUnitsWithMysticEffect` l.60, en place par `push` | `AgeHelper.isUnitDying`, donc AgeEffects, AgeUnitsDie, AgeUnitsAge et le front `AgeLog` | `AgeUnitsDie` l.22 | Le moment du `forget` change le résultat de `AgeUnitsAge` (voir §2). Le journal `AgeLog` (lancé sur `startRule(AgeUnitsDie)`) appelle `dyingUnits`, qui lit cette clé. Si `context.game` est l'état après le coup, la mémoire est déjà oubliée et une unité sauvée s'affiche comme morte. À vérifier. |
| `TwoPlayersDraftMoves` | `LocationType` réutilisé comme « ce que j'ai déjà fait » | `Draft.beforeItemMove` l.67 | `Draft` | `Draft.getMovesAfterPlayersDone` | Sémantique détournée. Un enum dédié (`Kept` / `Discarded`) serait plus clair. |
| `PlacingAgeTokenUnitsIndexes` | `number[]`, file | `DeployEffects.getMovesAfterPlayersDone` l.134 | `ChooseWherePlacingAgeToken` l.35, `remainsPlaceAgeToken` | `ChooseWhere….getMovesAfterPlayersDone` | `shift()` sur place dans le callback de `memorize` (l.69-72). |
| `Time` | `number` (1 à 4) | Setup, `NextTurn` | `GiveDraftToNeighbor`, `AgeUnitsAge` (`=== 4` en dur, l.29), front | jamais | OK. Le 4 mériterait une constante `LAST_TURN`. |

- **Typage** : il n'y a pas de `MemoryPayload` (§26 du guide). On trouve `remind<number[]>`, `remind<number[] \| undefined>`, `remind(…)` sans type (Draft l.29 et l.65), et un seul alias (`UnitSavedWithMysticType`). Le typage dépend de chaque appel.
- **Valeurs calculées sur du matériel caché** : aucune trouvée. La mémoire ne stocke que des index, et les calculs à partir des id se font après `RevealBoards`. Bon point.
- **Risque client** : `PlaceUnitOnBoard.getActivePlayerLegalMoves` lit `unitCardCaracteristics[item.id].cost` sur la main (l.31) et sur les cartes posées face cachée (l.28). Appelé côté client pour **un autre** joueur, avec des id masqués, cela plante (`undefined.cost`). Il faut vérifier si le framework calcule les coups légaux des autres joueurs (spectateur, undo). Un garde-fou ne coûte rien.

## 6. Information cachée

- Stratégies : `Deck` et `Discard` en `hideItemId` ; `PlayerDraftHand` et `PlayerUnitHand` en `hideItemIdToOthers` ; `PlayerUnitBoard` en `hideRotatedCardToOthers` (`PaperTalesRules.ts` l.74-82, 99-100). C'est cohérent avec le jeu.
- **Fuite au draft (moyenne)** : `GiveDraftToNeighbor.onRuleStart` l.16-24 passe la main au voisin par `moveItemsAtOnce` **sans transit ni mélange** (le schéma en 3 étapes du §2 du guide n'est pas appliqué). Le joueur qui passe connaît l'id de chaque index qu'il donne. Il voit ensuite quel index son voisin garde (déplacement vers `PlayerUnitHand`), à 2 joueurs lequel il défausse, puis lequel il pose **face cachée** (le déplacement vers `PlayerUnitBoard` et `Memory.PlayedCardsDuringDeployment` sont publics). À la table, on ne sait pas quelle carte le voisin a prise. Ici, on le sait exactement. Correction : mélanger la main reçue après le passage (`shuffle` échange les id entre index en gardant les emplacements, `MaterialMutator.js` l.317-320), et idéalement mélanger aussi la main d'unités après chaque choix.
- La reconstitution de la pioche (`Deal` l.28-29 : `shuffle` de la défausse puis `moveItems` vers la pioche) est correcte pour l'anti-triche, car le mélange échange les id. Mais elle fait N mouvements au lieu de `moveItemsAtOnce` suivi d'un `shuffle` de la pioche (schéma du skill).
- Journaux (`PaperTalesLogs.ts`) : seulement des débuts de règle (War, Income, AgeUnitsDie) et des scores de guerre, donc après la révélation. Pas de fuite.
- Jetons Âge orphelins (voir §4 et §7) : leur `parent` reste l'index d'une carte défaussée. Quand cette carte revient en jeu, même chez un autre joueur, les anciens jetons **réapparaissent dessus**, car `parent(index)` ne filtre ni le joueur ni l'emplacement.

## 7. Hygiène du code

- **Débogage** : `console.error` dans `Income.getIncomeUnits` l.44-47, dans une boucle de calcul, appelée aussi par le front ; `//console.log` dans `Build` l.51 ; `onRuleStart` vide dans `Build` l.14-16.
- **Commentaires TODO / FIXME** : `DeployEffects` l.201 (TODO Djinn), `AgeHelper` l.82-96 (code commenté et `FIXME: why age effects are return from all units ?`), `3_WarEffects` l.20, `BuildingCaracteristics` l.15 (« Sad »), `PaperTalesSetup` l.61 (`//this.startSimultaneousRule(RuleId.Build)`), `PlaceUnitOnBoard` l.33.
- **Code mort**, pour chaque symbole, seule la définition existe :
  - effets et types : `Deploymennt`, `EffectType.Build`, `EffectType.Age`, `isManualDeploymentEffect`, `EffectWithManualResolve`, `isSimpleIncomeType`, `isIncomeIfAgeTokenType`, `isIncomePerResourceType` ;
  - calculs : `BuildHelper.canBuildCost`, `hasAlternateCost`, `BuildWithSubstitution.canBuildWithSubstitution` (le reste de la classe se réduit à `getMissingResourcesForBuilding`), `War.getPlayerFrontLane`, `ResourcesHelper.units` dans son usage ;
  - matériel et règles : `testDeck`, `isChooseWherePlacingAgeTokenUnit`, `RuleId.ChooseUnpaidUnits` (seulement dans le header), la classe `DiscardRemainingUnits` comme règle, `Deal.getPlayerMoves`.
- **Casts dangereux ou faux** :
  - `ResourcesHelper` l.61 `const unitId: Building | undefined = unit.id` : mauvais enum pour une unité ;
  - `BuildHelper.getLevel` l.51-53 `rotation as number`, comparé à `2` dans `ResourcesHelper` l.49, alors que `rotation` est un booléen. **Conséquence : le cristal de la Ville niveau 2 n'était jamais produit.** C'est corrigé dans la copie de travail, avec un test dans `buildings.test.ts` ;
  - `Income` l.37 `effect as IncomeEffect[]` ;
  - `move.data as PlayerColor` et `as MysticEffectType` (SaveUnits l.55-57) ;
  - de nombreux `item.id as Unit` et `location.player!`.
- **Jetons Âge** : `AgeUnitsAge` l.21 crée `id: 1`, tous les autres créent sans id (`DeployEffects` l.112 et l.226, `ChooseWhere…` l.48). Les piles ne fusionnent pas (`findMergeIndex` compare id et emplacement), et `AgeUnitsDie` l.18 fait `parent(index).deleteItem(total)`, qui ne vise que la **première** pile (`MaterialBase.deleteItem` → `limit(1)`). Exemple : une Salamandre qui reçoit un jeton du Nécromancien (sans id) puis un jeton d'Âge (`id: 1`) meurt avec 2 jetons, et il reste un jeton orphelin. `PlaceUnitOnBoard` l.91-92, lui, fait bien `deleteItems()`.
- **Shapeshifter** : `DeployEffects.afterItemMove` l.110 défausse le Shapeshifter sans supprimer ses jetons Âge, alors qu'il peut en avoir reçu d'un Nécromancien ou d'un Kraken révélé au même tour (`onGainAgeToken` l.236-245 parcourt le plateau, Shapeshifter compris). Ces jetons sont comptés par le Strategist (`getAgeInPlayerRealm`) et reviennent avec la carte.
- **Coups légaux inutiles** : `PlaceUnitOnBoard` l.49-62 propose de déplacer chaque unité vers **sa propre case**. Le framework avertit : « item is moved to the location he already has ».
- **Noms** : `Caracteristics` (au lieu de `Characteristics`), `Deploymennt`, `LandLord` (la carte s'appelle Landlord), `buildLevel2Buildings` à côté de `builtLevel1Buildings`, `5_Build.ts` à côté de `4_IncomeEffects.ts`, commentaires mélangés FR et EN.

## 8. Tests

Existant dans `rules/src/__tests__` :
- `build.test.ts` : 3 tests sur le paiement de construction (`getGoldToPay`, paiement unique, impossibilité).
- `cards.test.ts` : 6 tests de descripteurs, plus le Healer (passer) et la régression du Healer sur le tour suivant.
- `rulebook.test.ts` : distribution (×3), fin de partie (×3), guerres à égalité (×2).
- `simulate.test.ts` : 10 parties aléatoires à 2, 4 et 7 joueurs. Seule invariante : « un joueur actif a toujours un coup ».
- Non suivis par git (travail en cours) : `buildings.test.ts`, `units-a.test.ts` et `units-b.test.ts`, environ un `describe` par carte.

Problèmes :
- **Ordre des conséquences** : tous les helpers (`playAll`, `playConsequences`, `play`, `runPhase`) font `queue.push(...)`, donc un parcours **en largeur**. Le framework fait `moves.unshift(...consequences)` (`utils/automatic-moves.util.js` l.15), donc un parcours **en profondeur**. Le commentaire « GAP » de `units-a.test.ts` (Shapeshifter, l.533-537) décrit un artefact du test : en production, la deuxième pioche et le jeton Âge sont joués avant le `endPlayerTurn` suivant. Le §7 du guide propage d'ailleurs le même helper en largeur. Correction : utiliser `applyAutomaticMoves(rules, moves)` exporté par `@gamepark/rules-api`.
- `units-b.test.ts` l.78-79 filtre les `RuleMove` pour rester dans la phase : cela masque justement les problèmes de transition.

Ce qui manque :
- Les invariants de simulation : aucun jeton Âge orphelin (`parent` sur une carte hors `PlayerUnitBoard`), une seule pile d'Âge par carte, matériel conservé (81 unités), score ≥ 0, `PlayedCardsDuringDeployment` sans doublon.
- La cohérence vue client / serveur (`getView` / `getMoveView` rejoués, comme dans `references/rules.md`), surtout pour le Shapeshifter (pioche cachée → plateau) et le draft.
- Un test de couverture « chaque `EffectType` utilisé dans un descripteur a un consommateur », et « aucun `EffectType` mort ».
- Les régressions sur les bugs relevés ici : piles d'Âge multiples à la mort, Shapeshifter avec jetons, Ville niveau 2 (déjà ajouté), Salamandre ou Relique proposées au Healer, `Deal` sans assez de cartes.
- Le draft : sens selon `Time`, garder puis défausser à 2 joueurs, passage de main.

---

## Propositions, par priorité

| # | Proposition | Effort | Risque |
|---|---|---|---|
| 1 | **Jetons Âge uniformes** : un `AgeTokenHelper` avec `add(parent, player, qty)`, toujours sans `id`, et `removeAll(parent)` = `parent(i).deleteItems()`. L'utiliser dans `AgeUnitsAge`, `AgeUnitsDie`, `DeployEffects`, `ChooseWhere…` et `PlaceUnitOnBoard`. Supprimer les jetons du Shapeshifter quand on le défausse. Tests de régression. | S | Faible. `rules/package.json` est en 0.0.0 (pas en production) : la compatibilité des parties sauvegardées n'est pas une contrainte. |
| 2 | **Helpers de test en profondeur** : remplacer les files `push` par `applyAutomaticMoves`, revoir le « GAP » Shapeshifter et le filtre de `units-b`. Mettre à jour le §7 / §19 du guide. | S | Nul (tests seulement), mais des tests peuvent changer de verdict. |
| 3 | **`SaveUnitsWithMysticEffect.getUnitToSave`** = `isUnitDying(unit) && jetons === 1`. **`CantWar` sans condition** : force 0. **`AddWarPower`** : un seul resolver partagé entre unités et bâtiments (bonus fixe, `perAgeToken`, `perGoldOnIncomePhase` avec `BASE_INCOME`). | S | Faible ; aucune carte de base ne change sauf Salamandre et Relique au Healer. |
| 4 | **Anti-triche au draft** : transit, puis `shuffle`, puis destination dans `GiveDraftToNeighbor` ; `shuffle` de la main reçue. | S à M | Moyen : animations du passage à revoir (version 0.0.0, pas de contrainte de rejeu). |
| 5 | **Extraire les calculs de lecture en helpers** (§15 du guide, `MaterialProvider`) : `StrengthHelper` (depuis `War.getUnitPower` / `getPlayerPower`), `IncomeHelper` (depuis `Income`, avec `BASE_INCOME`), `UnitBoardHelper` (`units`, `effectsOf(item)`, `ageOn(index)`, `ageInRealm`, `deployedThisTurn`), `DeployCostHelper` (utilisé par `PlaceUnitOnBoard`, `PayDeployedUnits` et `DeployGold`). Les rules et le front n'instancient plus `War` ni `Income`, et les imports circulaires disparaissent. | M | Faible à moyen : beaucoup de fichiers touchés, mais du code pur et testé par les tests par carte. |
| 6 | **Dispatch exhaustif léger**, à la place du moteur §3 complet : un `Record<EffectType, Phase \| null>` qui dit quelle phase consomme chaque type ; dans chaque phase, un `switch` exhaustif (`never`) qui lève une erreur sur un champ ou une variante non gérés (`WhichUnit.All`, `Others`, `Choice`, or au déploiement) ; plus le test de couverture. Supprimer les types morts. Uniformiser les champs (`perResource: Resources`, `perAgeToken: AgeLocation`, `ifResource: Resources`, `onDeployment?`). | M | Faible ; touche aux descripteurs, déjà bien couverts par les tests par carte. |
| 7 | **Moteur d'effets §3 complet** (pile, triggers, resolvers par type). | L | Élevé. Peu rentable pour le jeu de base (2 choix, aucune chaîne). À réserver à une extension (Djinn, Port à 2 effets) ; dans ce cas, partir de la proposition 6. |
| 8 | **Mémoire typée** (`MemoryPayload` et `typedMemory`, §26). Plus de mutation sur place (`memorize(key, list => [...list, i])`). `PlayedCardsDuringDeployment` sans doublon (ajout seulement quand la carte vient de la main). `TwoPlayersDraftMoves` avec un enum dédié. Constante `LAST_TURN`. | S | Faible (version 0.0.0). |
| 9 | **`DeployEffects`** : ne plus en faire une `SimultaneousRule` automatique (une `MaterialRulesPart` qui enchaîne sur `ChooseWherePlacingAgeToken` ou `War`), ou terminer seulement `players.filter(isTurnToPlay)`. Un seul mouvement de score par joueur, effets du Shapeshifter compris. Garde-fou pioche vide en l.78. | S à M | Moyen : il faut retester le Shapeshifter en profondeur. |
| 10 | **Ménage** : `console.error` dans `Income`, le code commenté (`AgeHelper`, `Build`, `Setup`), le code mort listé au §7, `DiscardRemainingUnits` (garder ses coups légaux dans `PlaceUnitOnBoard`), `RuleId.ChooseUnpaidUnits`, `Deal` en `MaterialRulesPart` avec une erreur si pioche + défausse ne suffisent pas, `Draft` qui termine le tour dans `afterItemMove`, plus de déplacement vers sa propre case, les casts faux (`Building` dans `ResourcesHelper`, `as IncomeEffect[]`), les noms (`Characteristics`, `Landlord`, `builtLevel2Buildings`). | S | Faible. Version 0.0.0 : on peut renuméroter les enums. |
| 11 | **Choix du jeton Âge** (Time Master / Alchemist) : proposer des `CreateItem` d'Âge comme coups légaux au lieu du `CustomMove` (§20 du guide, glisser-déposer natif). | M | Moyen : il faut adapter le front. |
| 12 | **Tests manquants** : invariants dans `simulate.test.ts` (orphelins, piles, conservation du matériel), cohérence vue client / serveur, draft, `Deal` sans assez de cartes. | M | Nul. |
