import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { LogDescription, MoveComponentContext, MovePlayedLogDescription } from '@gamepark/react-game'
import { isMoveItemType, isStartRule, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { AgeLog } from './AgeLog'
import { IncomeLog } from './IncomeLog'
import { WarLog } from './WarLog'
import { WarScoreLog } from './WarScoreLog'

/**
 * The journal: the wars (strengths and wars won, then the points each player scores), the income and the dead units of
 * the Age
 */
export class PaperTalesLogs implements LogDescription<MaterialMove> {
  getMovePlayedLogDescription(move: MaterialMove, context: MoveComponentContext<MaterialMove, number, MaterialGame>): MovePlayedLogDescription | undefined {
    if (isStartRule(move) && move.id === RuleId.War) return { Component: WarLog }
    if (isStartRule(move) && move.id === RuleId.Income) return { Component: IncomeLog }
    if (isStartRule(move) && move.id === RuleId.AgeUnitsDie) return { Component: AgeLog }
    if (context.game.rule?.id === RuleId.War && isMoveItemType(MaterialType.ScoreToken)(move)) {
      return { Component: WarScoreLog, player: move.location.player }
    }
    return
  }
}
