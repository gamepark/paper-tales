import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { AgeHelper } from '../helpers/AgeHelper'
import { RuleId } from '../RuleId'
import { AgeTokens } from '../helpers/AgeTokens'

export class AgeUnitsDie extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players

    players.forEach((player) => {
      const ageHelper = new AgeHelper(this.game, player)
      const dyingUnits = ageHelper.dyingUnits
      // Each unit leaves with its Age tokens, the reason of its death, then the tokens go back to the reserve
      const indexes = dyingUnits.getIndexes()
      moves.push(...dyingUnits.moveItems({ type: LocationType.Discard }))
      for (const index of indexes) moves.push(...new AgeTokens(this).remove(index))
    })
    moves.push(this.startRule(RuleId.AgeUnitsAge))
    return moves
  }
}
