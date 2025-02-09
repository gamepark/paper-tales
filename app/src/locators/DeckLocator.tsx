import { DeckLocator, ItemContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'

export class UnitDeckLocator extends DeckLocator {
  delta = { x: -0.05, y: -0.05, z: 0.1 }


  getCoordinates(_location: Location, context: ItemContext) {
    const players = context.rules.players.length
    return players === 2 ? { x: -6, y: -30 } : players === 3 ? { x: -20, y: -35 } : { x: 58, y: -9 }    // TD > 4
  }
}



export const unitDeckLocator = new UnitDeckLocator()