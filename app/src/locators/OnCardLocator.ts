import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { DropAreaDescription, ItemContext, PileLocator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'

/**
 * Age tokens on a unit: laid on the card, they take its transform and so its scale (the neighbours view draws the units
 * smaller); nothing is added. When a token can be moved from a unit to another one (the Wizard Apprentice), each unit it
 * can go to is a drop area as large as the card.
 */
class OnCardLocator extends PileLocator {
  parentItemType = MaterialType.Unit
  radius = 1
  positionOnParent = { x: 50, y: 40 }

  /** Above the drop area of their card, which shares their place: the tokens stay under the pointer to be dragged */
  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    const coordinates = super.getItemCoordinates(item, context)
    return { ...coordinates, z: (coordinates.z ?? 0) + 1 }
  }

  locationDescription = new UnitDropArea()
}

/**
 * The whole card receives the token: the area is centred on the card, not on the pile of tokens. The token of the Wizard
 * Apprentice is dragged only: no click on a unit to move it there, and so no shine on the units while nothing is dragged.
 */
class UnitDropArea extends DropAreaDescription {
  constructor() {
    super(unitCardDescription)
  }

  canLongClick() {
    return false
  }

  // Centred on the card, whereas the tokens lie a little higher on it (see OnCardLocator.positionOnParent)
  positionOnParent = { x: 50, y: 50 }
}

export const onCardLocator = new OnCardLocator()
