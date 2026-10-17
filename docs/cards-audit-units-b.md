# Audit des unités (2/2) : Manticore → Adventurer (enum 22 à 42)

Cartes imprimées (édition anglaise, `app/src/images/units/en/*.jpg`) comparées à
`rules/src/material/UnitCaracteristics.ts`, au nombre d'exemplaires de `theRealDeck` (`Unit.ts`) et aux règles qui
appliquent les effets (`rules/src/rules/**`).

Notation : « PL » = points de Légende (parchemin), « jeton Âge » = jeton lune. Phases : 2 déploiement, 3 guerre,
4 revenu, 5 construction, 6 âge. Une icône « carte retournée » signale un effet joué seulement à la révélation
(`onDeployment: true`).

Les exemplaires (losanges en haut à droite) correspondent à `theRealDeck` pour les 21 unités de ce lot.

---

### Manticore (enum 22)
**Carte :** coût 2, force 2*, 3 exemplaires. Phase 3 : +2 de force pour chaque viande de votre royaume.
**Code :** cost 2, power 2, `AddWarPower { powerAdded: 2, perResource: [Food] }`. Appliqué dans `War.getUnitPower`
(ResourcesHelper compte bâtiments + unités). 3 exemplaires.
**Verdict :** Conforme.

### Giant Snake (enum 23)
**Carte :** coût 1, force 4*, 1 exemplaire. Phase 3 : force 0 au lieu de 4 s'il y a au moins un jeton Âge sur le
Serpent géant. Phase 4 : 3 or s'il y a au moins un jeton Âge sur le Serpent géant.
**Code :** cost 1, power 4, `IncomeIfAgeToken { amount: 3 }` (appliqué dans `Income.getEffectIncomes`),
`ChangeWarPower { alternativePower: 0, ifAgeToken }` (appliqué dans `War.getUnitPower`). 1 exemplaire.
**Verdict :** Conforme.

### Grand Architect (enum 24)
**Carte :** coût 1, force 1, 1 exemplaire. Phase 5 : vous pouvez payer 1 or au lieu d'un bois, d'une viande ou d'un
cristal, autant de fois que vous voulez.
**Code :** cost 1, power 1, `ReplaceResourceByGold { resource: [Wood, Food, Diamond] }`. Utilisé par
`BuildWithSubstitution.canBuildWithSubstitution` via `BuildHelper.getReplaceResourceByGoldEffects` (bois, viande et
cristal gérés). 1 exemplaire.
**Verdict :** Conforme.

### Colossus (enum 25)
**Carte :** coût 2, force 1*, 1 exemplaire. Phase 3 : force 7 au lieu de 1 s'il y a au moins un jeton Âge sur le
Colosse. Phase 3 : 1 PL pour chaque guerre gagnée.
**Code :** cost 2, power 1, `ChangeWarPower { alternativePower: 7, ifAgeToken }`, `GainTokenIfWinWar { ScoreToken,
amount: 1 }`. `War.onRuleStart` applique le gain une fois par guerre gagnée (une seule fois à 2 joueurs, règle p.8).
1 exemplaire.
**Verdict :** Conforme.

### Cerberus (enum 26)
**Carte :** coût 0, force 2*, 3 exemplaires. Phase 3 : force 3 au lieu de 2 si votre royaume produit au moins une
viande.
**Code :** cost 0, power 2, `ChangeWarPower { alternativePower: 3, ifResource: [Food] }`, appliqué dans
`War.getUnitPower`. 3 exemplaires.
**Verdict :** Conforme.

### Farmer (enum 27)
**Carte :** coût 0, force 1, 3 exemplaires. Produit 1 viande. Pas d'effet.
**Code :** cost 0, power 1, resources [Food]. 3 exemplaires.
**Verdict :** Conforme.

### Kraken (enum 28)
**Carte :** coût 6, force 9, 1 exemplaire. Phase 2 (à la révélation) : **−3 PL** pour chaque bâtiment de niveau 2 de
votre royaume. Phase 2 (à la révélation) : +1 jeton Âge sur chacune de vos autres unités. Phase 6 : 1 PL pour chaque
jeton Âge sur vos unités quand elles meurent.
**Code :** cost 6, power 9 ;
- `GainTokenOnDeploy { ScoreToken, amount: 3, onDeployment, perLevel2Builds }` → `DeployEffects` ajoute
  `amount × nb bâtiments niveau 2` au score, donc **+3** par bâtiment ;
- `GainAgeToken { amount: 1, onDeployment, whichUnit: Others }` → `DeployEffects.onGainAgeToken` (OK) ;
- `GainTokenIfDying { amount: 1, ScoreToken, whoDies: All, perAgeToken }` → `AgeEffects` (somme des jetons des
  unités mourantes, OK).

1 exemplaire.
**Verdict :** Écart : le signe du premier effet est inversé (le Kraken fait gagner 3 PL par bâtiment de niveau 2 au
lieu d'en faire perdre 3). Proposition : `amount: -3` dans le descripteur (`ScoreHelper.gainOrLoseScore` accepte un
négatif, comme pour le Démon). Détail mineur : `onRuleStart` utilise `buildLevel2Buildings.length` et
`afterItemMove` `.getQuantity()` ; équivalent tant que les bâtiments ont une quantité de 1, à uniformiser.

### Demon (enum 29)
**Carte :** coût 2, force 7, 1 exemplaire. Phase 2 (à la révélation) : +1 jeton Âge sur le Démon. Phase 6 : −3 PL si
le Démon meurt avec **un seul** jeton Âge.
**Code :** cost 2, power 7, `GainAgeToken { amount: 1, onDeployment, whichUnit: Myself }` (OK) ;
`GainTokenIfDying { amount: -3, ScoreToken, whoDies: Myself, ifAgeToken }`. Dans `AgeEffects`, `ifAgeToken` est
testé par `howManyAgeTokenOnIndex(index)` truthy, c'est-à-dire « au moins un jeton ».
**Verdict :** Écart : la pénalité s'applique quel que soit le nombre de jetons, alors que la carte la limite à
exactement un jeton. Le Démon sauvé par le Guérisseur mystique, ou ayant reçu un jeton du Kraken / Nécromancien /
Maître du temps, meurt avec 2 jetons ou plus et ne devrait rien perdre. Proposition : remplacer `ifAgeToken` par une
condition explicite (ex. `ifExactAgeTokens: 1` sur `GainTokenIfDying`) et tester
`howManyAgeTokenOnIndex(index) === 1` dans `AgeEffects`.

### Forest Child (enum 30)
**Carte :** coût 1, force 1, 3 exemplaires. Produit 1 bois + 1 viande.
**Code :** cost 1, power 1, resources [Wood, Food]. 3 exemplaires.
**Verdict :** Conforme.

### Ogre (enum 31)
**Carte :** coût 2, force 2*, 1 exemplaire. Phase 3 : +1 de force pour chaque or gagné pendant la phase 4 (revenu)
du tour en cours.
**Code :** cost 2, power 2, `AddWarPower { powerAdded: 1, perGoldOnIncomePhase }`. `War.getUnitPower` ajoute
`Income.getPlayerIncome(player)`, qui ne compte que les effets de revenu (unités + bâtiments) ; les 2 or de base
versés à chaque joueur (`Income.onRuleStart` : `2 + getPlayerIncome`) ne sont pas comptés. 1 exemplaire.
**Verdict :** Écart probable : à la lettre, l'Ogre compte tout l'or gagné pendant la phase de revenu, donc aussi les
2 or de base (règle : « Revenu : 2 or + effets de revenu »). Le code donne 2 de force de moins. Proposition : extraire
la constante du revenu de base (2) et utiliser `2 + getPlayerIncome(player)` pour l'Ogre. À confirmer avec la FAQ /
le livret si une précision existe (le PDF `rules-fr.pdf` est une image, non vérifiable par texte).

### Hunter (enum 32)
**Carte :** coût 0, force 2, 2 exemplaires. Produit 1 viande si le Chasseur est à l'Avant.
**Code :** cost 0, power 2, resources [Food] avec `condition.onLane: FrontLane (0)` ; `ResourcesHelper` teste
`location.y === 0`. 2 exemplaires.
**Verdict :** Conforme.

### Blacksmith (enum 33)
**Carte :** coût 0, force 1, 3 exemplaires. Phase 4 : 1 or.
**Code :** cost 0, power 1, `Income { amount: 1 }`. 3 exemplaires.
**Verdict :** Conforme.

### Relic of Wisdom (enum 34)
**Carte :** coût 2, force 0, 1 exemplaire. Phase 6 : la Relique ne meurt jamais. 2 PL pour chaque jeton Âge sur la
Relique en fin de partie.
**Code :** cost 2, power 0, `SpecialDyingCondition { dyingFromAmount: 0 }` (`AgeHelper.isUnitDying` renvoie false →
elle reçoit un jeton à chaque âge via `AgeUnitsAge`), `RelicEffect { amount: 2 }` (`EndScoreHelper.relicsPoints`,
appelé par `EndGame`). 1 exemplaire.
**Verdict :** Conforme.

### Wood Merchant (enum 35)
**Carte :** coût 0, force 1, 2 exemplaires. Phase 5 : vous pouvez payer 1 or au lieu d'un bois, autant de fois que
vous voulez.
**Code :** cost 0, power 1, `ReplaceResourceByGold { resource: [Wood] }` (`BuildWithSubstitution`). 2 exemplaires.
**Verdict :** Conforme.

### Strategist (enum 36)
**Carte :** coût 3, force 1*, 1 exemplaire. Phase 3 : +1 de force pour chaque jeton Âge de votre royaume. Phase 3 :
la Stratège peut combattre depuis l'Arrière.
**Code :** cost 3, power 1, `WarFromBacklane` (`War.computePower`), `AddWarPower { powerAdded: 1, perAgeToken:
InRealm }` (`War.getAgeInPlayerRealm` : quantité des jetons Âge `OnCard` du joueur ; tous les `createItem` d'Âge
renseignent `player`). 1 exemplaire.
**Verdict :** Conforme.

### Palm Reader (enum 37)
**Carte :** coût 2, force 1, 2 exemplaires. Phase 6 : 1 PL pour chaque jeton Âge sur vos unités quand elles meurent.
**Code :** cost 2, power 1, `GainTokenIfDying { amount: 1, ScoreToken, whoDies: All }` **sans** `perAgeToken`. Or
`AgeEffects` ne traite `WhichUnit.All` que si `effect.perAgeToken` est vrai (sinon branche vide). 2 exemplaires.
**Verdict :** Écart : l'effet est déclaré mais **jamais appliqué** — la Chiromancienne ne rapporte aucun point.
Proposition : ajouter `perAgeToken: true` au descripteur (même texte et même descripteur que le 3e effet du Kraken).

### Archer (enum 38)
**Carte :** coût 1, force 2, 2 exemplaires. Phase 3 : l'Archère peut combattre depuis l'Arrière.
**Code :** cost 1, power 2, `WarFromBacklane` (`War.computePower`). 2 exemplaires.
**Verdict :** Conforme.

### Golem (enum 39)
**Carte :** coût 2, force 3, 2 exemplaires. Phase 2 (à la révélation) : améliorez gratuitement tous vos bâtiments de
niveau 1 au niveau 2.
**Code :** cost 2, power 3, `ImproveBuilding { onDeployment, whichBuilding: All }` → `DeployEffects.onImproveBuilding`
retourne tous les `builtLevel1Buildings` (`rotation: true`), sans coût. 2 exemplaires.
**Verdict :** Conforme. (Remarque : si le Golem et le Kraken sont révélés au même tour, l'ordre des effets détermine
si les bâtiments améliorés par le Golem comptent pour la pénalité du Kraken ; non tranché par la carte.)

### Salamander (enum 40)
**Carte :** coût 2, force 4*, 1 exemplaire. Phase 3 : +1 de force pour chaque jeton Âge sur la Salamandre. Phase 6 :
la Salamandre ne meurt qu'avec 2 jetons Âge ou plus.
**Code :** cost 2, power 4, `AddWarPower { powerAdded: 1, perAgeToken: OnUnit }` (`War.getAgeOnUnit`, quantité),
`SpecialDyingCondition { dyingFromAmount: 2 }` (`AgeHelper.isUnitDying`). 1 exemplaire.
**Verdict :** Conforme.

### Monkey (enum 41)
**Carte :** coût −1, force 1, 2 exemplaires. Phase 6 : gagnez 1 or pour chaque jeton Âge sur le Singe quand il meurt.
**Code :** cost −1, power 1, `GainTokenIfDying { amount: 1, Gold, whoDies: Myself, perAgeToken }` (`AgeEffects`).
Le coût négatif est géré : `PlaceUnitOnBoard` l'ajoute au budget, `PayDeployedUnits.removeMoney(négatif)` devient un
`addMoney`. 2 exemplaires.
**Verdict :** Conforme.

### Adventurer (enum 42)
**Carte :** coût 0, force 2, 2 exemplaires. Produit 1 cristal pour chaque jeton Âge sur l'Aventurière.
**Code :** cost 0, power 2, resources [Diamond] avec `condition.perAgeToken`. `ResourcesHelper.getAgeOnUnit`
renvoie `this.material(Age)...parent(index).length`, soit le **nombre d'items** jeton Âge, pas leur quantité.
2 exemplaires.
**Verdict :** Écart (implémentation) : le descripteur est juste mais le comptage est faux dès qu'un item porte une
quantité > 1. `ChooseWherePlacingAgeToken` crée un seul item de quantité 2 (Maître du temps, Maître alchimiste), et
les `createItem` d'Âge identiques fusionnent (MaterialMutator `canMerge`). Une Aventurière avec 2 jetons ne produit
alors qu'un cristal. Proposition : `getQuantity()` au lieu de `.length` dans `ResourcesHelper.getAgeOnUnit` (le test
`> 0` du Léviathan reste juste avec l'un ou l'autre). À noter aussi : `AgeUnitsAge` crée les jetons avec `id: 1`, les
autres sites sans `id`, ce qui empêche la fusion entre eux ; à uniformiser.

---

## Synthèse des écarts

| Unité (enum) | Type | Écart | Proposition |
|---|---|---|---|
| Kraken (28) | Valeur | `GainTokenOnDeploy.amount: 3` → +3 PL par bâtiment niveau 2 au lieu de −3 | `amount: -3` |
| Demon (29) | Condition | −3 PL appliqué dès 1 jeton ou plus ; la carte dit « un seul jeton » | condition « exactement 1 jeton » (`=== 1`) dans `AgeEffects` |
| Palm Reader (37) | Effet jamais appliqué | `whoDies: All` sans `perAgeToken` → branche vide dans `AgeEffects`, 0 PL | ajouter `perAgeToken: true` |
| Adventurer (42) | Implémentation | `ResourcesHelper.getAgeOnUnit` compte les items (`.length`) au lieu des jetons | `.getQuantity()` |
| Ogre (31) | Interprétation (probable) | ne compte pas les 2 or de base de la phase de revenu | `2 + getPlayerIncome`, à confirmer |
| Kraken (28) | Mineur | `.length` vs `.getQuantity()` pour les bâtiments niveau 2 selon le chemin | uniformiser |

Conformes (16) : Manticore, Giant Snake, Grand Architect, Colossus, Cerberus, Farmer, Forest Child, Hunter,
Blacksmith, Relic of Wisdom, Wood Merchant, Strategist, Archer, Golem, Salamander, Monkey.
Coûts, forces, ressources et nombres d'exemplaires : tous conformes.
