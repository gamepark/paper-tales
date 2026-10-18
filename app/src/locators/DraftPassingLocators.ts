import { ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import {
  getDraftGiver,
  getPanelCenter,
  getPlayerPositionDependencies,
  HIDDEN_HAND_SCALE,
  isAreaDisplayed
} from './TableLayout'

/**
 * A hand on its way to its receiver (the player of the location), face down, small, under a panel, and never shown at
 * rest: only the moves to and from it are seen. Seen from the receiver's area, it is still at the panel of the Monarch
 * who gives it, so that it then comes from there; seen from anywhere else, it has reached the receiver's panel, so that
 * a hand given from the displayed area flies to the panel of its receiver.
 */
export class DraftTransitLocator extends Locator {
  getPositionDependencies(_location: Location, context: MaterialContext) {
    return getPlayerPositionDependencies(context)
  }

  hide() {
    return true
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    const receiver = item.location.player!
    const panel = isAreaDisplayed(context, receiver) ? getDraftGiver(context, receiver) : receiver
    return getPanelCenter(context, panel) ?? {}
  }

  placeItem(item: MaterialItem, context: ItemContext): string[] {
    return [...super.placeItem(item, context), `scale(${HIDDEN_HAND_SCALE})`]
  }
}

export const draftTransitLocator = new DraftTransitLocator()
