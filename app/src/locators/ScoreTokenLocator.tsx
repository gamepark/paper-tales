import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Locator } from '@gamepark/react-game'
import { Location, XYCoordinates } from '@gamepark/rules-api'
import { scoreBoardDescription } from '../material/ScoreBoardDescription'

export class ScoreTokenLocator extends Locator {

  parentItemType = MaterialType.ScoreBoard

  getPositionOnParent(location: Location) {
    return scoreCasesCoordinates[location.x!]
  }

  getParentItem = (_location: Location) => scoreBoardDescription.getPlayerScoreBoard()
}


export const scoreTokenLocator = new ScoreTokenLocator()




export const scoreCasesCoordinates: XYCoordinates[] = [
  { x: 8, y: 23 }, // 0 
  { x: 21, y: 8 }, // 1
  { x: 30, y: 8 }, // 2
  { x: 40, y: 8 }, // 3
  { x: 49, y: 8 }, // 4
  { x: 58, y: 8 }, // 5
  { x: 67, y: 8 }, // 6
  { x: 76, y: 8 }, // 7
  { x: 85, y: 8 }, // 8
  { x: 94, y: 9 }, // 9
  { x: 94, y: 22 }, // 10
  { x: 84, y: 22 }, // 11
  { x: 75, y: 22 }, // 12
  { x: 66, y: 22 }, // 13
  { x: 58, y: 22 }, // 14
  { x: 48, y: 22 }, // 15
  { x: 38, y: 22 }, // 16
  { x: 28, y: 22 }, // 17
  { x: 18, y: 22 }, // 18
  { x: 8, y: 23 }, // 19
  { x: 0, y: 0 }, // 20
  { x: 0, y: 0 }, // 21
  { x: 0, y: 0 }, // 22
  { x: 0, y: 0 }, // 23
  { x: 0, y: 0 }, // 24
  { x: 0, y: 0 }, // 25
  { x: 0, y: 0 } // 26
]




