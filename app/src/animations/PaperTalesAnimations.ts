import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialContext, MaterialGameAnimations } from '@gamepark/react-game'
import { isCreateItem, isMoveItem, isMoveItemTypeAtOnce, isShuffle, MaterialMove, MoveItemsAtOnce } from '@gamepark/rules-api'
import { isAreaDisplayed } from '../locators/TableLayout'

class PaperTalesMaterialAnimation extends MaterialGameAnimations {}

export const paperTalesAnimation = new PaperTalesMaterialAnimation()

paperTalesAnimation.when().rule(RuleId.Deal).move(isMoveItem).duration(0.2)

// The hands passed during the recruitment, in steps that every Monarch goes through at once (see GiveDraftToNeighbor
// and DraftPassingLocators): what happens in the displayed area takes its time, the rest happens under the panels
const handOwner = (index: number, context: MaterialContext) => context.rules.material(MaterialType.Unit).index(index).getItem()?.location.player
const passedTo = (move: MaterialMove, ...types: LocationType[]) => isMoveItemTypeAtOnce(MaterialType.Unit)(move) && types.includes(move.location.type)
// 1. Each hand leaves its giver face down: slowly from the displayed area, quickly from panel to panel
paperTalesAnimation
  .when()
  .rule(RuleId.GiveDraftToNeighbor)
  .move((move, context) => passedTo(move, LocationType.DraftTransit) && isAreaDisplayed(context, handOwner((move as MoveItemsAtOnce).indexes[0], context)))
  .duration(0.6)
paperTalesAnimation
  .when()
  .rule(RuleId.GiveDraftToNeighbor)
  .move((move) => passedTo(move, LocationType.DraftTransit))
  .duration(0.15)
// 2. It lands face down in front of its receiver, 3. who takes it in hand, 4. and shuffles it: seen in the displayed area
// only
paperTalesAnimation
  .when()
  .rule(RuleId.GiveDraftToNeighbor)
  .move(
    (move, context) =>
      passedTo(move, LocationType.DraftWaiting, LocationType.PlayerDraftHand) && isAreaDisplayed(context, (move as MoveItemsAtOnce).location.player)
  )
  .duration(0.6)
paperTalesAnimation
  .when()
  .rule(RuleId.GiveDraftToNeighbor)
  .move((move) => passedTo(move, LocationType.DraftWaiting, LocationType.PlayerDraftHand))
  .none()
paperTalesAnimation
  .when()
  .rule(RuleId.GiveDraftToNeighbor)
  .move((move, context) => isShuffle(move) && !isAreaDisplayed(context, handOwner(move.indexes[0], context)))
  .none()
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
