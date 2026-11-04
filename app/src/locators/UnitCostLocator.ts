import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { LocationDescription, Locator } from '@gamepark/react-game'

/** The printed coin of a unit, in % of the card, and its size in em (see artifactCostPosition, its mirror) */
const printedCoin = { x: 15.3, y: 10.4, size: 2 }

/**
 * The recruitment cost printed on a unit, which a step of the tutorial points at: only a zone for the focus, which darkens
 * the rest of the card
 */
class UnitCostLocator extends Locator {
  parentItemType = MaterialType.Unit
  positionOnParent = { x: printedCoin.x, y: printedCoin.y }
  locationDescription = new UnitCostDescription()
}

class UnitCostDescription extends LocationDescription {
  width = printedCoin.size
  height = printedCoin.size
  borderRadius = printedCoin.size / 2
}

export const unitCostLocator = new UnitCostLocator()
