import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { AgeHelper } from '../helpers/AgeHelper'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { AgeTokens } from '../helpers/AgeTokens'

export class AgeUnitsAge extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players

    // The units saved by the Mystical Healer were kept until the deaths were shown (see AgeUnitsDie)
    for (const player of players) this.forget(Memory.UnitSavedWithMystic, player)

    // Every unit still in play ages, the ones saved by the Mystical Healer included (rulebook p.8)
    players.forEach((player) => {
      const ageHelper = new AgeHelper(this.game, player)
      for (const entry of ageHelper.units.entries) {
        const index = entry[0]

        moves.push(new AgeTokens(this).add(index, player))
      }
    })

    moves.push(this.getTurn() === 4 ? this.startRule(RuleId.EndGame) : this.startRule(RuleId.NextTurn))
    return moves
  }

  getTurn() {
    return this.remind<number>(Memory.Time)
  }
}
