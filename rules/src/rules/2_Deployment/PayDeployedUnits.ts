import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { goldMoney } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class PayDeployedUnits extends MaterialRulesPart {

  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    this.game.players.forEach(player => {
      const deployedUnitsIndexes = this.remind(Memory.PlayedCardsDuringDeployment, player)
      const units = this.material(MaterialType.Unit).index((index) => deployedUnitsIndexes.includes(index)).getItems()
      let cost = 0
      for (const unit of units) {
        cost += unitCardCaracteristics[unit.id].cost
      }

      moves.push(
        ...goldMoney.createOrDelete(this.material(MaterialType.Gold), {
          type: LocationType.PlayerGoldStock,
          player
        }, -cost)
      )

    })

    moves.push(this.startSimultaneousRule(RuleId.DeployEffects))
    return moves
  }
}

