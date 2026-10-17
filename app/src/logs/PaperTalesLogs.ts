import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { CustomMoveType } from '@gamepark/paper-tales/rules/CustomMoveType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { LogDescription, MoveComponentContext, MovePlayedLogDescription } from '@gamepark/react-game'
import { isCreateItemType, isCustomMoveType, isMoveItemType, isStartRule, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { DeathLog, SaveLog } from './AgeLog'
import { BuildLog } from './BuildLog'
import { DeployLog } from './DeployLog'
import { GoldLog, IncomeLog } from './GoldLog'
import { strengthsLogCss, turnLogCss } from './logs.css'
import { ScoreLog } from './ScoreLog'
import { TurnLog } from './TurnLog'
import { StrengthsLog, WarWonLog } from './WarLog'

/**
 * The journal of the game (validated mockup docs/mockups/theme.html, B): one line per event, with the avatar of the
 * Monarch it concerns. The turn, the units revealed, the strengths and the wars won, the gold and the Legend points
 * gained or lost, the constructions, the units saved and the ones that die.
 */
export class PaperTalesLogs implements LogDescription<MaterialMove, number, MaterialGame> {
  getMovePlayedLogDescription(move: MaterialMove, context: MoveComponentContext<MaterialMove, number, MaterialGame>): MovePlayedLogDescription | undefined {
    const rule = context.game.rule?.id as RuleId | undefined

    if (isStartRule(move) && move.id === RuleId.Deal && rule === RuleId.NextTurn) return { Component: TurnLog, css: turnLogCss }
    if (isStartRule(move) && move.id === RuleId.War) return { Component: StrengthsLog, css: strengthsLogCss }

    if (isMoveItemType(MaterialType.Unit)(move)) {
      const player = move.location.player
      if (rule === RuleId.RevealBoards && move.location.type === LocationType.PlayerUnitBoard) return { Component: DeployLog, player }
      if (rule === RuleId.AgeUnitsDie && move.location.type === LocationType.Discard) {
        return { Component: DeathLog, player: context.game.items[MaterialType.Unit]?.[move.itemIndex]?.location.player }
      }
    }
    if (isMoveItemType(MaterialType.Building)(move) && rule === RuleId.Build && move.location.type === LocationType.PlayerBuildingBoard) {
      return { Component: BuildLog, player: move.location.player }
    }
    if (isMoveItemType(MaterialType.ScoreToken)(move)) {
      const player = move.location.player
      if (rule === RuleId.War) return { Component: WarWonLog, player }
      return { Component: ScoreLog, player }
    }
    if (isCreateItemType(MaterialType.Gold)(move) && move.item.location.type === LocationType.PlayerGoldStock) {
      const player = move.item.location.player
      if (rule === RuleId.Income) return isFirstGoldOf(player, context) ? { Component: IncomeLog, player } : undefined
      return { Component: GoldLog, player }
    }
    if (isCustomMoveType(CustomMoveType.MysticEffect)(move)) return { Component: SaveLog, player: move.data.player }
    return
  }
}

/** The income of a Monarch may come as several coins: only the first one tells the whole income */
const isFirstGoldOf = (player: number | undefined, context: MoveComponentContext<MaterialMove, number, MaterialGame>) => {
  const earlier = context.action.consequences.slice(0, context.consequenceIndex ?? 0)
  return !earlier.some(
    (move) => isCreateItemType(MaterialType.Gold)(move) && move.item.location.type === LocationType.PlayerGoldStock && move.item.location.player === player
  )
}
