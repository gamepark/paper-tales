import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { AgeHelper } from '../helpers/AgeHelper'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { AgeTokens } from '../helpers/AgeTokens'

export class AgeUnitsDie extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players

    players.forEach((player) => {
      const ageHelper = new AgeHelper(this.game, player)
      const dyingUnits = ageHelper.dyingUnits
      for (const [index] of dyingUnits.entries) moves.push(...new AgeTokens(this).remove(index))

      moves.push(...dyingUnits.moveItems({ type: LocationType.Discard }))
      this.forget(Memory.UnitSavedWithMystic, player)
    })
    moves.push(this.startRule(RuleId.AgeUnitsAge))
    return moves
  }
}
