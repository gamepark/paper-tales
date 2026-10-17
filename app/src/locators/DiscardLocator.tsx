import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { DeckLocator, DropAreaDescription, ItemContext } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import { COMMON_SCALE, discardCoordinates, scaleTransform } from './TableLayout'

/**
 * The discard pile, face down (rulebook p.3), darkened by UnitCardDescription to tell it from the deck. Its outline
 * stays when it is empty. During the deployment, the cards I discard (keep a single card, p.5) are dropped right on it.
 */
export class DiscardLocator extends DeckLocator {
  coordinates = discardCoordinates
  limit = 12
  gap = { x: -0.03, y: -0.03 }
  location = { type: LocationType.Discard }
  locationDescription = new DiscardPileDescription()

  placeItem(item: MaterialItem, context: ItemContext) {
    return [...super.placeItem(item, context), ...scaleTransform(COMMON_SCALE)]
  }
}

class DiscardPileDescription extends DropAreaDescription {
  width = unitCardDescription.width * COMMON_SCALE
  height = unitCardDescription.height * COMMON_SCALE
  borderRadius = unitCardDescription.borderRadius * COMMON_SCALE
  extraCss = css`
    border: 0.15em dashed rgba(255, 255, 255, 0.45);
  `
}

export const discardLocator = new DiscardLocator()
