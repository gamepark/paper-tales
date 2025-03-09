import { ItemContext, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location, XYCoordinates } from '@gamepark/rules-api'

export class AgeStockLocator extends PileLocator {
    getRadius(_location: Location, context: MaterialContext): number | XYCoordinates {
      const players = context.rules.players.length
      if (players === 2){
        return {x:0.5, y:10}
      } else if (players === 3){
        return {x:5, y:0.5}
      } else if (players === 4){
        return {x:3, y:4}
      } else {
        return {x:9, y:0.5}
      }
    }
  

  getCoordinates(_location: Location, context: ItemContext) {
    const players = context.rules.players.length
    return players === 2 ? { x: 9, y: -30 } : players === 3 ? { x: 0, y: -15 } : players === 4 ? { x: 13, y: 14 }  : { x: 0, y: 5 }    // TD > 4
  }

}

export const ageStockLocator = new AgeStockLocator()