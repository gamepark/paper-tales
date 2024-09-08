import { CardDescription } from "@gamepark/react-game";
import pt_integral_cards_back_fr from '../images/units/pt_integral_cards_back_fr.jpg'
import pt_integral_cards_front_fr27 from '../images/units/pt_integral_cards_front_fr27.jpg'

import { Unit } from '@gamepark/paper-tales/material/Unit'

export class RegionCardDescription extends CardDescription {
    height = 7
    width = 7
    borderRadius = 0.5

backImage = pt_integral_cards_back_fr

//Image en FR.

images = {
    [Unit.Commander] : pt_integral_cards_front_fr27,

}



}
