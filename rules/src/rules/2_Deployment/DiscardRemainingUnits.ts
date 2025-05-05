import { MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class DiscardRemainingUnits extends SimultaneousRule {
  onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove[] {
    this.game.players.forEach((player) => {
      this.memorize(Memory.PlayedCardsDuringDeployment, [], player)
    })
    return []
  }

  getActivePlayerLegalMoves(playerId: number): MaterialMove[] {
    const moves = []
    const hand = this.getPlayerHand(playerId)

    moves.push(
      ...hand.moveItems({
        type: LocationType.Discard
      })
    )

    if (!hand.length) {
      moves.push(this.endPlayerTurn(playerId))
    }

    return moves
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    return [this.startRule(RuleId.RevealBoards)]
  }

  getPlayerHand(playerId: number) {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(playerId)
  }
}
