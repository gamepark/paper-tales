import { PileLocator } from '@gamepark/react-game'

export class AgeStockLocator extends PileLocator {
  coordinates = { x: 20, y: -30, z: 0 }
  radius = 2

}

export const ageStockLocator = new AgeStockLocator()