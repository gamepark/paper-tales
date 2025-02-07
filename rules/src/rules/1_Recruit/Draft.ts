import { isMoveItemType, ItemMove, MaterialMove, RuleMove, SimultaneousRule } from '@gamepark/rules-api'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { RuleId } from '../RuleId'
import { Memory } from '../Memory'

export class Draft extends SimultaneousRule {

  onRuleStart(_move: RuleMove): MaterialMove[] {

    const moves:MaterialMove[] = []

    const draftCards = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand)
    if (draftCards.getQuantity() === this.game.players.length){
      this.game.players.forEach(player => {
        moves.push(draftCards.player(player).moveItem({type:LocationType.PlayerUnitHand, player}))
        moves.push(this.endPlayerTurn(player))
      })
    }

    return moves
    
  }
  
  getActivePlayerLegalMoves(playerId: number): MaterialMove<number, number, number>[] {

    const moves:MaterialMove[] = []

    const draftHand = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(playerId)

    if (this.game.players.length === 2){

      const movesAlreadyPlayed = this.remind(Memory.TwoPlayersDraftMoves, playerId)

      if (movesAlreadyPlayed !== LocationType.PlayerUnitHand){
        moves.push(...draftHand.moveItems({
          type:LocationType.PlayerUnitHand, player:playerId
        }))
      }

      if (movesAlreadyPlayed !== LocationType.Discard){
        moves.push(...draftHand.moveItems({
          type:LocationType.Discard
        }))
      }

    } else {

      moves.push(...draftHand.moveItems({
        type:LocationType.PlayerUnitHand, player:playerId
      }))

    }
    
    return moves      

  }

  beforeItemMove(move: ItemMove) {

    const moves:MaterialMove[] = []

    if (isMoveItemType(MaterialType.Unit)(move)){
      if (this.game.players.length === 2){
        const player = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).filter((_item, index) => index === move.itemIndex).getItem()!.location.player!
        const movesAlreadyPlayed = this.remind(Memory.TwoPlayersDraftMoves, player)
        if (movesAlreadyPlayed === undefined){
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

  getMovesAfterPlayersDone(): MaterialMove<number, number, number>[] {
    this.game.players.forEach(player => this.forget(Memory.TwoPlayersDraftMoves, player))
    return [this.startRule(RuleId.GiveDraftToNeighbor)]
  }

}