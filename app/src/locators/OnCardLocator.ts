import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { ItemContext, ParentFace, PileLocator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { getKingdomScale, scaleTransform } from './TableLayout'

/**
 * Age tokens on a unit: same scale as the unit, laid on its front, so that they turn with the card and hide behind it
 * when it turns face down
 */
class OnCardLocator extends PileLocator {
  parentItemType = MaterialType.Unit
  radius = 1
  positionOnParent = { x: 50, y: 40 }
  itemParentFace = ParentFace.Front

  placeItem(item: MaterialItem, context: ItemContext) {
    const unit = context.rules.material(MaterialType.Unit).getItem(item.location.parent!)
    return [...super.placeItem(item, context), ...scaleTransform(getKingdomScale(context, unit.location.player))]
  }
}

export const onCardLocator = new OnCardLocator()
