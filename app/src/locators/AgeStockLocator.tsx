import { PileLocator } from '@gamepark/react-game'
import { ageStockCoordinates } from './TableLayout'

/**
 * The Age tokens reserve, drawn as a small heap: tokens placed on units fly from here
 */
export class AgeStockLocator extends PileLocator {
  coordinates = ageStockCoordinates
  radius = 1.5
  limit = 8
}

export const ageStockLocator = new AgeStockLocator()
