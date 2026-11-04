import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { BASE_INCOME, IncomeHelper } from '../helpers/IncomeHelper'
import { RuleId } from '../RuleId'

export class Income extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const income = new IncomeHelper(this.game)
    for (const player of this.game.players) {
      const goldMoney = this.material(MaterialType.Gold).money(golds)
      moves.push(...goldMoney.addMoney(BASE_INCOME + income.getPlayerIncome(player), { type: LocationType.PlayerGoldStock, player }))
    }

    moves.push(this.startSimultaneousRule(RuleId.Build))

    return moves
  }
}
