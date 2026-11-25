import { isMoveItemType, ItemMove, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class Draft extends SimultaneousRule {
  getActivePlayerLegalMoves(playerId: number): MaterialMove[] {
    const moves: MaterialMove[] = []

    const draftHand = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(playerId)

    if (this.game.players.length === 2) {
      const movesAlreadyPlayed = this.remind(Memory.TwoPlayersDraftMoves, playerId)

      if (movesAlreadyPlayed !== LocationType.PlayerUnitHand) {
        moves.push(
          ...draftHand.moveItems({
            type: LocationType.PlayerUnitHand,
            player: playerId
          })
        )
      }

      if (movesAlreadyPlayed !== LocationType.Discard) {
        moves.push(
          ...draftHand.moveItems({
            type: LocationType.Discard
          })
        )
      }
    } else {
      moves.push(
        ...draftHand.moveItems({
          type: LocationType.PlayerUnitHand,
          player: playerId
        })
      )
    }

    return moves
  }

  /**
   * A Monarch who has picked (with 2 players: kept one card and discarded one) is done: the rest of their hand stays in
   * front of them until every Monarch has picked, then all the hands are passed at the same time (rulebook p.5, see
   * GiveDraftToNeighbor)
   */
  beforeItemMove(move: ItemMove) {
    if (!isMoveItemType(MaterialType.Unit)(move)) return []
    const player = this.material(MaterialType.Unit).getItem(move.itemIndex).location.player!
    if (this.game.players.length === 2 && this.remind(Memory.TwoPlayersDraftMoves, player) === undefined) {
      this.memorize(Memory.TwoPlayersDraftMoves, move.location.type, player)
      return []
    }
    return [this.endPlayerTurn(player)]
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    this.game.players.forEach((player) => this.forget(Memory.TwoPlayersDraftMoves, player))
    return [this.startRule(RuleId.GiveDraftToNeighbor)]
  }
}
