import { isUnit } from '@gamepark/paper-tales/material/Artifact'
import { unitCardCharacteristics } from '@gamepark/paper-tales/material/UnitCharacteristics'
import { DropAreaDescription, HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import {
  getKeptHandCoordinates,
  getPlayerPositionDependencies,
  isAreaDisplayed,
  isDraftRule,
  getHoverShift
} from './TableLayout'
import { placeAtPanelWhenHidden } from './placeAtPanelWhenHidden'

/**
 * My kept cards: at the right of the draft fan during the recruitment, in its place otherwise
 */
export class PlayerUnitHandLocator extends HandLocator {
  radius = 125

  locationDescription = new HandDropArea(this)

  getPositionDependencies(location: Location, context: MaterialContext) {
    return { ...getPlayerPositionDependencies(context), items: super.getPositionDependencies(location, context) }
  }

  getCoordinates(_location: Location, context: MaterialContext) {
    return { ...getKeptHandCoordinates(context), z: 1 }
  }

  hide(item: MaterialItem, context: ItemContext) {
    return !isAreaDisplayed(context, item.location.player)
  }

  /**
   * The cards I see lie in a fixed order, by cost then by unit: the hand is shuffled against cheating when the deployment
   * begins (see PlaceUnitOnBoard), which swaps the cards between their places in the game, and that must not show. The
   * cards I cannot see keep the order of the game.
   */
  getItemIndex(item: MaterialItem, context: ItemContext): number {
    if (item.id === undefined) return super.getItemIndex(item, context)
    return context.rules
      .material(context.type)
      .location(item.location.type)
      .player(item.location.player)
      .sort(
        // The Legendary Artifacts after the units: their cost depends on the ones already deployed
        (card) => (isUnit(card.id) ? unitCardCharacteristics[card.id].cost : Infinity),
        (card) => card.id ?? Infinity
      )
      .getIndexes()
      .indexOf(context.index)
  }

  getMaxAngle(location: Location, context: ItemContext): number {
    if (!isDraftRule(context)) return context.player === location.player ? 12 : 3
    // During the recruitment, my kept cards are a tight fan: it stays clear of the discard and its label at its right
    return context.player === location.player ? 1.6 : 1
  }

  // The card zooms in above its place in the hand, kept inside the table (the first card of a wide fan is near its left edge)
  getHoverTransform(item: MaterialItem, context: ItemContext): string[] {
    const { x = 0, y = 0 } = this.getItemCoordinates(item, context)
    const { width, height } = unitCardDescription
    const shift = getHoverShift({ x, y: y - height / 2, width, height, zoom: 2 })
    return ['translateZ(20em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)', ...shift]
  }

  placeItem(item: MaterialItem, context: ItemContext): string[] {
    // The card chosen to be placed comes out of the fan, in front of the next cards. Not too far: the pointer that has just
    // chosen it stays on its button, not on the card, which would zoom and hide the kingdom
    return placeAtPanelWhenHidden(this, item, context, () => [...super.placeItem(item, context), ...(item.selected ? ['translate3d(0, -1em, 2em)'] : [])])
  }
}

/**
 * Where a card is dropped to go back to the hand (a card laid in the kingdom this turn): the whole fan, from its first
 * card to its last, and at least two cards wide when the hand is nearly empty
 */
class HandDropArea extends DropAreaDescription {
  constructor(private readonly locator: PlayerUnitHandLocator) {
    super({ width: unitCardDescription.width * 2, height: unitCardDescription.height + 2, borderRadius: unitCardDescription.borderRadius })
  }

  getLocationSize(location: Location, context: MaterialContext) {
    const count = this.locator.countItems(location, context)
    const { width, height } = unitCardDescription
    if (count < 2) return { width: width * 2, height: height + 2 }
    const first = this.locator.getLocationCoordinates(location, context, 0)
    const last = this.locator.getLocationCoordinates(location, context, count - 1)
    return { width: Math.max(width * 2, Math.abs(last.x - first.x) + width + 1), height: height + 2 + Math.abs(last.y - first.y) }
  }
}

export const playerUnitHandLocator = new PlayerUnitHandLocator()
