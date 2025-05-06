import { DeckLocator, ItemContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'

export class UnitDeckLocator extends DeckLocator {
  coordinates = { x: -20, y: -15 }
  limit = 15

  getCoordinates(_location: Location, context: ItemContext) {
    if (context.rules.players.length === 2) return { x: 0, y: -15 }
    const { x, y } = { x: -20, y: -11 }
    return { x, y: y + unitCardDescription.height + 0.5 }
  }
}

export const unitDeckLocator = new UnitDeckLocator()
