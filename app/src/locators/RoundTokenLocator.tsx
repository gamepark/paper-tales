import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Locator } from '@gamepark/react-game'
import { Location, XYCoordinates } from '@gamepark/rules-api'
import { scoreBoardDescription } from '../material/ScoreBoardDescription'

export class RoundTokenLocator extends Locator {

  parentItemType = MaterialType.ScoreBoard

  getPositionOnParent(location: Location) {
    return scoreCasesCoordinates[location.x!]
  }

  getParentItem = (_location: Location) => scoreBoardDescription.getPlayerScoreBoard()
}


export const roundTokenLocator = new RoundTokenLocator()


export const scoreCasesCoordinates: XYCoordinates[] = [
  { x: 90, y: 8 }, // 0 
  { x: 21, y: 8 }, // 1
  { x: 30, y: 8 }, // 2
  { x: 40, y: 8 }, // 3
  { x: 49, y: 8 }, // 4

]




