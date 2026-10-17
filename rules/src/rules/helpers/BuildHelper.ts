import { MaterialGame, MaterialItem, MaterialRulesPart } from '@gamepark/rules-api'
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

/** The construction action of the turn (rulebook p.7) */
export enum BuildAction {
  BuildLevel1 = 1,
  BuildLevel2,
  Upgrade
}

export class BuildHelper extends MaterialRulesPart {
  private buildWithSubstitution: BuildWithSubstitution
  private _myResources: Resources[] | undefined = undefined
  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
    this.buildWithSubstitution = new BuildWithSubstitution(this.game, this.player)
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
    // A built building shows its level 2 face when rotated
    return building.location.rotation ? 2 : 1
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
    return this.getGoldToPay(buildingId, BuildAction.BuildLevel1, fieldCost) !== undefined
  }

  canBuildLevel2(buildingId: Building, fieldCost: number): boolean {
    return this.getGoldToPay(buildingId, BuildAction.BuildLevel2, fieldCost) !== undefined
  }

  canUpgrade(buildingId: Building): boolean {
    return this.getGoldToPay(buildingId, BuildAction.Upgrade, 0) !== undefined
  }

  /**
   * The ways a construction can be paid (rulebook p.7): the level 1 cost (or its gold alternative), the level 2 cost (or its
   * alternative), both added up for a building put directly at level 2. The resources are not spent: they only have to
   * be produced by the kingdom.
   */
  getCostOptions(buildingId: Building, action: BuildAction): Resources[][] {
    const { cost1, cost1Alternate, cost2, cost2Alternate } = buildingCardCaracteristics[buildingId]
    const level1 = cost1Alternate ? [cost1, cost1Alternate] : [cost1]
    const level2 = cost2Alternate ? [cost2, cost2Alternate] : [cost2]
    switch (action) {
      case BuildAction.BuildLevel1:
        return level1
      case BuildAction.Upgrade:
        return level2
      case BuildAction.BuildLevel2:
        return level1.flatMap((first) => level2.map((second) => [...first, ...second]))
    }
  }

  /**
   * All the gold a construction costs, land included: the cheapest way to pay it among the costs of the card, a missing
   * resource being replaced by a gold when an effect allows it. Undefined if the kingdom cannot pay it.
   * Legality and payment both use it, so that a construction offered is always paid exactly.
   */
  getGoldToPay(buildingId: Building, action: BuildAction, fieldCost = action === BuildAction.Upgrade ? 0 : this.fieldCost): number | undefined {
    const replaceable = new Set(this.getReplaceResourceByGoldEffects(this.player).flatMap((effect) => effect.resource))
    const totals = this.getCostOptions(buildingId, action).flatMap((cost) => {
      const missing = this.buildWithSubstitution.getMissingResourcesForBuilding(this.myResources, cost)
      if (missing.some((resource) => !replaceable.has(resource))) return []
      return [fieldCost + this.getGoldInBuildingCost(cost) + missing.length]
    })
    const total = totals.length ? Math.min(...totals) : undefined
    return total !== undefined && total <= this.gold ? total : undefined
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
