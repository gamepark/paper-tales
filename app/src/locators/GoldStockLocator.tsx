import { ItemContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'

export class GoldStockLocator extends PileLocator {
  radius = 2

  getPileId(item: MaterialItem) {
    return item.id
  }


  getCoordinates(_location: Location, context: ItemContext) {
    const players = context.rules.players.length
    return players === 2 ? { x: -20, y: -30 } : players === 3 ? { x: -60, y: -10 } : { x: 58, y: -9 }    // TD > 4
  }

}

export const goldStockLocator = new GoldStockLocator()