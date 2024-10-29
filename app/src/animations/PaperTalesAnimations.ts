import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import {  MaterialGameAnimations } from '@gamepark/react-game'
import { isMoveItem} from '@gamepark/rules-api'


class PaperTalesMaterialAnimation extends  MaterialGameAnimations {

}

export const paperTalesAnimation = new PaperTalesMaterialAnimation()


paperTalesAnimation.when().rule(RuleId.Deal).move(isMoveItem).duration(0.2)
paperTalesAnimation.when()
  .move(move => isMoveItem(move) && move.location.type === LocationType.PlayerDraftHand)
  .duration(0.5)
  paperTalesAnimation.when()
  .move(move => isMoveItem(move) && move.location.type === LocationType.PlayerUnitHand)
  .duration(0.5)

