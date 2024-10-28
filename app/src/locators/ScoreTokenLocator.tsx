import { PileLocator } from '@gamepark/react-game'

export class ScoreTokenLocator extends PileLocator {
  coordinates = { x: 20, y: -30, z: 10 }
  radius = 2

}

export const scoreTokenLocator = new ScoreTokenLocator()