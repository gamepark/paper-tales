import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { DropAreaDescription, ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'

/** From the centre of a token to the next one, in em: tokens of 2 em, side by side with a thin gap */
const TOKEN_STEP = 2.15
/** The tokens of a line */
const LINE_TOKENS = 4
/** A line of tokens stays inside the card: past this width, they overlap */
const LINE_MAX_WIDTH = (LINE_TOKENS - 1) * TOKEN_STEP

/**
 * Age tokens on a unit: under the banner of its name, centred on the card, on a second line when they do not fit, and
 * closer together past 2 full lines: the picture is all they cover, even on the cards with the longest effects, and they
 * are counted at a glance. Laid on the card, they take its transform and so its scale (the neighbours view draws the
 * units smaller); nothing is added. When a token can be moved from a unit to another one (the Wizard Apprentice), each
 * unit it can go to is a drop area as large as the card.
 */
class OnCardLocator extends Locator {
  parentItemType = MaterialType.Unit
  positionOnParent = { x: 50, y: 25 }

  getPositionDependencies(location: Location, context: MaterialContext) {
    return this.countItems(location, context)
  }

  /** Above the drop area of their card, which shares their place: the tokens stay under the pointer to be dragged */
  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    const count = item.quantity ?? 1
    const firstLine = Math.max(LINE_TOKENS, Math.ceil(count / 2))
    const line = context.displayIndex < firstLine ? 0 : 1
    const column = line === 0 ? context.displayIndex : context.displayIndex - firstLine
    const lineCount = line === 0 ? Math.min(count, firstLine) : count - firstLine
    const step = Math.min(TOKEN_STEP, LINE_MAX_WIDTH / (firstLine - 1))
    return {
      x: (column - (lineCount - 1) / 2) * step,
      y: line * TOKEN_STEP,
      z: 1 + context.displayIndex * 0.05
    }
  }

  locationDescription = new UnitDropArea()
}

/**
 * The whole card receives the token: the area is centred on the card, not on the tokens. The token of the Wizard
 * Apprentice is dragged only: no click on a unit to move it there, and so no shine on the units while nothing is dragged.
 */
class UnitDropArea extends DropAreaDescription {
  constructor() {
    super(unitCardDescription)
  }

  canLongClick() {
    return false
  }

  positionOnParent = { x: 50, y: 50 }
}

export const onCardLocator = new OnCardLocator()
