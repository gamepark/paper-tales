import { ItemContext, PileLocator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'

export class DiscardLocator extends PileLocator {
  delta = { x: -0.05, y: -0.05, z: 0.1 }

  maxAngle = 10

  getCoordinates(_location: Location, context: ItemContext) {
    const players = context.rules.players.length
    return players === 2 ? { x: 0, y: -21 } : players === 3 ? { x: 0, y: 0 } : { x: 58, y: -9 }    // TD > 4
  }

}

export const discardLocator = new DiscardLocator()