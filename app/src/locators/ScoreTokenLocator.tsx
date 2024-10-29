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
  { x: 9, y: 8 }, // 0 
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
  { x: 7, y: 35 }, // 20
  { x: 17, y: 35 }, // 21
  { x: 27, y: 35 }, // 22
  { x: 38, y: 35 }, // 23
  { x: 48, y: 36 }, // 24
  { x: 58, y: 35 }, // 25
  { x: 67, y: 35 }, // 26
  { x: 76, y: 35 }, // 27
  { x: 85, y: 35 }, // 28
  { x: 94, y: 36 }, // 29
  { x: 94, y: 49 }, // 30
  { x: 85, y: 49 }, // 31
  { x: 75, y: 49 }, // 32
  { x: 66, y: 49 }, // 33
  { x: 58, y: 49 }, // 34
  { x: 48, y: 49 }, // 35
  { x: 38, y: 49 }, // 36
  { x: 28, y: 49 }, // 37
  { x: 18, y: 49 }, // 38
  { x: 9, y: 50 }, // 39
  { x: 8, y: 62 }, // 40
  { x: 17, y: 62 }, // 41
  { x: 25, y: 62 }, // 42
  { x: 34, y: 62 }, // 43
  { x: 43, y: 62 }, // 44
  { x: 53, y: 62 }, // 45
  { x: 62, y: 62 }, // 46
  { x: 71, y: 62 }, // 47
  { x: 79, y: 62 }, // 48
  { x: 87, y: 62 }, // 49
  { x: 94, y: 64 }, // 50
  { x: 94, y: 76 }, // 51
  { x: 85, y: 76 }, // 52
  { x: 75, y: 76 }, // 53
  { x: 67, y: 76 }, // 54
  { x: 57, y: 76 }, // 55
  { x: 48, y: 76 }, // 56
  { x: 38, y: 76 }, // 57
  { x: 28, y: 76 }, // 58
  { x: 18, y: 76 }, // 59
  { x: 8, y: 77 }, // 60
]




