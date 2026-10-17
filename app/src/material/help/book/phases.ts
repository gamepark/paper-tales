import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'

/** The step of the turn (0 to 5, 6 for the end of the game) each rule belongs to */
const ruleSteps: Record<RuleId, number> = {
  [RuleId.Deal]: 0,
  [RuleId.Draft]: 0,
  [RuleId.GiveDraftToNeighbor]: 0,
  [RuleId.PlaceUnitOnBoard]: 1,
  [RuleId.RevealBoards]: 1,
  [RuleId.PayDeployedUnits]: 1,
  [RuleId.DeployEffects]: 1,
  [RuleId.ChooseWherePlacingAgeToken]: 1,
  [RuleId.ChooseUnpaidUnits]: 1,
  [RuleId.War]: 2,
  [RuleId.Income]: 3,
  [RuleId.Build]: 4,
  [RuleId.SaveUnitsWithMysticEffect]: 5,
  [RuleId.AgeEffects]: 5,
  [RuleId.AgeUnitsDie]: 5,
  [RuleId.AgeUnitsAge]: 5,
  [RuleId.NextTurn]: 5,
  [RuleId.EndGame]: 6
}

export const currentPhaseIndex = (rules: PaperTalesRules) => {
  const ruleId = rules.game.rule?.id as RuleId | undefined
  return ruleId === undefined ? 6 : ruleSteps[ruleId]
}
