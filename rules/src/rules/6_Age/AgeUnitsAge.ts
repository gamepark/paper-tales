import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { AgeHelper } from '../helpers/AgeHelper'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class AgeUnitsAge extends MaterialRulesPart {

  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players

    // Dying Phase
    players.forEach(player => {
      const ageHelper = new AgeHelper(this.game, player)
      for (const entry of ageHelper.agingUnits.entries) {
        const index = entry[0]

        moves.push(this.material(MaterialType.Age).createItem({
          location: { type: LocationType.OnCard, parent: index },
          quantity: 1
        }))
      }
    })

    moves.push(this.getTurn() === 4 ? this.startRule(RuleId.EndGame) : this.startRule(RuleId.NextTurn))
    return moves
  }

  getTurn() {
    return this.remind(Memory.Time)
  }

}
