import { MaterialGame, MaterialItem, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { Building } from '../../material/Building'
import { buildingCardCaracteristics } from '../../material/BuildingCaracteristics'
import { AddWarPower, isAddWarPower, isScoreAtWar, isWarType, ScoreAtWar, WarEffect } from '../../material/effects/3_WarEffects'
import { IncomeEffect, isIncomeType } from '../../material/effects/4_IncomeEffects'
import { BuildEffect, isBuildEffect, isIgnoreFieldCost, isReplaceResourceByGold, ReplaceResourceByGold } from '../../material/effects/5_Build'
import { Effect } from '../../material/effects/Effect'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Resources } from '../../material/Resources'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { War } from '../3_War/War'
import { Income } from '../4_Income/Income'
import { BuildWithSubstitution } from '../5_Build/BuildWithSubstitution'
import { ResourcesHelper } from './ResourcesHelper'

export class BuildHelper extends MaterialRulesPart {
  private buildWithSubstitution: BuildWithSubstitution = new BuildWithSubstitution(this.game, this.player)
  private _myResources: Resources[] | undefined = undefined
  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
  }

  get myResources() {
    this._myResources ??= this.resources
    return this._myResources
  }

  get resources() {
    const resourcesHelper = new ResourcesHelper(this.game, this.player)
    return resourcesHelper.resources
  }

  get gold() {
    return this.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(this.player).money(golds).count
  }

  getLevel(building: MaterialItem): number {
    return building.location.rotation as number
  }

  get builtBuildings() {
    return this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(this.player)
  }

  get builtLevel1Buildings() {
    return this.builtBuildings.rotation((r) => !r)
  }

  get buildLevel2Buildings() {
    return this.builtBuildings.rotation(true)
  }

  get availableBuildings() {
    return this.material(MaterialType.Building).location(LocationType.PlayerBuildingHand).player(this.player)
  }

  getGoldInBuildingCost(cost: Resources[]): number {
    return cost.filter((res) => res === Resources.Gold).length
  }

  hasAlternateCost(buildingId: Building, level: number): boolean {
    const characteristics = buildingCardCaracteristics[buildingId]
    return level === 1 ? characteristics.cost1Alternate !== undefined : characteristics.cost2Alternate !== undefined
  }

  get buildableLevel1Buildings() {
    const fieldCost = this.fieldCost
    return this.availableBuildings.filter((item: MaterialItem) => this.canBuildLevel1(item.id as Building, fieldCost))
  }

  get buildableLevel2Buildings() {
    const fieldCost = this.fieldCost
    return this.availableBuildings.filter((item: MaterialItem) => this.canBuildLevel2(item.id as Building, fieldCost))
  }

  get upgradableBuildings() {
    return this.builtLevel1Buildings.filter((item: MaterialItem) => this.canUpgrade(item.id as Building))
  }

  get fieldCost() {
    return this.hasIgnoreFieldCostEffect(this.player) ? 0 : this.getFieldCost(this.player)
  }

  canBuildLevel1(buildingId: Building, fieldCost: number): boolean {
    const characteristics = buildingCardCaracteristics[buildingId]
    const cost1 = characteristics.cost1
    const cost1Alternate = characteristics.cost1Alternate ?? []
    return this.canPay(buildingId, cost1, cost1Alternate, fieldCost)
  }

  canBuildLevel2(buildingId: Building, fieldCost: number): boolean {
    const cost1 = buildingCardCaracteristics[buildingId].cost1
    const cost1Alternate = buildingCardCaracteristics[buildingId].cost1Alternate ?? []
    const cost2 = buildingCardCaracteristics[buildingId].cost2
    const cost2Alternate = buildingCardCaracteristics[buildingId].cost2Alternate ?? []

    const canPayDirectly =
      this.canPay(buildingId, cost1, cost2, fieldCost) ||
      (this.hasAlternateCost(buildingId, 1) && this.canPay(buildingId, cost1Alternate, cost2, fieldCost)) ||
      (this.hasAlternateCost(buildingId, 2) && this.canPay(buildingId, cost1, cost2Alternate, fieldCost)) ||
      (this.hasAlternateCost(buildingId, 1) && this.hasAlternateCost(buildingId, 2) && this.canPay(buildingId, cost1Alternate, cost2Alternate, fieldCost))

    const canPayWithSubstitution =
      this.buildWithSubstitution.canBuildWithSubstitution(this.myResources, [...cost1, ...cost2], fieldCost) ||
      (this.hasAlternateCost(buildingId, 1) &&
        this.buildWithSubstitution.canBuildWithSubstitution(this.myResources, [...cost1Alternate, ...cost2], fieldCost)) ||
      (this.hasAlternateCost(buildingId, 2) && this.buildWithSubstitution.canBuildWithSubstitution(this.myResources, [...cost1, ...cost2Alternate], fieldCost))

    return canPayDirectly || canPayWithSubstitution
  }

  canPay(buildingId: Building, cost: Resources[], alternateCost: Resources[], fieldCost: number): boolean {
    const buildWithSubstitution = new BuildWithSubstitution(this.game, this.player)
    return (
      this.canBuildCost(cost, fieldCost) ||
      (this.hasAlternateCost(buildingId, 1) && this.canBuildCost(alternateCost, fieldCost)) ||
      buildWithSubstitution.canBuildWithSubstitution(this.myResources, cost, fieldCost)
    )
  }

  canUpgrade(buildingId: Building): boolean {
    const characteristics = buildingCardCaracteristics[buildingId]
    const cost2 = characteristics.cost2
    const cost2Alternate = characteristics.cost2Alternate ?? []
    return this.canBuildCost(cost2, 0) || (this.hasAlternateCost(buildingId, 2) && this.canBuildCost(cost2Alternate, 0))
  }

  /**
   * Retourne les moves de dépense de gold lors de la construction d'une étape de bâtiment
   * Attention, cette fonction peut renvoyer des résultats étranges si le bâtiment ne peut être construit.
   * @see canBuildCost() pour vérifier si une étape est constructible.
   * @param buildingId - Le bâtiment joué,
   * @param level - L'étape du bâtiment que l'on considère,
   * @returns - Un tableau contenant le move dépensant l'or.
   */
  getGoldToPayCostMove(buildingId: Building, level: number, ignoreFieldCost?: boolean): MaterialMove[] {
    const moves: MaterialMove[] = []
    const fieldCost = ignoreFieldCost ? 0 : this.fieldCost
    const buildWithSubstitution = new BuildWithSubstitution(this.game, this.player)
    const cost1: Resources[] = buildingCardCaracteristics[buildingId].cost1
    const cost1Alternate = buildingCardCaracteristics[buildingId].cost1Alternate ?? []
    const cost2: Resources[] = buildingCardCaracteristics[buildingId].cost2
    const cost2Alternate = buildingCardCaracteristics[buildingId].cost2Alternate ?? []

    const cost: Resources[] = level === 1 ? cost1 : cost2
    const costAlternate = level === 1 ? cost1Alternate : cost2Alternate
    let goldToPay = 0
    const playerResources = this.resources
    if (!costAlternate.length) {
      // Cas nominal
      if (!this.canBuildCost(cost, fieldCost)) {
        // Substitution
        goldToPay = buildWithSubstitution.getMissingResourcesForBuilding(playerResources, cost).length
      }
      goldToPay += this.getGoldInBuildingCost(cost)
    } else {
      // Cas du temple
      if (this.canBuildCost(cost, fieldCost)) {
        goldToPay = this.getGoldInBuildingCost(cost)
      } else {
        // On préfèrera toujours payer le coût en substitution plutôt que le coût alternatif.
        if (buildWithSubstitution.canBuildWithSubstitution(playerResources, cost, fieldCost)) {
          goldToPay = buildWithSubstitution.getMissingResourcesForBuilding(playerResources, cost).length
        } else {
          goldToPay = this.getGoldInBuildingCost(costAlternate)
        }
      }
    }

    // const goldToPay = this.canBuildCost(playerId,cost, fieldCost) ? this.getGoldInBuildingCost(cost) : this.getGoldInBuildingCost(costAlternate)

    if (goldToPay) {
      moves.push(...this.material(MaterialType.Gold).money(golds).removeMoney(goldToPay, { type: LocationType.PlayerGoldStock, player: this.player }))
    }
    return moves
  }
  /**
   * Retourne un booléen indiquant si le bâtiment peut être construit ou non.
   * @param playerId - L'Id du joueur
   * @param cost - le coût du bâtiment
   * @param fieldCost - Le coût du terrain
   * @returns Un booléen indiquand si le bâtiment peut être construit
   */
  canBuildCost(cost: Resources[], fieldCost: number): boolean {
    const goldCost = cost.filter((resource) => resource === Resources.Gold).length
    const woodCost = cost.filter((resource) => resource === Resources.Wood).length
    const FoodCost = cost.filter((resource) => resource === Resources.Food).length
    const DiamondCost = cost.filter((resource) => resource === Resources.Diamond).length

    const playerGold = this.gold
    const playerWood = this.myResources.filter((resources) => resources === Resources.Wood).length
    const playerFood = this.myResources.filter((resources) => resources === Resources.Food).length
    const playerDiamond = this.myResources.filter((resources) => resources === Resources.Diamond).length

    return playerGold >= goldCost + fieldCost && playerWood >= woodCost && playerFood >= FoodCost && playerDiamond >= DiamondCost
  }

  getPlayerBuildingsDone(playerId: number) {
    return this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId)
  }

  get buildingEffects(): Effect[] {
    const effectsToReturn: Effect[] = []
    this.getPlayerBuildingsDone(this.player)
      .getItems()
      .forEach((item) => {
        const id = item.id as Building
        const building = buildingCardCaracteristics[id]
        const effect1 = building.effect1
        const effect2 = building.effect2
        if (item.location.rotation) {
          if (effect2 !== undefined) effectsToReturn.push(...effect2)
        }

        if (effect1 !== undefined) effectsToReturn.push(...effect1)
      })
    return effectsToReturn
  }

  get incomeBuildingEffects(): IncomeEffect[] {
    return this.buildingEffects.filter(isIncomeType)
  }

  get warBuildingEffects(): WarEffect[] {
    return this.buildingEffects.filter(isWarType)
  }

  get addPowerBuildingEffects(): AddWarPower[] {
    return this.warBuildingEffects.filter(isAddWarPower)
  }

  get scoreAtWarBuildingEffects(): ScoreAtWar[] {
    return this.warBuildingEffects.filter(isScoreAtWar)
  }

  getPowerAddedFromBuilding(playerId: number, buildEffect: AddWarPower): number {
    let add = 0
    if (buildEffect.perAgeToken) {
      // No existing case, maybe for later
    } else if (buildEffect.perResource) {
      const resourcesHelper = new ResourcesHelper(this.game, playerId)
      buildEffect.perResource.forEach((resource) => {
        const resources = resourcesHelper.getResource(resource)
        add += resources * buildEffect.powerAdded
      })
    } else if (buildEffect.perGoldOnIncomePhase) {
      const incomeHelper = new Income(this.game)
      const income = incomeHelper.getPlayerIncome(playerId)
      add += income * buildEffect.powerAdded
    } else {
      add += buildEffect.powerAdded
    }

    return add
  }

  getScoreFromBuilding(playerId: number, buildEffect: ScoreAtWar): number {
    if (buildEffect.perResource) {
      return buildEffect.amount * this.myResources.filter((res) => res === buildEffect.perResource).length
    } else if (buildEffect.perUnitStrongerThan) {
      const warHelper = new War(this.game)
      const matchingUnitsQuantity = this.material(MaterialType.Unit)
        .location(LocationType.PlayerUnitBoard)
        .player(playerId)
        .filter((item, index) => warHelper.getUnitPower(item, index) >= buildEffect.perUnitStrongerThan!)
        .getQuantity()
      return buildEffect.amount * matchingUnitsQuantity
    } else {
      return buildEffect.amount
    }
  }

  getPlayerBuildEffect(playerId: number): BuildEffect[] {
    return this.material(MaterialType.Unit)
      .location(LocationType.PlayerUnitBoard)
      .player(playerId)
      .getItems<Unit>()
      .flatMap((item) => {
        const unit = unitCardCaracteristics[item.id]
        return unit.effect !== undefined ? unit.effect.filter(isBuildEffect) : []
      })
  }

  hasIgnoreFieldCostEffect(playerId: number): boolean {
    return this.getPlayerBuildEffect(playerId).find(isIgnoreFieldCost) !== undefined
  }

  getReplaceResourceByGoldEffects(playerId: number): ReplaceResourceByGold[] {
    return this.getPlayerBuildEffect(playerId).filter(isReplaceResourceByGold)
  }

  getFieldCost(playerId: number) {
    return this.getPlayerBuildingQuantity(playerId) * 2
  }

  getPlayerBuildingQuantity(playerId: number) {
    return this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId).getQuantity()
  }
}
