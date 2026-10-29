import { isMoveItemTypeAtOnce, isShuffleItemType, ItemMove, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class GiveDraftToNeighbor extends MaterialRulesPart {
  /**
   * Every Monarch has passed their hand face down (see Draft): each one takes the hand passed to them. It is shuffled
   * while it is still face down, so that the Monarch who passed it cannot follow a card to what the neighbour keeps, then
   * it is taken in hand, once the shuffle is played (see afterItemMove). The last card of each hand: nothing to choose,
   * the deployment begins and the card lands in the hand of its receiver (see PlaceUnitOnBoard).
   */
  onRuleStart(): MaterialMove[] {
    const hands = this.game.players.map((player) => this.getPassedHand(player))
    if (hands.every((hand) => hand.length <= 1)) return [this.startSimultaneousRule(RuleId.PlaceUnitOnBoard)]
    return hands.map((hand, index) => (hand.length > 1 ? hand.shuffle() : this.takeHand(this.game.players[index])))
  }

  /** A hand shuffled is taken; the draft goes on once every hand is taken */
  afterItemMove(move: ItemMove): MaterialMove[] {
    if (isShuffleItemType(MaterialType.Unit)(move)) return [this.takeHand(this.material(MaterialType.Unit).getItem(move.indexes[0]).location.player!)]
    if (isMoveItemTypeAtOnce(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerDraftHand) {
      return this.material(MaterialType.Unit).location(LocationType.DraftTransit).length ? [] : [this.startSimultaneousRule(RuleId.Draft)]
    }
    return []
  }

  private getPassedHand(player: number) {
    return this.material(MaterialType.Unit).location(LocationType.DraftTransit).player(player)
  }

  private takeHand(player: number): MaterialMove {
    return this.getPassedHand(player).moveItemsAtOnce({ type: LocationType.PlayerDraftHand, player })
  }

  getNextPlayer(player: number) {
    const players = this.game.players
    const playerIndex = players.findIndex((item) => item === player)
    const round = this.remind(Memory.Time)
    if (round % 2 === 1) {
      return playerIndex + 1 === players.length ? players[0] : players[playerIndex + 1]
    } else {
      return playerIndex - 1 === -1 ? players[players.length - 1] : players[playerIndex - 1]
    }
  }
}
