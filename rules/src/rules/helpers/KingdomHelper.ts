import { MaterialGame, MaterialItem, MaterialRulesPart } from '@gamepark/rules-api'
import { uniq } from 'es-toolkit/compat'
import { Condition, ConditionKind, Count, CountKind } from '../../material/effects/Effect'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Resources } from '../../material/Resources'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { War } from '../3_War/War'
import { BASE_INCOME, Income } from '../4_Income/Income'
import { AgeHelper } from './AgeHelper'
import { AgeTokens } from './AgeTokens'
import { BuildHelper } from './BuildHelper'
import { ResourcesHelper } from './ResourcesHelper'

const producedResources = [Resources.Wood, Resources.Food, Resources.Diamond]

/**
 * The kingdom of a Monarch (rulebook p.4): the units in play, the Legendary Artifacts in play, the buildings built. It
 * counts what the effects of the cards multiply their amount by, the same in every phase.
 */
export class KingdomHelper extends MaterialRulesPart {
  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
  }

  get units() {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(this.player)
  }

  get artifacts() {
    return this.material(MaterialType.Unit).location(LocationType.PlayerArtifacts).player(this.player)
  }

  /** The cards of the deck in play: the units, then the Legendary Artifacts */
  get cards() {
    return this.material(MaterialType.Unit)
      .location((location) => location.type === LocationType.PlayerUnitBoard || location.type === LocationType.PlayerArtifacts)
      .player(this.player)
  }

  /** How many times an effect applies. The source is the card that has the effect (none for a building) */
  count(count: Count, source?: number): number {
    switch (count.kind) {
      case CountKind.Resources: {
        const resources = new ResourcesHelper(this.game, this.player).resources
        return resources.filter((resource) => (count.resources ?? producedResources).includes(resource)).length
      }
      case CountKind.ResourceTypes:
        return uniq(new ResourcesHelper(this.game, this.player).resources.filter((resource) => producedResources.includes(resource))).length
      case CountKind.AgeTokensInKingdom:
        return this.material(MaterialType.Age).location(LocationType.OnCard).player(this.player).getQuantity()
      case CountKind.AgeTokensOnSelf:
        return source !== undefined ? new AgeTokens(this).count(source) : 0
      case CountKind.Artifacts:
        return this.artifacts.length
      case CountKind.UnitCosts:
        return uniq(this.visibleUnits.map((unit) => unitCardCaracteristics[unit.id].cost)).length
      case CountKind.UnitsWithPower: {
        const war = new War(this.game)
        return this.units.filter((unit, index) => unit.id !== undefined && war.getUnitPower(unit, index) >= count.min).length
      }
      case CountKind.UnitsWithCost:
        return this.visibleUnits.filter((unit) => unitCardCaracteristics[unit.id].cost >= count.min).length
      case CountKind.IncomeGold:
        return BASE_INCOME + new Income(this.game).getPlayerIncome(this.player)
      case CountKind.Level2Buildings:
        return new BuildHelper(this.game, this.player).buildLevel2Buildings.length
      case CountKind.DyingUnits:
        return new AgeHelper(this.game, this.player).dyingUnits.length
      case CountKind.OtherSurvivingUnits: {
        const ageHelper = new AgeHelper(this.game, this.player)
        return this.units.filter((unit, index) => index !== source && !ageHelper.isUnitDying(unit, index)).length
      }
    }
  }

  /** Whether the condition of an effect is met (no condition: always) */
  meets(condition: Condition | undefined, source?: number): boolean {
    if (!condition) return true
    switch (condition.kind) {
      case ConditionKind.UnitWithCost:
        return this.visibleUnits.some((unit) => unitCardCaracteristics[unit.id].cost >= condition.min)
      case ConditionKind.OnFrontLane:
        return source !== undefined && this.material(MaterialType.Unit).getItem(source).location.y === 0
    }
  }

  /** The units in play whose card is seen (a unit placed face down this turn is hidden to the other Monarchs) */
  private get visibleUnits(): MaterialItem<number, number, Unit>[] {
    return this.units.getItems<Unit>().filter((unit) => unit.id !== undefined)
  }
}
