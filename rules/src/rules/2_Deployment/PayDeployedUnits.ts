import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class PayDeployedUnits extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    this.game.players.forEach((player) => {
      const deployedUnitsIndexes = this.remind<number[]>(Memory.PlayedCardsDuringDeployment, player)
      const units = this.material(MaterialType.Unit).index(deployedUnitsIndexes).getItems<Unit>()
      let cost = 0
      for (const unit of units) {
        cost += unitCardCaracteristics[unit.id].cost
      }

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
