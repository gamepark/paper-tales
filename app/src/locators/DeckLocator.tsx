import { DeckLocator } from '@gamepark/react-game'

export class UnitDeckLocator extends DeckLocator {
  // Top strip y=-15 — pos 1/5 : x=-25 → spans x:[-30, -20] (card 10w).
  coordinates = { x: -25, y: -15 }
  limit = 15
}

export const unitDeckLocator = new UnitDeckLocator()
