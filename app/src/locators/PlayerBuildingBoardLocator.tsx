import { ItemContext, ListLocator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { isNotViewedPlayerItem } from '../view/viewHelpers'

export class PlayerBuildingBoardLocator extends ListLocator {
  hide(item: MaterialItem, context: ItemContext): boolean {
    return isNotViewedPlayerItem(item, context)
  }

  // Colonne gauche, sous le top strip. Card 14×10, base (-23, 5) :
  // - Level 1 → (-23, 5) spans x:[-30, -16], y:[0, 10]
  // - Level 2 (si présent) → (-23, -5.5) via gap y=-10.5 (stack vers le haut)
  coordinates = { x: -23, y: 5 }
  maxGap = { y: -18 }
  gap = { y: -10.5 }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    if (item.location.player !== context.player) return super.getHoverTransform(item, context)
    return [
      `translateZ(${item.location.rotation ? -20 : 20}em)`,
      `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`,
      'scale(2)',
      'translateY(-25%)'
    ]
  }
}

export const playerBuildingBoardLocator = new PlayerBuildingBoardLocator()
