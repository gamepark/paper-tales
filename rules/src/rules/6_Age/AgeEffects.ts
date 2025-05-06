import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { GainTokenIfDying, isGainTokenIfDying } from '../../material/effects/6_AgeEffects'
import { WhichUnit } from '../../material/effects/Effect'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { AgeHelper } from '../helpers/AgeHelper'
import { ScoreHelper } from '../helpers/ScoreHelper'
import { RuleId } from '../RuleId'

export class AgeEffects extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players

    players.forEach((player) => {
      let goldToGain = 0
      let scoreToGain = 0
      const ageHelper = new AgeHelper(this.game, player)
      const scoreHelper = new ScoreHelper(this.game, player)

      const unitsWithAgeEffects = ageHelper.unitsWithAgeEffects

      for (const [index, unit] of unitsWithAgeEffects.entries) {
        const effects = ageHelper.getUnitAgeEffects(unit)
        for (const effect of effects) {
          if (isGainTokenIfDying(effect)) {
            switch (effect.whoDies) {
              case WhichUnit.Myself:
                if (ageHelper.isUnitDying(unit, index)) {
                  if (effect.perAgeToken) {
                    const gain = this.computeGain(effect, ageHelper.howManyAgeTokenOnIndex(index))
                    scoreToGain += gain.scoreToGain
                    goldToGain += gain.goldToGain
                  } else if (!effect.ifAgeToken || ageHelper.howManyAgeTokenOnIndex(index)) {
                    const gain = this.computeGain(effect)
                    scoreToGain += gain.scoreToGain
                    goldToGain += gain.goldToGain
                  }
                }

                break
              case WhichUnit.Others:
                // No case for now
                break
              case WhichUnit.All:
                // Other effects are not really meaningfull, but I let the door open to do them.
                if (effect.perAgeToken) {
                  const ageTokens = ageHelper.ageTokensOnDyingUnits
                  const gain = this.computeGain(effect, ageTokens)
                  scoreToGain += gain.scoreToGain
                  goldToGain += gain.goldToGain
                }
                break
            }
          }
        }
      }

      if (scoreToGain) moves.push(...scoreHelper.gainOrLoseScore(scoreToGain))
      if (goldToGain) moves.push(...this.material(MaterialType.Gold).money(golds).addMoney(goldToGain, { type: LocationType.PlayerGoldStock, player }))
    })

    moves.push(this.startRule(RuleId.AgeUnitsDie))

    return moves
  }

  private computeGain(effect: GainTokenIfDying, factor = 1) {
    const gains = {
      scoreToGain: 0,
      goldToGain: 0
    }
    switch (effect.tokenGain) {
      case MaterialType.ScoreToken:
        gains.scoreToGain = effect.amount * factor
        break
      case MaterialType.Gold:
        gains.goldToGain = effect.amount * factor
    }
    return gains
  }
}
