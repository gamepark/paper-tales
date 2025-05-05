import { isMoveItemType, ItemMove, MaterialMove, RuleMove, SimultaneousRule } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class Draft extends SimultaneousRule {
  onRuleStart(_move: RuleMove): MaterialMove[] {
    const moves: MaterialMove[] = []

    const draftCards = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand)
    if (draftCards.getQuantity() === this.game.players.length) {
      this.game.players.forEach((player) => {
        moves.push(draftCards.player(player).moveItem({ type: LocationType.PlayerUnitHand, player }))
        moves.push(this.endPlayerTurn(player))
      })
    }

    return moves
  }

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

  beforeItemMove(move: ItemMove) {
    const moves: MaterialMove[] = []

    if (isMoveItemType(MaterialType.Unit)(move)) {
      if (this.game.players.length === 2) {
        const player = this.material(MaterialType.Unit).getItem(move.itemIndex).location.player!
        const movesAlreadyPlayed = this.remind(Memory.TwoPlayersDraftMoves, player)
        if (movesAlreadyPlayed === undefined) {
          this.memorize(Memory.TwoPlayersDraftMoves, move.location.type, player)
        } else {
          moves.push(this.endPlayerTurn(player))
        }
      } else {
        moves.push(this.endPlayerTurn(move.location.player!))
      }
    }

    return moves
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    this.game.players.forEach((player) => this.forget(Memory.TwoPlayersDraftMoves, player))
    return [this.startRule(RuleId.GiveDraftToNeighbor)]
  }
}
