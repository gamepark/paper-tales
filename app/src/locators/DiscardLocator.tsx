import { DeckLocator } from '@gamepark/react-game'

export class DiscardLocator extends DeckLocator {
  coordinates = { x: 6, y: -30, z: 0 }
  delta = { x: -0.05, y: -0.05, z: 0.1 }
}