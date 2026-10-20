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
      // The Age tokens go back to the reserve from the unit, still in its place (its band tells why it dies, see AgeFates),
      // then the unit leaves for the discard: a card turned face down on its way would cross the tokens laid on it
      for (const index of dyingUnits.getIndexes()) moves.push(...new AgeTokens(this).remove(index))
      moves.push(...dyingUnits.moveItems({ type: LocationType.Discard }))
    })
    moves.push(this.startRule(RuleId.AgeUnitsAge))
    return moves
  }
}
