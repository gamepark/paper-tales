import { DeckLocator, ItemContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import { unitDeckLocator } from './DeckLocator'

export class DiscardLocator extends DeckLocator {
  limit = 15

  getCoordinates(location: Location, context: ItemContext) {
    const { x = 0, y = 0 } = unitDeckLocator.getCoordinates(location, context)
    if (context.rules.players.length === 2)
      return { x: x + unitCardDescription.width + 1, y: y }
    return { x, y: y + unitCardDescription.height + 0.5 }
  }
}

export const discardLocator = new DiscardLocator()
