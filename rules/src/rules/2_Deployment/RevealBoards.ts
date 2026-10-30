import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { RuleId } from '../RuleId'

/** Every Monarch reveals the cards they laid, all at once, one kingdom after the other (rulebook p.5) */
export class RevealBoards extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    this.game.players.forEach((player) => {
      const laid = this.material(MaterialType.Unit)
        .location((location) => location.type === LocationType.PlayerUnitBoard || location.type === LocationType.PlayerArtifacts)
        .player(player)
      const faceDown = laid.rotation(true)
      if (faceDown.length) moves.push(faceDown.moveItemsAtOnce({ rotation: false }))
    })
    moves.push(this.startRule(RuleId.PayDeployedUnits))

    return moves
  }
}
