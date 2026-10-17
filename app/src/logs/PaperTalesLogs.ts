import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { CustomMoveType } from '@gamepark/paper-tales/rules/CustomMoveType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { LogDescription, MoveComponentContext, MovePlayedLogDescription } from '@gamepark/react-game'
import { isCreateItemType, isCustomMoveType, isMoveItemType, isStartRule, isStartSimultaneousRule, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { DeathLog, SaveLog } from './AgeLog'
import { BuildLog } from './BuildLog'
import { DeployLog } from './DeployLog'
import { GoldLog, IncomeLog } from './GoldLog'
import { phaseLogCss, turnLogCss } from './logs.css'
import { AgePhaseLog, BuildPhaseLog, DeployPhaseLog, IncomePhaseLog, WarPhaseLog } from './PhaseLog'
import { ScoreLog } from './ScoreLog'
import { TurnLog } from './TurnLog'
import { WarWonLog } from './WarLog'

/**
 * The journal of the game as a page of the rulebook (validated mockup docs/mockups/journal3.html): the turn with its
 * open book, each phase announced by its arrow banner, then one line per event with the avatar of the Monarch it
 * concerns: the units revealed, the wars won with the Legend points, the gold and the points gained or lost, the
 * constructions, the units saved and the ones that die.
 */
export class PaperTalesLogs implements LogDescription<MaterialMove, number, MaterialGame> {
  getMovePlayedLogDescription(move: MaterialMove, context: MoveComponentContext<MaterialMove, number, MaterialGame>): MovePlayedLogDescription | undefined {
    const rule = context.game.rule?.id as RuleId | undefined

    // The phases start as a rule or as a simultaneous rule
    if (isStartRule(move) || isStartSimultaneousRule(move)) {
      if (move.id === RuleId.Deal && rule === RuleId.NextTurn) return { Component: TurnLog, css: turnLogCss }
      if (move.id === RuleId.RevealBoards) return { Component: DeployPhaseLog, css: phaseLogCss }
      if (move.id === RuleId.War) return { Component: WarPhaseLog, css: phaseLogCss }
      if (move.id === RuleId.Income) return { Component: IncomePhaseLog, css: phaseLogCss }
      if (move.id === RuleId.Build) return { Component: BuildPhaseLog, css: phaseLogCss }
      // The Age begins with the Mystic when there is one, else with the effects
      if (move.id === RuleId.SaveUnitsWithMysticEffect) return { Component: AgePhaseLog, css: phaseLogCss }
      if (move.id === RuleId.AgeEffects && rule !== RuleId.SaveUnitsWithMysticEffect) return { Component: AgePhaseLog, css: phaseLogCss }
      return
    }

    if (isMoveItemType(MaterialType.Unit)(move)) {
      // A reveal only says { rotation: false }: the rule tells what happens
      if (rule === RuleId.RevealBoards && move.location.rotation === false) return { Component: DeployLog }
      if (rule === RuleId.AgeUnitsDie && move.location.type === LocationType.Discard) return { Component: DeathLog }
    }
    if (isMoveItemType(MaterialType.Building)(move) && rule === RuleId.Build && move.location.type === LocationType.PlayerBuildingBoard) {
      return { Component: BuildLog }
    }
    if (isMoveItemType(MaterialType.ScoreToken)(move)) return { Component: rule === RuleId.War ? WarWonLog : ScoreLog }
    if (isCreateItemType(MaterialType.Gold)(move) && move.item.location.type === LocationType.PlayerGoldStock) {
      if (rule === RuleId.Income) return isFirstGoldOf(move.item.location.player, context) ? { Component: IncomeLog } : undefined
      return { Component: GoldLog }
    }
    if (isCustomMoveType(CustomMoveType.MysticEffect)(move)) return { Component: SaveLog }
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
