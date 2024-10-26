import { Locator } from '@gamepark/react-game'

export class ScoreBoardLocator extends Locator {
  coordinates = { x: 0, y: -10, z: 0 }
}

export const scoreBoardLocator = new ScoreBoardLocator()