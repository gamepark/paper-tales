import { ItemContext, Locator } from '@gamepark/react-game'
import { Location } from '../../../../rules-api/src'

export class RoundTokenLocator extends Locator {
  coordinates = { x: -20, y: -19 }

  getCoordinates(_location: Location, context: ItemContext) {
    if (context.rules.players.length === 2) return { x: 28, y: -11.5 }
    return this.coordinates
  }
}

export const roundTokenLocator = new RoundTokenLocator()
