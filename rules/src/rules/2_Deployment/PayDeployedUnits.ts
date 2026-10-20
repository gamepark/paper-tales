import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { DeployCostHelper } from '../helpers/DeployCostHelper'
import { RuleId } from '../RuleId'

export class PayDeployedUnits extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    this.game.players.forEach((player) => {
      const cost = new DeployCostHelper(this.game, player).placedCost

      const goldMoney = this.material(MaterialType.Gold).money(golds)
      moves.push(
        ...goldMoney.removeMoney(cost, {
          type: LocationType.PlayerGoldStock,
          player
        })
      )
    })

    moves.push(this.startSimultaneousRule(RuleId.DeployEffects))
    return moves
  }
}
