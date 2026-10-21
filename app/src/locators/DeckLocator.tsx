import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { DeckLocator, ItemContext, LocationDescription } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import { COMMON_SCALE, deckCoordinates, scaleTransform } from './TableLayout'

/**
 * The deck, reduced, in the right column of the table. Its outline stays when it is empty.
 */
export class UnitDeckLocator extends DeckLocator {
  coordinates = deckCoordinates
  limit = 12
  gap = { x: -0.03, y: -0.03 }
  location = { type: LocationType.Deck }
  // Face-down cards all alike: no page to turn from one to the other in the help
  navigationSorts = []
  locationDescription = new PileOutlineDescription()

  placeItem(item: MaterialItem, context: ItemContext) {
    return [...super.placeItem(item, context), ...scaleTransform(COMMON_SCALE)]
  }
}

export class PileOutlineDescription extends LocationDescription {
  width = unitCardDescription.width * COMMON_SCALE
  height = unitCardDescription.height * COMMON_SCALE
  borderRadius = unitCardDescription.borderRadius * COMMON_SCALE
  extraCss = css`
    border: 0.15em dashed rgba(255, 255, 255, 0.45);
  `
}

export const unitDeckLocator = new UnitDeckLocator()
