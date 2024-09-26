/** @jsxImportSource @emotion/react */
import { PileLocator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'

class PlayerGoldStockLocator extends PileLocator {
  radius = 2
  // TODO: better management of animations + limits ?
  limit = 1000



  getPileId(item: MaterialItem) {
    return `${item.location.player}-${item.id}`
  }
}

export const playerGoldStockLocator = new PlayerGoldStockLocator()