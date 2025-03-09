import { Locator, MaterialContext, } from '@gamepark/react-game'
import { Coordinates, Location } from '@gamepark/rules-api'

export class RoundTokenLocator extends Locator {

  getCoordinates(_location: Location, context: MaterialContext): Partial<Coordinates> {
    switch (context.rules.players.length){
      case 2 :
        return {x:0, y:-24}
      case 3 :
        return {x:0, y:-24}
      case 4 :
        return {x:0, y:14}
      case 5 :
      default :
        return {x:0, y:-3}
    }
  }

}

export const roundTokenLocator = new RoundTokenLocator()