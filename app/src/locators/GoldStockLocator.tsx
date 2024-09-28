import { PileLocator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'

export class GoldStockLocator extends PileLocator {
  coordinates = { x: -50, y: -25, z: 0 }
  radius = 2

  getPileId(item: MaterialItem) {
    return item.id
  }
}

export const goldStockLocator = new GoldStockLocator()