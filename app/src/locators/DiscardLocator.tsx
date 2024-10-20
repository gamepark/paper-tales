import { PileLocator } from '@gamepark/react-game'

export class DiscardLocator extends PileLocator {
  coordinates = { x: 6, y: -30, z: 0 }
  delta = { x: -0.05, y: -0.05, z: 0.1 }

  maxAngle = 10


}

export const discardLocator = new DiscardLocator()