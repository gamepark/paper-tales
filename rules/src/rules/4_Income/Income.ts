import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { sumBy } from 'es-toolkit/compat'
import { Card } from '../../material/Artifact'
import { cardEffects } from '../../material/CardCaracteristics'
import { IncomeEffect, isIncomeType } from '../../material/effects/4_IncomeEffects'
import { EffectType } from '../../material/effects/Effect'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { AgeTokens } from '../helpers/AgeTokens'
import { BuildHelper } from '../helpers/BuildHelper'
import { KingdomHelper } from '../helpers/KingdomHelper'
import { ResourcesHelper } from '../helpers/ResourcesHelper'
import { RuleId } from '../RuleId'

/** The gold every Monarch earns at the income phase, before the effects (rulebook p.6) */
export const BASE_INCOME = 2

export class Income extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    for (const player of this.game.players) {
      const goldMoney = this.material(MaterialType.Gold).money(golds)
      moves.push(...goldMoney.addMoney(BASE_INCOME + this.getPlayerIncome(player), { type: LocationType.PlayerGoldStock, player }))
    }

    moves.push(this.startSimultaneousRule(RuleId.Build))

    return moves
  }

  /** The gold the effects give at the income phase: the cards in play (units, Legendary Artifacts) and the buildings */
  getPlayerIncome(playerId: number) {
    return this.getIncomeFromCards(playerId) + this.getIncomeFromBuilding(playerId)
  }

  getIncomeFromCards(playerId: number): number {
    return sumBy(new KingdomHelper(this.game, playerId).cards.entries, ([index, card]) =>
      sumBy(cardEffects(card.id as Card | undefined).filter(isIncomeType), (effect) => this.getEffectIncomes(playerId, effect, index))
    )
  }

  getIncomeFromBuilding(playerId: number): number {
    const buildHelper = new BuildHelper(this.game, playerId)
    const effects = buildHelper.incomeBuildingEffects
    return sumBy(effects, (e) => this.getEffectIncomes(playerId, e))
  }

  /** The gold an income effect gives; the source is the card that has it (none for a building) */
  getEffectIncomes(playerId: number, effect: IncomeEffect, source?: number) {
    switch (effect.type) {
      case EffectType.Income:
        return effect.per ? effect.amount * new KingdomHelper(this.game, playerId).count(effect.per, source) : effect.amount
      case EffectType.IncomePerResource:
        return new ResourcesHelper(this.game, playerId).getResource(effect.resource) * effect.amount
      case EffectType.IncomeIfAgeToken:
        return source !== undefined && new AgeTokens(this).count(source) > 0 ? effect.amount : 0
    }
  }
}
