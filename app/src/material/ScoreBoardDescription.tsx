import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { BoardDescription } from '@gamepark/react-game'
import score_board from '../images/score/score_board.jpg'


export class ScoreBoardDescription extends BoardDescription {
    width = 40
    height = 32
    image = score_board


    staticItem = { location: { type: LocationType.ScoreBoard } }
}





export const scoreBoardDescription = new ScoreBoardDescription()