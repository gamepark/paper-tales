import { MaterialRulesPart } from '@gamepark/rules-api'
import { sumBy } from 'es-toolkit/compat'
import { cardEffects } from '../../material/CardCharacteristics'
import { IncomeEffect, isIncomeType } from '../../material/effects/4_IncomeEffects'
import { EffectType } from '../../material/effects/Effect'
import { AgeTokens } from './AgeTokens'
import { BuildHelper } from './BuildHelper'
import { KingdomHelper } from './KingdomHelper'
import { ResourcesHelper } from './ResourcesHelper'

/** The gold every Monarch earns at the income phase, before the effects (rulebook p.6) */
export const BASE_INCOME = 2

export class IncomeHelper extends MaterialRulesPart {
  /** The gold the effects give at the income phase: the cards in play (units, Legendary Artifacts) and the buildings */
  getPlayerIncome(playerId: number) {
    return this.getIncomeFromCards(playerId) + this.getIncomeFromBuilding(playerId)
  }

  getIncomeFromCards(playerId: number): number {
    return sumBy(this.getCardsIncome(playerId), (income) => income.amount)
  }

  /** The gold each card in play brings at the income phase, for the ones that bring some */
  getCardsIncome(playerId: number): { index: number; amount: number }[] {
    return new KingdomHelper(this.game, playerId).cards.entries
      .map(([index, card]) => ({
        index,
        amount: sumBy(cardEffects(card.id).filter(isIncomeType), (effect) => this.getEffectIncomes(playerId, effect, index))
      }))
      .filter((income) => income.amount > 0)
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
