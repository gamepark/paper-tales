import { PileLocator } from '@gamepark/react-game'

export class AgeStockLocator extends PileLocator {
  radius = 2.5
  // Top strip y=-15 — pos 3/5 : x=-1 → spans x:[-3.5, 1.5] (pile r=2.5).
  // Gap discard/age : 1.5em.
  coordinates = { x: -1, y: -15 }
}

export const ageStockLocator = new AgeStockLocator()
