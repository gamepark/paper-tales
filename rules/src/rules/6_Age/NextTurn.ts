import { MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class NextTurn extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    this.memorize(Memory.Time, (t: number) => t + 1)
    moves.push(this.startRule(RuleId.Deal))
    return moves
  }
}
