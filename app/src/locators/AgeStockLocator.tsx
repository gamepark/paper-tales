import { PileLocator } from '@gamepark/react-game'

export class AgeStockLocator extends PileLocator {
  coordinates = { x: -50, y: -18, z: 0 }
  radius = 2

}

export const ageStockLocator = new AgeStockLocator()