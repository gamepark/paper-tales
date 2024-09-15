import { PlayerTurnRule } from '@gamepark/rules-api'
import { MaterialType } from '../material/MaterialType'
import { LocationType } from '../material/LocationType'

export class Draft extends PlayerTurnRule {
  getPlayerMoves() {
    console.log(this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(this.player).getItems())
    console.log(this.material(MaterialType.Unit).location(LocationType.Deck).getItems())
    return []
  }
}