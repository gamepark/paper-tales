import { PileLocator } from '@gamepark/react-game'
import { goldStockCoordinates } from './TableLayout'

/**
 * The gold reserve, drawn as a small heap of 1 and 5 coins mixed: coins gained fly from here
 */
export class GoldStockLocator extends PileLocator {
  coordinates = goldStockCoordinates
  radius = 1.5
  limit = 8
}

export const goldStockLocator = new GoldStockLocator()
