import { isShuffleItemType, ItemMove, MaterialDeck, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { sumBy } from 'es-toolkit/compat'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { RuleId } from '../RuleId'

/**
 * Every Monarch receives 5 Unit cards, 9 at 2 players (rulebook p.5 and p.8). Only when the deck runs out during the
 * deal is the discard shuffled, then the deal goes on with it and what is left of it becomes the new deck.
 */
export class Deal extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const deck = this.material(MaterialType.Unit).location(LocationType.Deck).deck()
    const discard = this.material(MaterialType.Unit).location(LocationType.Discard)
    const runsOut = sumBy(this.game.players, (player) => this.getMissingCards(player)) > deck.length
    const moves = this.deal(deck)
    // The deck runs out: the discard is shuffled, the rest of the cards is dealt once it is shuffled (see afterItemMove)
    if (runsOut && discard.length) {
      moves.push(discard.shuffle())
    } else {
      moves.push(this.startSimultaneousRule(RuleId.Draft))
    }
    return moves
  }

  /**
   * The discard is shuffled: the rest of the cards is dealt from it, and what is left becomes the new deck. The moves are
   * played after they are all returned: the cards are taken only once the shuffle is played. All the cards at once: one
   * card at a time would hold the table for a minute.
   */
  afterItemMove(move: ItemMove): MaterialMove[] {
    if (!isShuffleItemType(MaterialType.Unit)(move)) return []
    const discard = this.material(MaterialType.Unit).location(LocationType.Discard).deck()
    const moves = this.deal(discard)
    if (discard.length) moves.push(discard.moveItemsAtOnce({ type: LocationType.Deck }))
    moves.push(this.startSimultaneousRule(RuleId.Draft))
    return moves
  }

  /** The cards each Monarch is missing, dealt from the top of a deck as long as it has some */
  private deal(deck: MaterialDeck): MaterialMove[] {
    return this.game.players.flatMap((player) => {
      const dealt = Math.min(this.getMissingCards(player), deck.length)
      return dealt > 0 ? [deck.dealAtOnce({ type: LocationType.PlayerDraftHand, player }, dealt)] : []
    })
  }

  private getMissingCards(player: number): number {
    const cardsPerPlayer = this.game.players.length === 2 ? 9 : 5
    return cardsPerPlayer - this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(player).length
  }
}
