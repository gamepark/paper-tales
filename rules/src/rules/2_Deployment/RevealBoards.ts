import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { MaterialType } from '../../material/MaterialType'
import { LocationType } from '../../material/LocationType'
import { RuleId } from '../RuleId'

export class RevealBoards extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    this.game.players.forEach((player) => {
      const laid = this.material(MaterialType.Unit)
        .location((location) => location.type === LocationType.PlayerUnitBoard || location.type === LocationType.PlayerArtifacts)
        .player(player)
      moves.push(...laid.rotation(true).moveItems({ rotation: false }))
    })
    moves.push(this.startRule(RuleId.PayDeployedUnits))

    return moves
  }
}
