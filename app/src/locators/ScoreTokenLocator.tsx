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

    //scoreBoardDescription.getPlayerScoreBoard().location:{type:LocationType.ScoreBoard}
    // {location:{type:LocationType.ScoreBoard}}
}


export const scoreTokenLocator = new ScoreTokenLocator()




export const scoreCasesCoordinates: XYCoordinates[] = [
  { x: 10, y: 10 }, // 0
  { x: 43.05, y: 16.95 }, // 1
  { x: 52.45, y: 22.3 }, // 2
  { x: 61.8, y: 16.95 }, // 3
  { x: 71.25, y: 11.45 }, // 4
  { x: 24.25, y: 17 }, // 5
  { x: 33.75, y: 22.35 }, // 6
  { x: 43.2, y: 27.8 }, // 7
  { x: 52.5, y: 33 }, // 8
  { x: 61.8, y: 27.7 }, // 9
  { x: 71.2, y: 22.2 }, // 10
  { x: 80.6, y: 16.8 }, // 11
  { x: 14.85, y: 22.35 }, // 12
  { x: 24.25, y: 27.8 }, // 13
  { x: 33.65, y: 33.15 }, // 14
  { x: 43.1, y: 38.5 }, // 15
  { x: 52.55, y: 43.9 }, // 16
  { x: 61.9, y: 38.4 }, // 17
  { x: 71.3, y: 33.1 }, // 18
  { x: 80.6, y: 27.5 }, // 19
  { x: 14.9, y: 33.1 }, // 20
  { x: 24.25, y: 38.5 }, // 21
  { x: 33.65, y: 43.85 }, // 22
  { x: 43.1, y: 49.2 }, // 23
  { x: 61.9, y: 49.1 }, // 24
  { x: 71.2, y: 43.8 }, // 25
  { x: 80.6, y: 38.35 } // 26
]




