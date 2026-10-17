import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialGameAnimations } from '@gamepark/react-game'
import { isCreateItem, isMoveItem } from '@gamepark/rules-api'

class PaperTalesMaterialAnimation extends MaterialGameAnimations {}

export const paperTalesAnimation = new PaperTalesMaterialAnimation()

paperTalesAnimation.when().rule(RuleId.Deal).move(isMoveItem).duration(0.2)
paperTalesAnimation
  .when()
  .move((move) => isMoveItem(move) && move.location.type === LocationType.PlayerDraftHand)
  .duration(0.5)
paperTalesAnimation
  .when()
  .move((move) => isMoveItem(move) && move.location.type === LocationType.PlayerUnitHand)
  .duration(0.5)
paperTalesAnimation.when().rule(RuleId.RevealBoards).move(isMoveItem).duration(0.5)
// The score markers are not on the table (the score is in the panels): their moves still take a while, so that the
// neighbours view stays long enough to read the outcome of the wars, and the panels show each gain one after the other
paperTalesAnimation
  .when()
  .rule(RuleId.War)
  .move((move) => isMoveItem(move) && move.itemType === MaterialType.ScoreToken)
  .duration(0.7)
// The Age is resolved at once: the dying units go to the discard one after the other, slowly enough to see which, then
// the new Age tokens land on the units that live on
paperTalesAnimation.when().rule(RuleId.AgeUnitsDie).move(isMoveItem).duration(0.8)
paperTalesAnimation.when().rule(RuleId.AgeUnitsAge).move(isCreateItem).duration(0.4)
