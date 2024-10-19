import { PileLocator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'

export class GoldStockLocator extends PileLocator {
  coordinates = { x: -20, y: -30, z: 0 }
  radius = 2

  getPileId(item: MaterialItem) {
    return item.id
  }
}

export const goldStockLocator = new GoldStockLocator()