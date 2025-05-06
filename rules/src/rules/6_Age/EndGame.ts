import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import sum from 'lodash/sum'
import { isRelicEffect } from '../../material/effects/7_EndGameEffects'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { AgeHelper } from '../helpers/AgeHelper'
import { ScoreHelper } from '../helpers/ScoreHelper'

export class EndGame extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []

    const players = this.game.players
    for (const player of players) {
      let scoreToAdd = 0
      const ageHelper = new AgeHelper(this.game, player)
      const scoreHelper = new ScoreHelper(this.game, player)
      const units = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)

      for (const [index, item] of units.entries) {
        const itemId = item.id as Unit
        const characteristics = unitCardCaracteristics[itemId]
        if (characteristics.effect !== undefined) {
          const score: number[] = characteristics.effect.filter(isRelicEffect).map((e) => ageHelper.howManyAgeTokenOnIndex(index) * e.amount)
          scoreToAdd += sum(score)
        }
      }

      if (scoreToAdd) moves.push(...scoreHelper.gainOrLoseScore(scoreToAdd))
    }

    moves.push(this.endGame())
    return moves
  }
}
