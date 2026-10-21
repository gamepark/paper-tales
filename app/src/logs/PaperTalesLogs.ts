import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { CustomMoveType } from '@gamepark/paper-tales/rules/CustomMoveType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { LogDescription, MovePlayedLogDescription, SetupLogDescription } from '@gamepark/react-game'
import {
  isCreateItemType,
  isCustomMoveType,
  isEndPlayerTurn,
  isMoveItemType,
  isMoveItemTypeAtOnce,
  isStartRule,
  isStartSimultaneousRule,
  MaterialGame,
  MaterialMove
} from '@gamepark/rules-api'
import { AgingLog, DeathLog, SaveLog, SaveNobodyLog } from './AgeLog'
import { BuildLog, NoBuildLog } from './BuildLog'
import { AgeTokenLog, DeckRefillLog, DeployLog, DrawnLog, MovedAgeTokenLog, NothingDeployedLog, ReactivateLog, RemovedUnitLog } from './DeployLog'
import { GoldLog } from './GoldLog'
import { cardAt, goldGainTold, isAgeTokenOf, isGoldGain, isRevealOf, LogContext, nothingDeployed, runFrom } from './logHelpers'
import { phaseLogCss, turnLogCss } from './logs.css'
import { AgePhaseLog, BuildPhaseLog, DeployPhaseLog, EndPhaseLog, IncomePhaseLog, RecruitPhaseLog, RecruitPhaseSetupLog, WarPhaseLog } from './PhaseLog'
import { EndScoreLog, ScoreLog } from './ScoreLog'
import { FirstTurnLog, TurnLog } from './TurnLog'
import { WarWonLog } from './WarLog'

/**
 * The journal of the game as a page of the rulebook (validated mockup docs/mockups/journal3.html): the turn with its
 * open book, each phase announced by its arrow banner, then one line per event with the avatar of the Monarch it
 * concerns: the cards each Monarch reveals with their cost, the effects of the cards with the card they come from, the
 * wars won, the gold and the points, the constructions, the units saved, the ones that die and the ones that age, the
 * final scoring. The names of the cards open their help. What is secret is not told: the cards each Monarch keeps at
 * the recruitment, the cards laid face down until they are revealed, the cards discarded face down.
 */
export class PaperTalesLogs implements LogDescription<MaterialMove, number, MaterialGame> {
  getSetupLogDescriptions(): SetupLogDescription<MaterialGame>[] {
    return [
      { Component: FirstTurnLog, css: turnLogCss },
      { Component: RecruitPhaseSetupLog, css: phaseLogCss }
    ]
  }

  getMovePlayedLogDescription(move: MaterialMove, context: LogContext): MovePlayedLogDescription | undefined {
    const rule = context.game.rule?.id as RuleId | undefined

    // The phases start as a rule or as a simultaneous rule
    if (isStartRule(move) || isStartSimultaneousRule(move)) {
      if (move.id === RuleId.Deal && rule === RuleId.NextTurn) return { Component: TurnLog, css: turnLogCss }
      if (move.id === RuleId.Draft && rule === RuleId.Deal) return { Component: RecruitPhaseLog, css: phaseLogCss }
      if (move.id === RuleId.PlaceUnitOnBoard) return { Component: DeployPhaseLog, css: phaseLogCss }
      if (move.id === RuleId.RevealBoards) return nothingDeployed(context.game).length ? { Component: NothingDeployedLog } : undefined
      if (move.id === RuleId.War) return { Component: WarPhaseLog, css: phaseLogCss }
      if (move.id === RuleId.Income) return { Component: IncomePhaseLog, css: phaseLogCss }
      if (move.id === RuleId.Build) return { Component: BuildPhaseLog, css: phaseLogCss }
      // The Age begins with the Mystic when there is one, else with the effects
      if (move.id === RuleId.SaveUnitsWithMysticEffect) return { Component: AgePhaseLog, css: phaseLogCss }
      if (move.id === RuleId.AgeEffects && rule !== RuleId.SaveUnitsWithMysticEffect) return { Component: AgePhaseLog, css: phaseLogCss }
      if (move.id === RuleId.EndGame) return { Component: EndPhaseLog, css: phaseLogCss }
      return
    }

    if (isMoveItemType(MaterialType.Unit)(move)) {
      // A reveal only says { rotation: false }: the cards of a Monarch are told at once
      if (rule === RuleId.RevealBoards && move.location.rotation === false) {
        const player = cardAt(context.game, move.itemIndex).location.player
        return runFrom(context, isRevealOf(player, context.game)) ? { Component: DeployLog } : undefined
      }
      if (rule === RuleId.PlaceUnitOnBoard && move.location.type === LocationType.Discard && isUnitOfPreviousTurn(move.itemIndex, context.game)) {
        return { Component: RemovedUnitLog }
      }
      if (rule === RuleId.DeployEffects && (move.location.type === LocationType.PlayerArtifacts || move.location.type === LocationType.PlayerUnitBoard)) {
        return { Component: DrawnLog }
      }
      if (rule === RuleId.AgeUnitsDie && move.location.type === LocationType.Discard) return { Component: DeathLog }
      return
    }
    if (isMoveItemTypeAtOnce(MaterialType.Unit)(move) && move.location.type === LocationType.Deck) return { Component: DeckRefillLog }
    // The constructions, and the buildings improved or built by a deployment effect (Golem, Djinn, Titan)
    if (
      isMoveItemType(MaterialType.Building)(move) &&
      (rule === RuleId.Build || rule === RuleId.DeployEffects) &&
      move.location.type === LocationType.PlayerBuildingBoard
    ) {
      return { Component: BuildLog }
    }
    if (isMoveItemType(MaterialType.Age)(move) && rule === RuleId.DeployEffects && move.location.type === LocationType.OnCard) return { Component: MovedAgeTokenLog }
    if (isCustomMoveType(CustomMoveType.ReactivateUnit)(move)) return { Component: ReactivateLog }
    if (isCreateItemType(MaterialType.Age)(move) && (rule === RuleId.DeployEffects || rule === RuleId.AgeUnitsAge)) {
      if (!runFrom(context, isAgeTokenOf(move.item.location.player))) return
      return { Component: rule === RuleId.DeployEffects ? AgeTokenLog : AgingLog }
    }
    if (isCustomMoveType(CustomMoveType.MysticEffect)(move)) return { Component: SaveLog }
    if (isCustomMoveType(CustomMoveType.SaveNobody)(move)) return { Component: SaveNobodyLog }
    // A pass is the action of the Monarch; after a construction, the end of the turn is its consequence
    if (isEndPlayerTurn(move) && rule === RuleId.Build && context.consequenceIndex === undefined) return { Component: NoBuildLog }
    if (isMoveItemType(MaterialType.ScoreToken)(move)) {
      if (rule === RuleId.War) return { Component: WarWonLog }
      return { Component: rule === RuleId.EndGame ? EndScoreLog : ScoreLog }
    }
    if (isGoldGain(move)) {
      // The gold of the wars is told with the wars won; the coins given back on a payment are change, not a gain
      if (rule === RuleId.War || rule === RuleId.PayDeployedUnits || rule === RuleId.Build) return
      return goldGainTold(move, context) !== undefined ? { Component: GoldLog } : undefined
    }
    return
  }
}

/** A face up unit of the kingdom, laid at a previous turn: the cards laid this turn are still face down */
const isUnitOfPreviousTurn = (index: number, game: MaterialGame) => {
  const location = cardAt(game, index).location
  return location.type === LocationType.PlayerUnitBoard && !location.rotation
}
