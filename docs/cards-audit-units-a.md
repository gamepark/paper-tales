# Audit des cartes Unité — partie A (enum 1 à 21, Commander → LandLord)

Sources comparées :
- Images : `app/src/images/units/en/<Nom>.jpg` (édition anglaise). Nombre d'exemplaires lu sur l'icône en losanges empilés en haut à droite (vérifié sur un agrandissement des 21 icônes).
- Code : `rules/src/material/Unit.ts` (`theRealDeck`), `rules/src/material/UnitCaracteristics.ts`, `rules/src/material/effects/*.ts`, et les règles qui consomment chaque effet (`rules/src/rules/**`).

Légende des phases : 2 = Déploiement, 3 = Guerre, 4 = Revenus, 5 = Construction, 6 = Âge. « (révélation) » = icône de la carte qui se retourne : l'effet ne s'applique que le tour où la carte est révélée (`onDeployment: true` côté code).

---

### Commander (enum 1)
**Carte :** coût 2 or · force 4 · 2 exemplaires · aucune ressource. Phase 3 : « 1 PV pour chaque Guerre gagnée ».
**Code :** cost 2, power 4, 2 exemplaires. `GainTokenIfWinWar { token: ScoreToken, amount: 1 }`. Appliqué dans `War.getGainScoreIfWinWarAmount`, une fois par guerre gagnée (`War.onRuleStart`).
**Verdict :** Conforme.

### Militiaman (enum 2)
**Carte :** coût 0 · force 2* · 3 exemplaires · aucune ressource. Phase 3 : « +1 de force pour chaque jeton Âge sur Militiaman ».
**Code :** cost 0, power 2, 3 exemplaires. `AddWarPower { powerAdded: 1, perAgeToken: AgeLocation.OnUnit }`. Appliqué dans `War.getUnitPower` (`getAgeOnUnit`).
**Verdict :** Conforme.

### TimeMaster (enum 3)
**Carte :** coût 0 · force 1 · 3 exemplaires · aucune ressource. Phase 2 (révélation) : « 2 jetons Âge sur une de vos Unités ».
**Code :** cost 0, power 1, 3 exemplaires. `GainAgeTokenOnChosenUnit { amount: 2, onDeployment: true }`. Choix via `DeployEffects.getUnitsWithPlaceAgeToken` → `ChooseWherePlacingAgeToken` (custom move par unité du plateau, 2 jetons créés sur l'unité choisie).
**Verdict :** Conforme.

### Peddler (enum 4)
**Carte :** coût 1 · force 1 · **3 exemplaires** · produit 1 bois. Phase 4 : « gagnez 1 or ».
**Code :** cost 1, power 1, resources [Wood], `Income { amount: 1 }` (appliqué par `Income.getEffectIncomes`). **2 exemplaires** dans `theRealDeck`.
**Verdict :** Écart : nombre d'exemplaires. L'icône montre 3 losanges (vérifiée en agrandissement), le deck en contient 2. Proposition : ajouter un 3e `Unit.Peddler` dans `theRealDeck`. Attention : `theRealDeck` compte actuellement 80 cartes ; si le total officiel est 80, une autre carte (probablement dans les enums 22 à 42, hors de ce périmètre) a un exemplaire de trop. À croiser avec l'audit de la partie B avant de corriger.

### Rogue (enum 5)
**Carte :** coût 1 · force 3 · 2 exemplaires · aucune ressource. Phase 3 : « Gagnez 1 or pour chaque Guerre gagnée ».
**Code :** cost 1, power 3, 2 exemplaires. `GainTokenIfWinWar { token: Gold, amount: 1 }`. Appliqué dans `War.getGainGoldIfWinWarMoves`, une fois par guerre gagnée.
**Verdict :** Conforme.

### Sculptor (enum 6)
**Carte :** coût 0 · force 1 · 2 exemplaires · aucune ressource. Phase 6 : « 3 PV quand Sculptor meurt ».
**Code :** cost 0, power 1, 2 exemplaires. `GainTokenIfDying { amount: 3, tokenGain: ScoreToken, whoDies: Myself }`. Appliqué dans `AgeEffects.onRuleStart` si `AgeHelper.isUnitDying`.
**Verdict :** Conforme sur le descripteur. **Mais l'effet est sauté dès qu'un joueur possède un Mystical Healer** (voir le bug de transition à la section Mystical Healer) : `SaveUnitsWithMysticEffect.getMovesAfterPlayersDone` enchaîne directement sur `AgeUnitsDie` sans passer par `AgeEffects`.

### Treefolk (enum 7)
**Carte :** coût 1 · force 3 · 2 exemplaires · produit 1 nourriture. Aucun effet.
**Code :** cost 1, power 3, resources [Food], 2 exemplaires.
**Verdict :** Conforme.

### Necromancer (enum 8)
**Carte :** coût 1 · force 4 · 1 exemplaire · aucune ressource. Phase 2 (révélation) : « 1 jeton Âge sur chacune de vos autres Unités ».
**Code :** cost 1, power 4, 1 exemplaire. `GainAgeToken { amount: 1, onDeployment: true, whichUnit: Others }`. `DeployEffects.onGainAgeToken` : la branche `else` (Others) crée 1 jeton sur chaque unité du plateau du joueur sauf le Nécromancien.
**Verdict :** Conforme.

### Veteran (enum 9)
**Carte :** coût 0 · force 3 · 3 exemplaires · aucune ressource. Phase 2 (révélation) : « 1 jeton Âge sur Veteran ».
**Code :** cost 0, power 3, 3 exemplaires. `GainAgeToken { amount: 1, onDeployment: true, whichUnit: Myself }`, appliqué par `DeployEffects.onGainAgeToken`.
**Verdict :** Conforme sur le descripteur. Écart mineur d'implémentation : `getUnitDeployEffectMoves` teste « déployé ce tour » par **id** (`deployedUnits.id(unit.id)`) et non par index. Si un ancien Veteran a survécu (sauvé par un Mystical Healer) et qu'un nouveau Veteran est déployé, l'ancien reçoit aussi un jeton. Proposition : tester l'index (`deployedUnitsIndexes.includes(unitIndex)`), comme le fait déjà `getUnitsWithPlaceAgeToken`.

### Miner (enum 10)
**Carte :** coût 1 · force 2 · 3 exemplaires · produit 1 diamant (cristal violet). Aucun effet.
**Code :** cost 1, power 2, resources [Diamond], 3 exemplaires.
**Verdict :** Conforme.

### Woodcutter (enum 11)
**Carte :** coût 0 · force 2 · 3 exemplaires · produit 1 bois. Aucun effet.
**Code :** cost 0, power 2, resources [Wood], 3 exemplaires.
**Verdict :** Conforme.

### Dragon (enum 12)
**Carte :** coût 3 · force 0* · 1 exemplaire · aucune ressource. Phase 3 : « Force 7 au lieu de 0 si votre Royaume produit au moins 1 diamant ».
**Code :** cost 3, power 0, 1 exemplaire. `ChangeWarPower { alternativePower: 7, ifResource: [Diamond] }`. `War.getUnitPower` renvoie 7 si une ressource Diamond existe dans `ResourcesHelper.resources` (unités et bâtiments).
**Verdict :** Conforme.

### Knight (enum 13)
**Carte :** coût 1 · force 4 · 3 exemplaires · aucune ressource, aucun effet.
**Code :** cost 1, power 4, 3 exemplaires.
**Verdict :** Conforme.

### Leviathan (enum 14)
**Carte :** coût 3 · force 4* · 1 exemplaire.
- Phase 3 : « +2 de force pour chaque nourriture de votre Royaume ».
- Phase 3 : « S'il y a au moins 1 jeton Âge sur Leviathan, il ne peut pas combattre ».
- Ressources : 2 nourritures « s'il y a au moins 1 jeton Âge sur Leviathan ».
**Code :** cost 3, power 4, 1 exemplaire. resources [Food, Food] avec `condition: { ifAgeToken: true }` (géré par `ResourcesHelper.getUnitResource`). `AddWarPower { powerAdded: 2, perResource: [Food] }` et `CantWar { ifAgeToken: true }` : dans `War.getUnitPower`, `CantWar` est testé en premier et renvoie 0 si un jeton est présent, sinon force 4 + 2 × nourriture.
**Verdict :** Conforme.

### Shapeshifter (enum 15)
**Carte :** coût 0 · pas de bouclier de force (icône de tour à la place) · 1 exemplaire · aucune ressource. Phase 2 (révélation) : « Piochez et défaussez jusqu'à révéler une Unité de coût 3 ou moins. Déployez-la gratuitement à la place de Shapeshifter. 1 jeton Âge sur cette nouvelle Unité ».
**Code :** cost 0, power 0, 1 exemplaire. `Shapeshifter { onDeployment: true }`. `DeployEffects.onShapeShifter` pioche une carte du deck à la place du Shapeshifter ; `DeployEffects.afterItemMove` traite la carte piochée :
```ts
if (unitCardCaracteristics[unitId].cost < 1) {
  // défausse la carte et en pioche une autre
} else {
  // applique ses effets, défausse Shapeshifter, +1 jeton Âge
}
```
**Verdict :** Écart (bug) : la condition de rejet est fausse. Le code défausse les unités de coût 0 et garde toute unité de coût 1 ou plus, même de coût supérieur à 3 (Kraken coût 6 par exemple). La carte demande l'inverse : défausser si coût > 3, garder si coût ≤ 3. Proposition : remplacer `cost < 1` par `cost > 3`. Autres points :
- Si une carte gardée a un effet `GainTokenOnDeploy` avec `onDeployment` (cas de score au déploiement), le test utilise `deployedUnits`, calculé **avant** l'ajout du nouvel index dans `Memory.PlayedCardsDuringDeployment` : l'effet n'est pas appliqué. Sans conséquence une fois le seuil corrigé à 3 si aucune unité de coût ≤ 3 n'a cet effet (à vérifier dans la partie B).
- Deck vide : `onShapeShifter` renvoie `[]` et le Shapeshifter reste en jeu. Pas de remélange de la défausse. À arbitrer selon les règles.

### CaveSpirit (enum 16)
**Carte :** coût 1 · force 4 · 2 exemplaires · produit 1 diamant. Phase 2 (révélation) : « 1 jeton Âge sur Cave Spirit ».
**Code :** cost 1, power 4, resources [Diamond], 2 exemplaires. `GainAgeToken { amount: 1, onDeployment: true, whichUnit: Myself }`.
**Verdict :** Conforme. Même remarque mineure que pour Veteran : le test « déployé ce tour » se fait par id (cas d'un ancien Cave Spirit sauvé par Mystical Healer).

### Cook (enum 17)
**Carte :** coût 0 · force 1 · 2 exemplaires · aucune ressource. Phase 4 : « 1 or pour chaque nourriture de votre Royaume ».
**Code :** cost 0, power 1, 2 exemplaires. `IncomePerResource { resource: Food, amount: 1 }`, appliqué par `Income.getEffectIncomes`.
**Verdict :** Conforme.

### MysticalHealer (enum 18)
**Carte :** coût 0 · force 1 · 3 exemplaires · aucune ressource. Phase 6 : « Vous **pouvez** empêcher une de vos Unités portant un seul jeton Âge de mourir ».
**Code :** cost 0, power 1, 3 exemplaires. `MysticEffect`. `Build.getMovesAfterPlayersDone` lance `SaveUnitsWithMysticEffect` pour les joueurs concernés. Seules les unités à exactement 1 jeton sont proposées, avec autant de sauvetages que de Healers (`AgeHelper.mysticalEffectsCount`). `AgeHelper.isUnitDying` exclut les unités sauvées.
**Verdict :** Écart :
1. **Bug de transition (grave)** : `SaveUnitsWithMysticEffect.getMovesAfterPlayersDone` renvoie `startRule(RuleId.AgeUnitsDie)`, alors que le chemin normal est `Build → AgeEffects → AgeUnitsDie`. Dès qu'un joueur a un Mystical Healer en jeu, la phase `AgeEffects` est sautée **pour tous les joueurs** : Sculptor, Kraken, Demon et les autres effets « quand meurt » ne rapportent rien. Proposition : renvoyer `startRule(RuleId.AgeEffects)`. `AgeEffects` lit déjà `Memory.UnitSavedWithMystic` via `isUnitDying`, et la mémoire est effacée ensuite dans `AgeUnitsDie`.
2. **Effet optionnel rendu obligatoire** : `getActivePlayerLegalMoves` ne propose que des sauvetages, sans move « passer ». Le joueur doit sauver une unité s'il en a une éligible. Proposition : ajouter un custom move de passe (ou `endPlayerTurn`) dans les coups légaux.
3. Mineur : deux `console.log` restés dans `SaveUnitsWithMysticEffect` (`onRuleStart`, `onCustomMove`).

### MasterAlchemist (enum 19)
**Carte :** coût 2 · force 1 · 1 exemplaire · aucune ressource.
- Phase 2 : « 1 jeton Âge sur une seule Unité pour chaque nourriture de votre Royaume ». L'icône « révélation » n'apparaît pas devant ce texte, seulement l'icône de phase 2 ; l'image ne montre aucune autre indication à ce sujet.
- Phase 3 : « 1 PV pour chaque diamant de votre Royaume, pour chaque Guerre gagnée ».
- Phase 4 : « 1 or pour chaque bois de votre Royaume ».
**Code :** cost 2, power 1, 1 exemplaire.
- `GainAgeTokenOnChosenUnit { amount: 2, onDeployment: true, perResource: Food }` → `ChooseWherePlacingAgeToken` crée `amount × nourriture` jetons.
- `GainTokenIfWinWar { token: ScoreToken, perResource: [Diamond], amount: 1 }` → `War.getGainScoreIfWinWarAmount`, une fois par guerre gagnée.
- `IncomePerResource { resource: Wood, amount: 1 }` → `Income`.
**Verdict :** Écart :
1. **Montant des jetons Âge** : la carte donne 1 jeton par nourriture, le code `amount: 2` en donne 2. Proposition : `amount: 1`.
2. **`onDeployment: true` à confirmer** : la carte imprimée n'a pas l'icône « révélation » devant l'effet de phase 2. Si c'est volontaire, l'effet s'applique à chaque tour tant que l'Alchimiste est en jeu, ce qui oblige à mettre `onDeployment: false`. Image non ambiguë sur l'absence d'icône, mais à confirmer avec le livret de règles (par comparaison, Time Master, Necromancer, Veteran, Cave Spirit et Shapeshifter portent bien l'icône).
3. Cas 0 nourriture : le joueur doit quand même choisir une unité et un `createItem` de quantité 0 est émis. Proposition : ne pas ajouter l'Alchimiste à `PlacingAgeTokenUnitsIndexes` quand la quantité calculée vaut 0.
4. Phases 3 et 4 : conformes.

### ForestSpirit (enum 20)
**Carte :** coût 3 · force 3 · 1 exemplaire · produit 3 bois. Aucun effet.
**Code :** cost 3, power 3, resources [Wood, Wood, Wood], 1 exemplaire.
**Verdict :** Conforme.

### LandLord (enum 21)
**Carte (« Landlord ») :** coût 2 · force 1 · 1 exemplaire · produit 1 bois. Phase 5 : « Ignorez le coût du Terrain ».
**Code :** cost 2, power 1, resources [Wood], 1 exemplaire. **Aucun `effect`.**
**Verdict :** Écart : l'effet de construction est absent du descripteur. Le moteur sait déjà le gérer : `BuildHelper.hasIgnoreFieldCostEffect` lit les effets `IgnoreFieldCost` des unités en jeu, et `Build.ts` comme `BuildHelper` mettent alors le coût du terrain à 0. Mais aucune unité ne déclare `EffectType.IgnoreFieldCost`, donc ce code n'est jamais utilisé. Proposition : ajouter `effect: [{ type: EffectType.IgnoreFieldCost }]` à `Unit.LandLord`.

---

## Récapitulatif des écarts

| Unité (enum) | Type | Écart | Proposition |
|---|---|---|---|
| Peddler (4) | Exemplaires | Carte : 3 exemplaires, `theRealDeck` : 2 | Ajouter un Peddler, après vérification du total à 80 avec la partie B |
| Shapeshifter (15) | Bug d'effet | Rejette les unités de coût < 1 au lieu de > 3 | `cost < 1` → `cost > 3` dans `DeployEffects.afterItemMove` |
| Mystical Healer (18) | Bug de flux | `SaveUnitsWithMysticEffect` → `AgeUnitsDie` saute `AgeEffects` pour tous les joueurs (Sculptor et autres effets « quand meurt » perdus) | Transition vers `RuleId.AgeEffects` |
| Mystical Healer (18) | Règle | Sauvetage imposé alors que la carte dit « pouvez » | Ajouter un coup « passer » |
| Master Alchemist (19) | Montant | 2 jetons Âge par nourriture au lieu de 1 | `amount: 1` |
| Master Alchemist (19) | À confirmer | `onDeployment: true` alors que l'icône « révélation » est absente de la carte | Vérifier le livret ; sinon `onDeployment: false` |
| Master Alchemist (19) | Mineur | Choix imposé et `createItem` de quantité 0 sans nourriture | Ignorer l'Alchimiste quand la quantité vaut 0 |
| Landlord (21) | Effet manquant | « Ignorez le coût du Terrain » non déclaré (`IgnoreFieldCost` jamais alimenté) | `effect: [{ type: EffectType.IgnoreFieldCost }]` |
| Veteran (9), Cave Spirit (16) | Mineur | Test « déployé ce tour » par id : un ancien exemplaire sauvé reçoit aussi le jeton | Tester par index dans `getUnitDeployEffectMoves` |

Conformes : Commander, Militiaman, Time Master, Rogue, Sculptor (descripteur), Treefolk, Necromancer, Miner, Woodcutter, Dragon, Knight, Leviathan, Cook, Forest Spirit.
