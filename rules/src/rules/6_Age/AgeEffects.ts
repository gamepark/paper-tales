import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { GainTokenIfDying, isGainOnAge, isGainTokenIfDying } from '../../material/effects/6_AgeEffects'
import { WhichUnit } from '../../material/effects/Effect'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { AgeHelper } from '../helpers/AgeHelper'
import { BuildHelper } from '../helpers/BuildHelper'
import { KingdomHelper } from '../helpers/KingdomHelper'
import { ScoreHelper } from '../helpers/ScoreHelper'
import { RuleId } from '../RuleId'

type Gains = { score: number; gold: number }

export class AgeEffects extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []

    for (const player of this.game.players) {
      const gains: Gains = { score: 0, gold: 0 }
      const ageHelper = new AgeHelper(this.game, player)
      const kingdom = new KingdomHelper(this.game, player)

      for (const [index, unit] of ageHelper.unitsWithAgeEffects.entries) {
        for (const effect of ageHelper.getUnitAgeEffects(unit)) {
          if (isGainTokenIfDying(effect)) this.gain(gains, effect.tokenGain, this.getDyingGain(ageHelper, kingdom, effect, index))
          else if (isGainOnAge(effect)) this.gain(gains, effect.token, effect.amount * kingdom.count(effect.per, index))
        }
      }
      for (const effect of new BuildHelper(this.game, player).buildingEffects.filter(isGainOnAge)) {
        this.gain(gains, effect.token, effect.amount * kingdom.count(effect.per))
      }

      if (gains.score) moves.push(...new ScoreHelper(this.game, player).gainOrLoseScore(gains.score))
      if (gains.gold) moves.push(...this.material(MaterialType.Gold).money(golds).addMoney(gains.gold, { type: LocationType.PlayerGoldStock, player }))
    }

    moves.push(this.startRule(RuleId.AgeUnitsDie))

    return moves
  }

  /** What a "when it dies" effect of a unit gives at this Age phase */
  private getDyingGain(ageHelper: AgeHelper, kingdom: KingdomHelper, effect: GainTokenIfDying, index: number): number {
    switch (effect.whoDies) {
      case WhichUnit.Myself: {
        if (!ageHelper.isUnitDying(ageHelper.material(MaterialType.Unit).getItem(index), index)) return 0
        const ageTokens = ageHelper.howManyAgeTokenOnIndex(index)
        if (effect.perAgeToken) return effect.amount * ageTokens
        if (effect.per) return effect.amount * kingdom.count(effect.per, index)
        if (effect.ifAgeToken && !ageTokens) return 0
        if (effect.ifSingleAgeToken && ageTokens !== 1) return 0
        return effect.amount
      }
      case WhichUnit.All:
        // For each Age token on the units that die (the Palm Reader, the Kraken, the Relic of Fate)
        return effect.perAgeToken ? effect.amount * ageHelper.ageTokensOnDyingUnits : 0
      default:
        return 0
    }
  }

  private gain(gains: Gains, token: MaterialType.ScoreToken | MaterialType.Gold, amount: number) {
    if (token === MaterialType.ScoreToken) gains.score += amount
    else gains.gold += amount
  }
}
