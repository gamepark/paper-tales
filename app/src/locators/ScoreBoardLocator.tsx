import { ItemContext, Locator } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'

export class ScoreBoardLocator extends Locator {

  getCoordinates(_location: Location, context: ItemContext) {
    const players = context.rules.players.length
    return players === 2 ? { x: 0, y: -5 } : players === 3 ? { x: -50, y: -30 } : players === 4 ? { x: 58, y: -9 } : { x: -50, y: -30 }    // TD > 4
  }

}


export const scoreBoardLocator = new ScoreBoardLocator()