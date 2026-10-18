import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { css } from '@emotion/react'
import { AgeHelper } from '@gamepark/paper-tales/rules/helpers/AgeHelper'
import { MaterialContext, MaterialGameAnimations, ShuffleAnimations } from '@gamepark/react-game'
import {
  isCreateItem,
  isDeleteItem,
  isMoveItem,
  isMoveItemsAtOnce,
  isMoveItemType,
  isMoveItemTypeAtOnce,
  isShuffle,
  Location,
  MaterialItem,
  MaterialMove
} from '@gamepark/rules-api'
import { isAreaDisplayed } from '../locators/TableLayout'

type ItemAnimationArgs = Parameters<MaterialGameAnimations['getItemAnimation']>

/**
 * A hand is shuffled where it lies, face down, between other cards: the packets stay close to the pile and low, so
 * that they never pass over the cards around it (the default riffle pulls them a whole card width apart)
 */
const handShuffle = (duration: number) => new ShuffleAnimations(duration, { spread: 0.22, lift: 1.5, riffles: 2 })

const passedTo = (move: MaterialMove, ...types: LocationType[]) => isMoveItemTypeAtOnce(MaterialType.Unit)(move) && types.includes(move.location.type)

/**
 * When the deployment begins, my kept hand slides from the right to its deployment place (a transition, see
 * UnitCardDescription) while the last card of the recruitment lands in it, then the hand is shuffled there
 */
export const HAND_SLIDE = 0.7
const DEPLOY_SHUFFLE = 0.8

/**
 * The Age, in the kingdom displayed: the bands on the units (see AgeFates) are read before the first unit dies; the
 * card, and its Age tokens with it, wait in place, then go to the discard
 */
const AGE_READING = 1.8
const AGE_DEATH = 0.9
const isDeath = (move: MaterialMove) => isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.Discard
const isFirstDeathShown = (move: MaterialMove, context: MaterialContext) => {
  if (context.rules.game.rule?.id !== RuleId.AgeUnitsDie || !isDeath(move) || !isMoveItem(move)) return false
  const unit = itemAt(context, MaterialType.Unit, move.itemIndex)
  if (!unit || isUnseen(move, context)) return false
  const dying = new AgeHelper(context.rules.game, unit.location.player!).dyingUnits.getIndexes()
  return Math.min(...dying) === move.itemIndex
}

class PaperTalesMaterialAnimation extends MaterialGameAnimations {
  getItemAnimation(...[context, animation, action, boundaries]: ItemAnimationArgs) {
    if (isShuffle(animation.move)) return handShuffle(animation.duration).getItemAnimation(context, animation as never)
    if (isFirstDeathShown(animation.move, context)) {
      // Without a backwards fill, the delayed animation leaves the card in place until it starts
      const death = { ...animation, duration: animation.duration - AGE_READING }
      return [
        super.getItemAnimation(context, death, action, boundaries),
        css`
          &&,
          && > * {
            animation-delay: ${AGE_READING}s;
          }
        `
      ]
    }
    return super.getItemAnimation(context, animation, action, boundaries)
  }
}

export const paperTalesAnimation = new PaperTalesMaterialAnimation()

/**
 * The table shows one area at a time: the material of the other areas stands small on their Monarch's panel, hidden
 * (see placeAtPanelWhenHidden). What moves between the table and a hidden area flies from or into its panel; what moves
 * from a hidden place to another hidden place is not seen at all: it would only make cards hop on the panels.
 */
const areaLocations = [
  LocationType.PlayerUnitHand,
  LocationType.PlayerDraftHand,
  LocationType.DraftWaiting,
  LocationType.DraftTransit,
  LocationType.PlayerUnitBoard,
  LocationType.PlayerBuildingBoard,
  LocationType.PlayerBuildingHand,
  LocationType.PlayerGoldStock
]

const isSeen = (context: MaterialContext, type: number, index: number, item: MaterialItem): boolean => {
  if (item.location.type === LocationType.OnCard) {
    const unit = itemAt(context, MaterialType.Unit, item.location.parent!)
    return !!unit && isSeen(context, MaterialType.Unit, item.location.parent!, unit)
  }
  if (!areaLocations.includes(item.location.type)) return true
  const locator = context.locators[item.location.type]
  return !!locator && !locator.hide(item, { ...context, type, index, displayIndex: 0 })
}

const hasReserve = (context: MaterialContext, type: number) => !!context.material[type]?.stockLocation

const itemAt = (context: MaterialContext, type: number, index: number): MaterialItem | undefined => context.rules.material(type).index(index).getItem()

const moveSeen = (context: MaterialContext, type: number, index: number, location: Location) => {
  const item = itemAt(context, type, index)
  if (!item) return false
  return isSeen(context, type, index, item) || isSeen(context, type, index, { ...item, location: { ...item.location, ...location } })
}

const isUnseen = (move: MaterialMove, context: MaterialContext): boolean => {
  try {
    return isUnseenMove(move, context)
  } catch {
    // A move that cannot be read against the displayed state: let the framework animate it as usual
    return false
  }
}

const isUnseenMove = (move: MaterialMove, context: MaterialContext): boolean => {
  if (isMoveItem(move)) return !moveSeen(context, move.itemType, move.itemIndex, move.location)
  if (isMoveItemsAtOnce(move)) return !move.indexes.some((index) => moveSeen(context, move.itemType, index, move.location))
  // The gold earned comes from the reserve on the table: it is seen leaving it, even towards a panel
  if (isCreateItem(move) && move.itemType === MaterialType.Gold && hasReserve(context, move.itemType)) return false
  if (isCreateItem(move)) return !isSeen(context, move.itemType, -1, move.item as MaterialItem)
  if (isDeleteItem(move)) {
    const item = itemAt(context, move.itemType, move.itemIndex)
    return !item || !isSeen(context, move.itemType, move.itemIndex, item)
  }
  if (isShuffle(move)) {
    return !move.indexes.some((index) => {
      const item = itemAt(context, move.itemType, index)
      return item && isSeen(context, move.itemType, index, item)
    })
  }
  return false
}

// The discard shuffled to become the deck again is face down in its pile: nothing to see, it takes no time
paperTalesAnimation
  .when()
  .move((move, context) => isShuffle(move) && itemAt(context, move.itemType, move.indexes[0])?.location.type === LocationType.Discard)
  .none()

// The last card of the recruitment lands in my hand while the hand moves to its deployment place
paperTalesAnimation
  .when()
  .rule(RuleId.PlaceUnitOnBoard)
  .move((move, context) => passedTo(move, LocationType.PlayerUnitHand) && !isUnseen(move, context))
  .duration(HAND_SLIDE)

// The shuffle of my hand when the deployment begins: the slide of the hand, then the riffle
paperTalesAnimation
  .when()
  .rule(RuleId.PlaceUnitOnBoard)
  .move((move, context) => isShuffle(move) && !isUnseen(move, context))
  .duration(DEPLOY_SHUFFLE)

// The income: the coins of each Monarch fly from the reserve into their panel, one Monarch after the other, slowly
// enough to follow them
paperTalesAnimation.when().rule(RuleId.Income).move(isCreateItem).duration(0.7)

// First of all: what nobody can see takes no time
paperTalesAnimation.when().move(isUnseen).none()

// The deal: a pack of cards from the deck to each Monarch, into my fan or into their panel
paperTalesAnimation.when().rule(RuleId.Deal).move(isMoveItemsAtOnce).duration(0.35)

// The hands passed during the recruitment (see GiveDraftToNeighbor): my hand leaves face down to the panel of its
// receiver, the hand given to me lands face down at the right of my fan, I take it, it is shuffled. The hands passed
// between the other Monarchs fly together from panel to panel (see DraftPassFlights), not one after the other.
paperTalesAnimation
  .when()
  .rule(RuleId.GiveDraftToNeighbor)
  .move((move) => passedTo(move, LocationType.DraftTransit, LocationType.DraftWaiting, LocationType.PlayerDraftHand, LocationType.PlayerUnitHand))
  .duration(0.6)

// What a Monarch who is not looked at discards (deployment, Age): not shown, the card lands on the discard at once.
// A card that leaves a kingdom on the table (the neighbours view) still flies to the discard.
const fromUnseenPlace = (move: MaterialMove, context: MaterialContext) => {
  if (!isMoveItem(move) || move.location.type !== LocationType.Discard) return false
  const item = itemAt(context, move.itemType, move.itemIndex)
  return !!item && !isSeen(context, move.itemType, move.itemIndex, item)
}
paperTalesAnimation.when().move(fromUnseenPlace).none()

// The card I keep, or put back into my hand
paperTalesAnimation
  .when()
  .move((move) => isMoveItem(move) && [LocationType.PlayerDraftHand, LocationType.PlayerUnitHand].includes(move.location.type))
  .duration(0.5)
paperTalesAnimation.when().rule(RuleId.RevealBoards).move(isMoveItem).duration(0.5)
// The score markers are not on the table (the score is in the panels): their moves still take a while, so that the
// neighbours view stays long enough to read the outcome of the wars, and the panels show each gain one after the other
paperTalesAnimation
  .when()
  .rule(RuleId.War)
  .move((move) => isMoveItem(move) && move.itemType === MaterialType.ScoreToken)
  .duration(0.7)
// The Age is resolved at once: the dying units go to the discard one after the other, slowly enough to see which in the
// displayed kingdom, quickly from the panels of the others; then the new Age tokens land on the units that live on
const fromDisplayedArea = (move: MaterialMove, context: MaterialContext) =>
  isMoveItem(move) && isAreaDisplayed(context, itemAt(context, move.itemType, move.itemIndex)?.location.player)
paperTalesAnimation.when().rule(RuleId.AgeUnitsDie).move(isFirstDeathShown).duration(AGE_READING + AGE_DEATH)
paperTalesAnimation.when().rule(RuleId.AgeUnitsDie).move(fromDisplayedArea).duration(AGE_DEATH)
paperTalesAnimation.when().rule(RuleId.AgeUnitsDie).move(isMoveItem).duration(0.3)
// The Age tokens of the dead go back to the reserve
paperTalesAnimation.when().rule(RuleId.AgeUnitsDie).move(isDeleteItem).duration(0.4)
paperTalesAnimation.when().rule(RuleId.AgeUnitsAge).move(isCreateItem).duration(0.4)
