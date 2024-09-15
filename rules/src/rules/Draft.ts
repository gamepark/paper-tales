import { PlayerTurnRule } from '@gamepark/rules-api'
import { MaterialType } from '../material/MaterialType'

export class Draft extends PlayerTurnRule {
  getPlayerMoves() {
    console.log(this.material(MaterialType.Unit).getItems())
    return []
  }
}