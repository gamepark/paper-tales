import { MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { PlayerColor } from '../../PlayerColor'
import { RuleId } from '../RuleId'

/**
 * The outcome of the wars, read by every Monarch before the income, as around the table: everybody looks at the wars
 * before taking their gold and building. Each Monarch moves on once they have read it; the income comes when they all
 * have.
 */
export class WarSummary extends SimultaneousRule {
  getActivePlayerLegalMoves(player: PlayerColor): MaterialMove[] {
    return [this.endPlayerTurn(player)]
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    return [this.startRule(RuleId.Income)]
  }
}
