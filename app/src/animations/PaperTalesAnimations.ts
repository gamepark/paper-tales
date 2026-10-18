import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { AgeHelper } from '@gamepark/paper-tales/rules/helpers/AgeHelper'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { and, isRule, ItemContext, MaterialContext, MaterialGameAnimations, ShuffleAnimations, Trajectory } from '@gamepark/react-game'
import {
  isCreateItem,
  isDeleteItem,
  isMoveItem,
  isMoveItemsAtOnce,
  isMoveItemType,
  isMoveItemTypeAtOnce,
  isShuffle,
  isStartRule,
  Location,
  MaterialItem,
  MaterialMove
} from '@gamepark/rules-api'
import { getPanelPosition, getPanelsOrder, getViewedPlayer, isAreaDisplayed, PANEL_HEIGHT, PANEL_WIDTH, PANEL_X } from '../locators/TableLayout'

export const paperTalesAnimation = new MaterialGameAnimations()

// ==========================================
// What is seen
// ==========================================

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

const itemAt = (context: MaterialContext, type: number, index: number): MaterialItem | undefined => context.rules.material(type).index(index).getItem()

const isSeen = (context: MaterialContext, type: number, index: number, item: MaterialItem): boolean => {
  if (item.location.type === LocationType.OnCard) {
    const unit = itemAt(context, MaterialType.Unit, item.location.parent!)
    return !!unit && isSeen(context, MaterialType.Unit, item.location.parent!, unit)
  }
  if (!areaLocations.includes(item.location.type)) return true
  const locator = context.locators[item.location.type]
  return !!locator && !locator.hide(item, { ...context, type, index, displayIndex: 0 })
}

const moveSeen = (context: MaterialContext, type: number, index: number, location: Partial<Location>) => {
  const item = itemAt(context, type, index)
  if (!item) return false
  return isSeen(context, type, index, item) || isSeen(context, type, index, { ...item, location: { ...item.location, ...location } })
}

const isUnseen = (move: MaterialMove, context: MaterialContext): boolean => {
  if (isMoveItem(move)) return !moveSeen(context, move.itemType, move.itemIndex, move.location)
  if (isMoveItemsAtOnce(move)) return !move.indexes.some((index) => moveSeen(context, move.itemType, index, move.location))
  // The gold earned comes from the reserve on the table: it is seen leaving it, even towards a panel
  if (isCreateItem(move) && move.itemType === MaterialType.Gold) return false
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

const isSeenMove = (move: MaterialMove, context: MaterialContext) => !isUnseen(move, context)

const passedTo =
  (...types: LocationType[]) =>
  (move: MaterialMove) =>
    isMoveItemTypeAtOnce(MaterialType.Unit)(move) && types.includes(move.location.type)

// ==========================================
// The configurations, the first that matches a move applies
// ==========================================

// The discard shuffled to become the deck again is face down in its pile: nothing to see
paperTalesAnimation
  .configure((move, context) => isShuffle(move) && itemAt(context, move.itemType, move.indexes[0])?.location.type === LocationType.Discard)
  .skip()

/**
 * A hand is shuffled where it lies, face down, between other cards: the packets stay close to the pile and low, so
 * that they never pass over the cards around it (the default riffle pulls them a whole card width apart)
 */
const handShuffle = { spread: 0.22, lift: 1.5, riffles: 2 }

// When the deployment begins, the last card of the recruitment lands in my hand while the hand moves to its
// deployment place, then the hand is shuffled there
paperTalesAnimation.configure(and(isRule(RuleId.PlaceUnitOnBoard), passedTo(LocationType.PlayerUnitHand), isSeenMove)).duration(700)
paperTalesAnimation
  .configure(and(isRule(RuleId.PlaceUnitOnBoard), isShuffle, isSeenMove))
  .duration(800)
  .itemAnimation((context, animation) => new ShuffleAnimations(animation.duration, handShuffle).getItemAnimation(context, animation as never))

// The income: the coins of each Monarch fly from the reserve into their panel, one Monarch after the other, slowly
// enough to follow them
paperTalesAnimation.configure(and(isRule(RuleId.Income), isCreateItem)).duration(700)

// A building built stays on its slot of the grid (from the unbuilt to the built buildings): nothing moves, the band and
// the veil fade by themselves (see BuildingCardDescription)
paperTalesAnimation
  .configure((move) => isMoveItemType(MaterialType.Building)(move) && move.location.type === LocationType.PlayerBuildingBoard)
  .skip()

// A building upgraded by a deployment effect (the Golem) turns over to its level 2 face, slowly enough to be seen
paperTalesAnimation.configure(and(isRule(RuleId.DeployEffects), isMoveItemType(MaterialType.Building), isSeenMove)).duration(800)

/**
 * The hands passed during the recruitment: each Monarch passes the rest of their hand in their own action (see Draft),
 * so that the hands travel at the same time. A hand follows the turn order arrows: from a panel to the next one in the
 * room at the right of the column, from the last panel to the first one along the return line at its left.
 */
const RIGHT_LANE_X = PANEL_X + PANEL_WIDTH + 2.4
const LEFT_LANE_X = PANEL_X + 0.2
const passTrajectory = (context: ItemContext, move: MaterialMove): Trajectory => {
  const giver = itemAt(context, context.type, context.index)?.location.player
  const receiver = isMoveItemsAtOnce(move) ? move.location.player : undefined
  const order = getPanelsOrder(context)
  const from = order.indexOf(giver as PlayerColor)
  const to = order.indexOf(receiver as PlayerColor)
  if (from === -1 || to === -1) return { elevation: false }
  // My own hand goes straight from my fan to the panel of its receiver, in an arc high enough to pass over the panels
  // (laid 10em high): no waypoint, so the flight is one smooth move
  if (isAreaDisplayed(context, giver)) return { elevation: { height: 16, peak: 0.25 } }
  // Between two panels, through the lanes of the turn order arrows. The pack speeds up as it leaves and slows down as
  // it arrives only: the framework eases every stretch between two waypoints, which would stop the pack at each of
  // them. The waypoints split the time as the distance, so that the pace stays even.
  const centerY = (index: number) => getPanelPosition(index).y + PANEL_HEIGHT / 2
  const panelX = PANEL_X + PANEL_WIDTH / 2
  if (Math.abs(from - to) === 1) {
    return {
      elevation: false,
      easing: 'ease-in',
      waypoints: [{ at: 0.5, coordinates: { x: RIGHT_LANE_X, y: (centerY(from) + centerY(to)) / 2 }, easing: 'ease-out' }]
    }
  }
  const across = panelX - LEFT_LANE_X
  const along = Math.abs(centerY(to) - centerY(from))
  const leave = across / (2 * across + along)
  return {
    elevation: false,
    easing: 'ease-in',
    waypoints: [
      { at: leave, coordinates: { x: LEFT_LANE_X, y: centerY(from) }, easing: 'linear' },
      { at: 1 - leave, coordinates: { x: LEFT_LANE_X, y: centerY(to) }, easing: 'ease-out' }
    ]
  }
}
paperTalesAnimation
  .configure(and(isRule(RuleId.Draft), passedTo(LocationType.DraftTransit)))
  .duration(1200)
  .trajectory(passTrajectory)

// What nobody can see takes no time
paperTalesAnimation.configure(isUnseen).skip()

// The deal: a pack of cards from the deck to each Monarch, into my fan or into their panel
paperTalesAnimation.configure(and(isRule(RuleId.Deal), isMoveItemsAtOnce)).duration(350)

// The hands passed during the recruitment (see GiveDraftToNeighbor): my hand leaves face down to the panel of its
// receiver, the hand given to me lands face down at the right of my fan, it is shuffled, I take it
paperTalesAnimation
  .configure(
    and(
      isRule(RuleId.GiveDraftToNeighbor),
      passedTo(LocationType.DraftTransit, LocationType.DraftWaiting, LocationType.PlayerDraftHand, LocationType.PlayerUnitHand)
    )
  )
  .duration(600)
paperTalesAnimation
  .configure(and(isRule(RuleId.GiveDraftToNeighbor), isShuffle))
  .itemAnimation((context, animation) => new ShuffleAnimations(animation.duration, handShuffle).getItemAnimation(context, animation as never))

// What a Monarch who is not looked at discards (deployment, Age): not shown, the card lands on the discard at once. A
// card that leaves a kingdom on the table (the neighbours view) still flies to the discard.
paperTalesAnimation
  .configure((move, context) => {
    if (!isMoveItem(move) || move.location.type !== LocationType.Discard) return false
    const item = itemAt(context, move.itemType, move.itemIndex)
    return !!item && !isSeen(context, move.itemType, move.itemIndex, item)
  })
  .skip()

// The card I keep, or put back into my hand
paperTalesAnimation.configure((move) => isMoveItem(move) && [LocationType.PlayerDraftHand, LocationType.PlayerUnitHand].includes(move.location.type)).duration(500)

paperTalesAnimation.configure(and(isRule(RuleId.RevealBoards), isMoveItem)).duration(500)

// The score markers are not on the table (the score is in the panels): their moves still take a while, so that the
// neighbours view stays long enough to read the outcome of the wars, and the panels show each gain one after the other
paperTalesAnimation.configure(and(isRule(RuleId.War), isMoveItemType(MaterialType.ScoreToken))).duration(700)

/**
 * The Age, in the kingdom displayed: the bands on the units (see AgeFates) are read before the units die. The start of
 * the deaths is a pause of the timeline when a unit of the displayed kingdom dies, then the dying units go to the
 * discard, slowly in the displayed kingdom, quickly from the panels of the others.
 */
const AGE_READING = 1800
const AGE_DEATH = 900
const deathsShown = (move: MaterialMove, context: MaterialContext) => {
  if (!isStartRule(move) || move.id !== RuleId.AgeUnitsDie) return false
  const player = getViewedPlayer(context)
  return isAreaDisplayed(context, player) && new AgeHelper(context.rules.game, player).dyingUnits.length > 0
}
const fromDisplayedArea = (move: MaterialMove, context: MaterialContext) =>
  isMoveItem(move) && isAreaDisplayed(context, itemAt(context, move.itemType, move.itemIndex)?.location.player)
paperTalesAnimation.configure(deathsShown).duration(AGE_READING)
paperTalesAnimation.configure(and(isRule(RuleId.AgeUnitsDie), fromDisplayedArea)).duration(AGE_DEATH)
paperTalesAnimation.configure(and(isRule(RuleId.AgeUnitsDie), isMoveItem)).duration(300)
// The Age tokens of the dead go back to the reserve, the new ones land on the units that live on
paperTalesAnimation.configure(and(isRule(RuleId.AgeUnitsDie), isDeleteItem)).duration(400)
paperTalesAnimation.configure(and(isRule(RuleId.AgeUnitsAge), isCreateItem)).duration(400)
