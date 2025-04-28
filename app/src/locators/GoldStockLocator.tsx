import { ItemContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import { unitDeckLocator } from './DeckLocator'

export class GoldStockLocator extends PileLocator {

  radius = 3

  getCoordinates(location: Location, context: ItemContext) {
    const { x = 0, y = 0 } = unitDeckLocator.getCoordinates(location, context)
    if (context.rules.players.length === 2) return { x: x + unitCardDescription.width * 2 + 2, y: y - 3.5 }
    return { x: x, y: y - unitCardDescription.height + 0.5 }
  }

  getPileId(item: MaterialItem) {
    return item.id
  }
}

export const goldStockLocator = new GoldStockLocator()
