/** @jsxImportSource @emotion/react */
import { ItemContext, PileLocator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { isNotViewedPlayerItem } from '../view/viewHelpers'

class PlayerGoldStockLocator extends PileLocator {
  hide(item: MaterialItem, context: ItemContext): boolean {
    return isNotViewedPlayerItem(item, context)
  }

  radius = { x: 2, y: 2 }
  limit = 100
  // Au-dessus du board (qui débute à y=-12.1), à droite du top strip (qui finit à x=14).
  // Pile r=2 → spans x:[33, 37], y:[-12, -8]. Bien isolée des autres éléments.
  coordinates = { x: 35, y: -10 }

  getPileId(item: MaterialItem) {
    return `${item.location.player}-${item.id}`
  }
}

export const playerGoldStockLocator = new PlayerGoldStockLocator()
