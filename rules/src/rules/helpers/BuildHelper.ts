import { MaterialGame, MaterialItem, MaterialRulesPart } from '@gamepark/rules-api'
import { minBy } from 'es-toolkit/compat'
import { Building } from '../../material/Building'
import { buildingCardCaracteristics } from '../../material/BuildingCaracteristics'
import { AddWarPower, isAddWarPower, isScoreAtWar, isWarType, ScoreAtWar, WarEffect } from '../../material/effects/3_WarEffects'
import { IncomeEffect, isIncomeType } from '../../material/effects/4_IncomeEffects'
import { Card } from '../../material/Artifact'
import { cardEffects } from '../../material/CardCaracteristics'
import {
  BuildEffect,
  isBuildEffect,
  isIgnoreFieldCost,
  isIgnoreLevel2Cost,
  isReplaceResourceByGold,
  isReplaceResourceByResource,
  ReplaceResourceByGold
} from '../../material/effects/5_Build'
import { Effect } from '../../material/effects/Effect'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Resources } from '../../material/Resources'
import { BuildWithSubstitution } from '../5_Build/BuildWithSubstitution'
import { KingdomHelper } from './KingdomHelper'
import { ResourcesHelper } from './ResourcesHelper'

/** The construction action of the turn (rulebook p.7) */
export enum BuildAction {
  BuildLevel1 = 1,
  BuildLevel2,
  Upgrade
}

/** The printed cost retained to pay one level of a construction: its gold alternative, or ignored (the Back Room) */
export type LevelCost = { level: 1 | 2; cost: Resources[]; alternate?: boolean; ignored?: boolean }

/** A missing resource produced instead by another one the kingdom has beyond the cost (the Dryad) */
export type Substitution = { resource: Resources; by: Resources }

/** How a construction is paid (see BuildHelper.getPayment) */
export type ConstructionPayment = {
  /** The land: 2 gold for each building already built, none for an upgrade or when a card ignores it */
  field: number
  fieldIgnored: boolean
  levels: LevelCost[]
  /** The resources of the costs that the kingdom produces: they are not spent */
  produced: Resources[]
  substituted: Substitution[]
  /** The missing resources paid 1 gold each (the Grand Architect, the Wood Merchant) */
  replacedByGold: Resources[]
  /** The gold printed in the costs */
  printedGold: number
  total: number
}

/** A multiset difference: the items of a list, each item of the other one removed once */
const without = <T>(items: T[], removed: T[]): T[] => {
  const left = [...removed]
  return items.filter((item) => {
    const index = left.indexOf(item)
    if (index === -1) return true
    left.splice(index, 1)
    return false
  })
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
    return this.ignoresFieldCost ? 0 : this.getFieldCost(this.player)
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
    return this.getLevelOptions(buildingId, action).map((levels) => levels.flatMap((level) => level.cost))
  }

  /** The same ways, level by level: which printed cost pays each level */
  private getLevelOptions(buildingId: Building, action: BuildAction): LevelCost[][] {
    const { cost1, cost1Alternate, cost2, cost2Alternate } = buildingCardCaracteristics[buildingId]
    const level1: LevelCost[] = [{ level: 1, cost: cost1 }, ...(cost1Alternate ? [{ level: 1 as const, cost: cost1Alternate, alternate: true }] : [])]
    // The Back Room: the level 2 cost is ignored, to build directly at level 2 as to upgrade
    const level2: LevelCost[] = this.ignoresLevel2Cost
      ? [{ level: 2, cost: [], ignored: true }]
      : [{ level: 2, cost: cost2 }, ...(cost2Alternate ? [{ level: 2 as const, cost: cost2Alternate, alternate: true }] : [])]
    switch (action) {
      case BuildAction.BuildLevel1:
        return level1.map((first) => [first])
      case BuildAction.Upgrade:
        return level2.map((second) => [second])
      case BuildAction.BuildLevel2:
        return level1.flatMap((first) => level2.map((second) => [first, second]))
    }
  }

  /**
   * All the gold a construction costs, land included: the cheapest way to pay it among the costs of the card, a missing
   * resource being replaced by a gold when an effect allows it. Undefined if the kingdom cannot pay it.
   * Legality and payment both use it, so that a construction offered is always paid exactly.
   */
  getGoldToPay(buildingId: Building, action: BuildAction, fieldCost?: number): number | undefined {
    return this.getPayment(buildingId, action, fieldCost)?.total
  }

  /**
   * How a construction is paid, the way getGoldToPay counts it: the land, the printed cost retained for each level, the
   * resources the kingdom produces for it, the ones another resource or a gold replaces. What the players are shown is
   * what they pay. Undefined if the kingdom cannot pay it.
   */
  getPayment(buildingId: Building, action: BuildAction, fieldCost = action === BuildAction.Upgrade ? 0 : this.fieldCost): ConstructionPayment | undefined {
    const replaceable = new Set(this.replaceResourceByGoldEffects.flatMap((effect) => effect.resource))
    const field = action === BuildAction.Upgrade ? 0 : fieldCost
    const fieldIgnored = action !== BuildAction.Upgrade && this.ignoresFieldCost
    const payments = this.getLevelOptions(buildingId, action).flatMap((levels): ConstructionPayment[] => {
      const cost = levels.flatMap((level) => level.cost)
      const missing = this.buildWithSubstitution.getMissingResourcesForBuilding(this.myResources, cost)
      const { remaining, substituted } = this.coverWithOtherResources(cost, missing)
      if (remaining.some((resource) => !replaceable.has(resource))) return []
      const printedGold = this.getGoldInBuildingCost(cost)
      return [{ field, fieldIgnored, levels, produced: without(cost.filter((r) => r !== Resources.Gold), missing), substituted, replacedByGold: remaining, printedGold, total: field + printedGold + remaining.length }]
    })
    const payment = minBy(payments, (payment) => payment.total)
    return payment && payment.total <= this.gold ? payment : undefined
  }

  /**
   * The missing resources that the resources produced beyond the cost can pay instead (the Dryad: wood instead of food or
   * crystal, as many times as wished). What remains missing is returned, with what was replaced.
   */
  private coverWithOtherResources(cost: Resources[], missing: Resources[]): { remaining: Resources[]; substituted: Substitution[] } {
    const substitutions = this.buildEffects.filter(isReplaceResourceByResource)
    let remaining = missing
    const substituted: Substitution[] = []
    for (const { by, resource } of substitutions) {
      let spare = this.myResources.filter((r) => r === by).length - cost.filter((r) => r === by).length
      remaining = remaining.filter((r) => {
        if (spare <= 0 || !resource.includes(r)) return true
        spare--
        substituted.push({ resource: r, by })
        return false
      })
    }
    return { remaining, substituted }
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

  /** The construction effects of the kingdom: the cards in play and the buildings built */
  get buildEffects(): BuildEffect[] {
    const cards = new KingdomHelper(this.game, this.player).cards.getItems<Card>().flatMap((card) => cardEffects(card.id))
    return [...cards, ...this.buildingEffects].filter(isBuildEffect)
  }

  /** The cards in play and the buildings built that have a construction effect, to name what changes a price */
  getBuildEffectSources(predicate: (effect: BuildEffect) => boolean): { cards: Card[]; buildings: Building[] } {
    const has = (effects: Effect[] = []) => effects.filter(isBuildEffect).some(predicate)
    const cards = new KingdomHelper(this.game, this.player).cards.getItems<Card>().filter((card) => has(cardEffects(card.id))).map((card) => card.id)
    const buildings = this.getPlayerBuildingsDone(this.player)
      .getItems<Building>()
      .filter((item) => {
        const { effect1, effect2 } = buildingCardCaracteristics[item.id]
        return has(effect1) || (item.location.rotation === true && has(effect2))
      })
      .map((item) => item.id)
    return { cards, buildings }
  }

  get ignoresLevel2Cost(): boolean {
    return this.buildEffects.some(isIgnoreLevel2Cost)
  }

  get ignoresFieldCost(): boolean {
    return this.buildEffects.some(isIgnoreFieldCost)
  }

  get replaceResourceByGoldEffects(): ReplaceResourceByGold[] {
    return this.buildEffects.filter(isReplaceResourceByGold)
  }

  getFieldCost(playerId: number) {
    return this.getPlayerBuildingQuantity(playerId) * 2
  }

  getPlayerBuildingQuantity(playerId: number) {
    return this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId).getQuantity()
  }
}
