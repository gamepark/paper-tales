import { ItemContext, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location, XYCoordinates } from '@gamepark/rules-api'

export class AgeStockLocator extends PileLocator {
    getRadius(_location: Location, context: MaterialContext): number | XYCoordinates {
      const players = context.rules.players.length
      if (players === 2){
        return {x:0.5, y:10}
      } else {
        return {x:0.5, y:10}
      }
    }
  

  getCoordinates(_location: Location, context: ItemContext) {
    const players = context.rules.players.length
    return players === 2 ? { x: 9, y: -30 } : players === 3 ? { x: 9, y: -30 } : { x: 58, y: -9 }    // TD > 4
  }

}

export const ageStockLocator = new AgeStockLocator()