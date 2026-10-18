import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class GiveDraftToNeighbor extends MaterialRulesPart {
  /**
   * Every Monarch has passed their hand face down (see Draft): each one takes the hand passed to them. It is shuffled
   * while it is still face down, so that the Monarch who passed it cannot follow a card to what the neighbour keeps, then
   * it is taken in hand. The last card of each hand: nothing to choose, the deployment begins and the card lands in the
   * hand of its receiver (see PlaceUnitOnBoard).
   */
  onRuleStart(): MaterialMove[] {
    const players = this.game.players
    // The hands are captured before any move: the same cards are then moved step by step
    const hands = players.map((player) => this.material(MaterialType.Unit).location(LocationType.DraftTransit).player(player))
    if (hands.every((hand) => hand.length <= 1)) return [this.startSimultaneousRule(RuleId.PlaceUnitOnBoard)]
    const moves: MaterialMove[] = []
    for (const hand of hands) if (hand.length > 1) moves.push(hand.shuffle())
    hands.forEach((hand, index) => moves.push(hand.moveItemsAtOnce({ type: LocationType.PlayerDraftHand, player: players[index] })))
    moves.push(this.startSimultaneousRule(RuleId.Draft))
    return moves
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
