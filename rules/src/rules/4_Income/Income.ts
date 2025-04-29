import { MaterialItem, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import sumBy from 'lodash/sumBy'
import { IncomeEffect, isIncomeType } from '../../material/effects/4_IncomeEffects'
import { Effect, EffectType } from '../../material/effects/Effect'
import { goldMoney } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { BuildHelper } from '../helpers/BuildHelper'
import { ResourcesHelper } from '../helpers/ResourcesHelper'
import { RuleId } from '../RuleId'

export class Income extends MaterialRulesPart {

  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players
    players.forEach(player => {
      moves.push(...goldMoney.createOrDelete(this.material(MaterialType.Gold), { type: LocationType.PlayerGoldStock, player }, this.getPlayerIncome(player)))
    })
    moves.push(this.startSimultaneousRule(RuleId.Build))

    return moves
  }

  getPlayerBoard(playerId: number) {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
  }

  getPlayerIncome(playerId: number) {
    return sumBy(this.getIncomeUnits(playerId).getItems(), (u) => this.getUnitIncome(u)) + this.getIncomeFromBuilding(playerId)
  }

  getUnitIncome(unit: MaterialItem) {
    return sumBy(unitCardCaracteristics[unit.id].effect as IncomeEffect[], (e) => this.getEffectIncomes(unit.location.player!, e, unit.location.x!, unit.location.y!))
  }

  getIncomeUnits(playerId: number) {
    return this.getPlayerBoard(playerId)
      .filter(item => {
        if (item.location.rotation) {
          console.error('The item must not be hidden at that moment', item.id, JSON.stringify(item), JSON.stringify(this.game.rule))
        }
        return unitCardCaracteristics[item.id].effect !== undefined
          && (unitCardCaracteristics[item.id].effect as Effect[]).some(eff => isIncomeType(eff))
      })
  }

  getIncomeFromBuilding(playerId: number): number {
    const buildHelper = new BuildHelper(this.game, playerId)
    const effects = buildHelper.getPlayerIncomeBuildingEffects(playerId)
    return sumBy(effects, (e) => this.getEffectIncomes(playerId, e, 0, 0))
  }

  getEffectIncomes(playerId: number, effect: IncomeEffect, x: number, y: number) {
    switch (effect.type) {
      case EffectType.Income:
        return effect.amount
      case EffectType.IncomePerResource:
        return new ResourcesHelper(this.game, playerId).getResource(effect.resource) * effect.amount
      case EffectType.IncomeIfAgeToken:
        const index = this
          .material(MaterialType.Unit)
          .location((l) => l.type === LocationType.PlayerUnitBoard && l.x === x && l.y === y)
          .player(playerId)
          .getIndex()

        const hasAgeToken = this
          .material(MaterialType.Age)
          .location(LocationType.OnCard)
          .parent(index)
          .length > 0

        return hasAgeToken ? effect.amount : 0
      default:
        return 0
    }
  }

}
