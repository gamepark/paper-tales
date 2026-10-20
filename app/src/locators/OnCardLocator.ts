import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { ItemContext, PileLocator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { getKingdomScale, scaleTransform } from './TableLayout'

/**
 * Age tokens on a unit: same scale as the unit
 */
class OnCardLocator extends PileLocator {
  parentItemType = MaterialType.Unit
  radius = 1
  positionOnParent = { x: 50, y: 40 }

  placeItem(item: MaterialItem, context: ItemContext) {
    const unit = context.rules.material(MaterialType.Unit).getItem(item.location.parent!)
    return [...super.placeItem(item, context), ...scaleTransform(getKingdomScale(context, unit.location.player))]
  }
}

export const onCardLocator = new OnCardLocator()
