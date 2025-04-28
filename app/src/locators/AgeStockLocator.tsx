import { ItemContext, PileLocator } from '@gamepark/react-game'
import { Location } from '../../../../rules-api/src'
import { unitCardDescription } from '../material/UnitCardDescription'
import { unitDeckLocator } from './DeckLocator'

export class AgeStockLocator extends PileLocator {
  radius = 2.5

  getCoordinates(location: Location, context: ItemContext) {
    const { x = 0, y = 0 } = unitDeckLocator.getCoordinates(location, context)
    if (context.rules.players.length === 2) return { x: x + unitCardDescription.width * 3 + 3, y: y - 3.5 }
    return { x: x, y:  y - unitCardDescription.height * 2.3 + 0.5 }
  }
}

export const ageStockLocator = new AgeStockLocator()
