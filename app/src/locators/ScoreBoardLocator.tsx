import { FlexLocator } from '@gamepark/react-game'

export class ScoreBoardLocator extends FlexLocator {
  coordinates = { x: 0, y: -5, z: 0 }
}

export const scoreBoardLocator = new ScoreBoardLocator()