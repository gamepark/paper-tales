import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class GiveDraftToNeighbor extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves = []
    const remainingUnits = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).getItems().length

    if (remainingUnits === 0) {
      moves.push(this.startSimultaneousRule(RuleId.PlaceUnitOnBoard))
    } else {
      const players = this.game.players
      // The hands are captured before any move: the same cards are then moved step by step
      const hands = players.map((player) => this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(player))
      const receivers = players.map((player) => this.getNextPlayer(player))
      // In steps that every Monarch goes through at the same time: each hand is given face down (it leaves its giver),
      // then lands face down in front of its receiver, is shuffled there, and the receiver takes it in hand. A hand that
      // would land before its receiver's own hand is given would make one Monarch wait for another all around the table.
      hands.forEach((hand, index) => moves.push(hand.moveItemsAtOnce({ type: LocationType.DraftTransit, player: receivers[index] })))
      hands.forEach((hand, index) => moves.push(hand.moveItemsAtOnce({ type: LocationType.DraftWaiting, player: receivers[index] })))
      // Shuffled while still face down, so that the Monarch who passed it cannot follow a card to what the neighbour keeps
      for (const hand of hands) if (hand.length > 1) moves.push(hand.shuffle())
      hands.forEach((hand, index) => moves.push(hand.moveItemsAtOnce({ type: LocationType.PlayerDraftHand, player: receivers[index] })))

      moves.push(this.startSimultaneousRule(RuleId.Draft))
    }
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
