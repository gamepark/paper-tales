import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { DropAreaDescription, ItemContext, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import { getKingdomScale, scaleTransform } from './TableLayout'

/**
 * Age tokens on a unit: same scale as the unit. When a token can be moved from a unit to another one (the Wizard
 * Apprentice), each unit it can go to is a drop area as large as the card (declared by the card, see UnitCardDescription).
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

  placeItem(item: MaterialItem, context: ItemContext) {
    const unit = context.rules.material(MaterialType.Unit).getItem(item.location.parent!)
    return [...super.placeItem(item, context), ...scaleTransform(getKingdomScale(context, unit.location.player))]
  }

  locationDescription = new UnitDropArea()
}

/** The whole card receives the token: the area is centred on the card, not on the pile of tokens */
class UnitDropArea extends DropAreaDescription {
  constructor() {
    super(unitCardDescription)
  }

  getLocationSize(location: Location, context: MaterialContext) {
    const unit = context.rules.material(MaterialType.Unit).getItem(location.parent!)
    const scale = getKingdomScale(context, unit.location.player)
    return { width: unitCardDescription.width * scale, height: unitCardDescription.height * scale }
  }
}

export const onCardLocator = new OnCardLocator()
