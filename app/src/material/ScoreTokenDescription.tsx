import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { TokenDescription } from '@gamepark/react-game'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import pawn_yellow from '../images/pawns/pawn_yellow.png'
import pawn_blue from '../images/pawns/pawn_blue.png'
import pawn_white from '../images/pawns/pawn_white.png'
import pawn_green from '../images/pawns/pawn_green.png'
import pawn_black from '../images/pawns/pawn_black.png'
import pawn_purple from '../images/pawns/pawn_purple.png'
import pawn_red from '../images/pawns/pawn_red.png'

class ScoreTokenDescription extends TokenDescription {
  diameter = 4
  location = { type: LocationType.Pawn}


  images = {
   [PlayerColor.Yellow]: pawn_yellow,
   [PlayerColor.Blue]: pawn_blue,
   [PlayerColor.Green]: pawn_green,
   [PlayerColor.White]: pawn_white,
   [PlayerColor.Black]: pawn_black,
   [PlayerColor.Purple]: pawn_purple,
   [PlayerColor.Red]: pawn_red,

  }


}

export const scoreTokenDescription = new ScoreTokenDescription()