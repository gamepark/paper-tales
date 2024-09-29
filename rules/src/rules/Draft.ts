import { isMoveItemType, ItemMove, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { MaterialType } from '../material/MaterialType'
import { LocationType } from '../material/LocationType'
import { RuleId } from './RuleId'

export class Draft extends SimultaneousRule {
  
  getActivePlayerLegalMoves(playerId: number): MaterialMove<number, number, number>[] {

    const draftHand = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(playerId)
    return draftHand.moveItems({
      type:LocationType.PlayerUnitHand
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