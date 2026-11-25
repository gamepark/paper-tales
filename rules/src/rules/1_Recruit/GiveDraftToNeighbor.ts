import { isMoveItemTypeAtOnce, isShuffleItemType, ItemMove, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class GiveDraftToNeighbor extends MaterialRulesPart {
  /**
   * Every Monarch has picked (see Draft): the rest of each hand is passed at once, face down, towards the neighbour, all
   * the hands at the same time (rulebook p.5). Once every hand is passed, each one is taken by its receiver (see
   * afterItemMove).
   */
  onRuleStart(): MaterialMove[] {
    const moves = this.game.players.flatMap((player) => {
      const rest = this.getDraftHand(player)
      return rest.length ? [rest.moveItemsAtOnce({ type: LocationType.DraftTransit, player: this.getNextPlayer(player) })] : []
    })
    return moves.length ? moves : this.takeHands()
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    // Every hand passed: the receivers take them
    if (isMoveItemTypeAtOnce(MaterialType.Unit)(move) && move.location.type === LocationType.DraftTransit) {
      return this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).length ? [] : this.takeHands()
    }
    // A hand shuffled is taken
    if (isShuffleItemType(MaterialType.Unit)(move)) return [this.takeHand(this.material(MaterialType.Unit).getItem(move.indexes[0]).location.player!)]
    // Every hand taken: the draft goes on
    if (isMoveItemTypeAtOnce(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerDraftHand) {
      return this.material(MaterialType.Unit).location(LocationType.DraftTransit).length ? [] : [this.startSimultaneousRule(RuleId.Draft)]
    }
    return []
  }

  /**
   * Each Monarch takes the hand passed to them. It is shuffled while it is still face down, so that the Monarch who
   * passed it cannot follow a card to what the neighbour keeps, then it is taken in hand, once the shuffle is played (see
   * afterItemMove). The last card of each hand: nothing to choose, the deployment begins and the card lands in the hand
   * of its receiver (see PlaceUnitOnBoard).
   */
  private takeHands(): MaterialMove[] {
    const hands = this.game.players.map((player) => this.getPassedHand(player))
    if (hands.every((hand) => hand.length <= 1)) return [this.startSimultaneousRule(RuleId.PlaceUnitOnBoard)]
    return hands.map((hand, index) => (hand.length > 1 ? hand.shuffle() : this.takeHand(this.game.players[index])))
  }

  /** The hands go one way at odd turns, the other way at even turns */
  private getNextPlayer(player: number) {
    const players = this.game.players
    const playerIndex = players.indexOf(player)
    if (this.remind(Memory.Time) % 2 === 1) return players[(playerIndex + 1) % players.length]
    return players[(playerIndex - 1 + players.length) % players.length]
  }

  private getDraftHand(player: number) {
    return this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(player)
  }

  private getPassedHand(player: number) {
    return this.material(MaterialType.Unit).location(LocationType.DraftTransit).player(player)
  }

  private takeHand(player: number): MaterialMove {
    return this.getPassedHand(player).moveItemsAtOnce({ type: LocationType.PlayerDraftHand, player })
  }
}
