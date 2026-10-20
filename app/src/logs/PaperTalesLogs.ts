import { Card, isArtifact, isUnit } from '@gamepark/paper-tales/material/Artifact'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { CustomMoveType } from '@gamepark/paper-tales/rules/CustomMoveType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { LogDescription, MovePlayedLogDescription, SetupLogDescription } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, isStartRule, isStartSimultaneousRule, MaterialGame, MaterialMove, MoveItem } from '@gamepark/rules-api'
import { goldGainTold, isGoldGain, LogContext, revealedCard } from './logHelpers'
import { DeathLog, SaveLog } from './AgeLog'
import { BuildLog } from './BuildLog'
import { ChosenAgeTokenLog, DeployLog, DrawnLog, MovedAgeTokenLog, ReactivateLog } from './DeployLog'
import { GoldLog } from './GoldLog'
import { phaseLogCss, turnLogCss } from './logs.css'
import { AgePhaseLog, BuildPhaseLog, DeployPhaseLog, EndPhaseLog, IncomePhaseLog, WarPhaseLog } from './PhaseLog'
import { EndScoreLog, ScoreLog } from './ScoreLog'
import { FirstTurnLog, TurnLog } from './TurnLog'
import { WarWonLog } from './WarLog'

/**
 * The journal of the game as a page of the rulebook (validated mockup docs/mockups/journal3.html): the turn with its
 * open book, each phase announced by its arrow banner, then one line per event with the avatar of the Monarch it
 * concerns: the units revealed, the wars won with the Legend points, the gold and the points gained or lost with the
 * card they come from, the constructions, the units saved and the ones that die, the final scoring. The names of the
 * cards open their help. The recruitment, secret, is not told.
 */
export class PaperTalesLogs implements LogDescription<MaterialMove, number, MaterialGame> {
  getSetupLogDescriptions(): SetupLogDescription<MaterialGame>[] {
    return [{ Component: FirstTurnLog, css: turnLogCss }]
  }

  getMovePlayedLogDescription(move: MaterialMove, context: LogContext): MovePlayedLogDescription | undefined {
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
      if (move.id === RuleId.EndGame) return { Component: EndPhaseLog, css: phaseLogCss }
      return
    }

    if (isMoveItemType(MaterialType.Unit)(move)) {
      // A reveal only says { rotation: false }: the rule tells what happens
      if (rule === RuleId.RevealBoards && move.location.rotation === false) return { Component: DeployLog }
      if (rule === RuleId.AgeUnitsDie && move.location.type === LocationType.Discard) return { Component: DeathLog }
      if (rule === RuleId.DeployEffects && isKeptDraw(move, context.game)) return { Component: DrawnLog }
      return
    }
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
    if (isCustomMoveType(CustomMoveType.GainAgeTokenOnChosenUnitEffect)(move)) return { Component: ChosenAgeTokenLog }
    if (isCustomMoveType(CustomMoveType.MysticEffect)(move)) return { Component: SaveLog }
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

/**
 * A card drawn by a "when revealed" effect that stays: the Legendary Artifact found by the Court Jester, the unit of cost
 * 3 or less that takes the place of the Shapeshifter (rulebook p.12). The deck is hidden: the move reveals the card.
 */
const isKeptDraw = (move: MoveItem, game: MaterialGame) => {
  const card = revealedCard(move) ?? new PaperTalesRules(game).material(MaterialType.Unit).getItem<Card>(move.itemIndex).id
  if (move.location.type === LocationType.PlayerArtifacts) return isArtifact(card)
  if (move.location.type === LocationType.PlayerUnitBoard) return isUnit(card) && unitCardCaracteristics[card].cost <= 3
  return false
}
