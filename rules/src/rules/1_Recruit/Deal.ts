import { isMoveItemTypeAtOnce, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { RuleId } from '../RuleId'

/**
 * Every Monarch receives 5 Unit cards, 9 at 2 players (rulebook p.5 and p.8). Only when the deck runs out during the
 * deal is the discard shuffled into a new deck, then the deal goes on.
 */
export class Deal extends PlayerTurnRule {
  onRuleStart(): MaterialMove[] {
    const cardsPerPlayer = this.game.players.length === 2 ? 9 : 5
    const moves: MaterialMove[] = []
    const deck = this.material(MaterialType.Unit).location(LocationType.Deck).deck()
    let cardsLeft = deck.length
    let missingSomewhere = false

    for (const player of this.game.players) {
      const missingCards = cardsPerPlayer - this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(player).length
      const dealt = Math.min(missingCards, cardsLeft)
      if (dealt > 0) moves.push(deck.dealAtOnce({ type: LocationType.PlayerDraftHand, player }, dealt))
      cardsLeft -= dealt
      if (dealt < missingCards) missingSomewhere = true
    }

    if (missingSomewhere) {
      // The deck is empty: the discard becomes the new deck, then it is shuffled and the deal goes on (see afterItemMove).
      // All the cards at once: one card at a time would hold the table for a minute
      moves.push(this.material(MaterialType.Unit).location(LocationType.Discard).moveItemsAtOnce({ type: LocationType.Deck }))
    } else {
      moves.push(this.startSimultaneousRule(RuleId.Draft))
    }

    return moves
  }

  /**
   * The discard is in the deck: it is shuffled there. The moves are played after they are all returned, so the deck is
   * shuffled only once the cards are in it, and the deal goes on with the shuffled deck.
   */
  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isMoveItemTypeAtOnce(MaterialType.Unit)(move) || move.location.type !== LocationType.Deck) return []
    return [this.material(MaterialType.Unit).location(LocationType.Deck).shuffle(), this.startPlayerTurn(RuleId.Deal, this.game.players[0])]
  }

  getPlayerMoves() {
    return []
  }
}
