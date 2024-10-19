import { isMoveItemType, ItemMove, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { MaterialType } from '../material/MaterialType'
import { LocationType } from '../material/LocationType'
import { RuleId } from './RuleId'
import { Unit } from '../material/Unit'

export class Draft extends SimultaneousRule {
  
  getActivePlayerLegalMoves(playerId: number): MaterialMove<number, number, number>[] {
    
    console.log(this.material(MaterialType.Unit).filter(item => item.id === Unit.Commander))

    const draftHand = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(playerId)
    return draftHand.moveItems({
      type:LocationType.PlayerUnitHand, player:playerId
    })


  }

  beforeItemMove(move: ItemMove) {
    if (!isMoveItemType(MaterialType.Unit)(move)) return []

    return [this.endPlayerTurn(move.location.player!)]
  }

  getMovesAfterPlayersDone(): MaterialMove<number, number, number>[] {
    return [this.startRule(RuleId.GiveDraftToNeighbor)]
  }

}