import { PileLocator } from '@gamepark/react-game'

export class ScoreBoard extends PileLocator {
  coordinates = { x: -20, y: -30, z: 0 }
  radius = 2


}

export const scoreBoard = new ScoreBoard()