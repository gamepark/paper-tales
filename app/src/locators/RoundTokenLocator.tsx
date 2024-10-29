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
  { x: 0, y: 0 }, // 0 
  { x: 20, y: 92 }, // 1
  { x: 40, y: 92 }, // 2
  { x: 59, y: 92 }, // 3
  { x: 79, y: 92 }, // 4

]




