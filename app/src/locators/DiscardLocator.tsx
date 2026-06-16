import { DeckLocator } from '@gamepark/react-game'

export class DiscardLocator extends DeckLocator {
  limit = 15
  // Top strip y=-15 — pos 2/5 : x=-13 → spans x:[-18, -8] (card 10w).
  // Gap deck/discard : 2em (deck right edge -20, discard left edge -18).
  coordinates = { x: -13, y: -15 }
}

export const discardLocator = new DiscardLocator()
