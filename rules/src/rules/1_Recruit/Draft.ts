import { isMoveItemType, ItemMove, MaterialMove, RuleMove, SimultaneousRule } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { GiveDraftToNeighbor } from './GiveDraftToNeighbor'

export class Draft extends SimultaneousRule {
  onRuleStart(_move: RuleMove): MaterialMove[] {
    const moves: MaterialMove[] = []

    const draftCards = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand)
    if (draftCards.getQuantity() === this.game.players.length) {
      // Last card of each draft hand goes automatically to the player's hand, then the draft is over
      this.game.players.forEach((player) => {
        moves.push(draftCards.player(player).moveItemsAtOnce({ type: LocationType.PlayerUnitHand, player }))
      })
      moves.push(this.startRule(RuleId.GiveDraftToNeighbor))
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

  /**
   * A Monarch who has picked (with 2 players: kept one card and discarded one) passes the rest of their hand at once,
   * face down, towards their neighbour (rulebook p.5): every Monarch passes in their own action, so that all the hands
   * travel at the same time. The neighbour takes it once every Monarch has picked (see GiveDraftToNeighbor).
   */
  beforeItemMove(move: ItemMove) {
    if (!isMoveItemType(MaterialType.Unit)(move)) return []
    const player = this.material(MaterialType.Unit).getItem(move.itemIndex).location.player!
    if (this.game.players.length === 2 && this.remind(Memory.TwoPlayersDraftMoves, player) === undefined) {
      this.memorize(Memory.TwoPlayersDraftMoves, move.location.type, player)
      return []
    }
    const rest = this.material(MaterialType.Unit)
      .location(LocationType.PlayerDraftHand)
      .player(player)
      .index((index) => index !== move.itemIndex)
    const receiver = new GiveDraftToNeighbor(this.game).getNextPlayer(player)
    return [...(rest.length ? [rest.moveItemsAtOnce({ type: LocationType.DraftTransit, player: receiver })] : []), this.endPlayerTurn(player)]
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    this.game.players.forEach((player) => this.forget(Memory.TwoPlayersDraftMoves, player))
    return [this.startRule(RuleId.GiveDraftToNeighbor)]
  }
}
