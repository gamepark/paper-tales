import { Locator } from '@gamepark/react-game'

export class RoundTokenLocator extends Locator {
  // Top strip y=-15 — pos 4/5 : x=5 → spans x:[3.5, 6.5] (token ~3w).
  // Gap age/round : 2em.
  coordinates = { x: 5, y: -15 }
}

export const roundTokenLocator = new RoundTokenLocator()
