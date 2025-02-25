import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { RoundTokenDescription } from '@gamepark/react-game'
import AgeToken from '../images/tokens/Age.jpg'
import { AgeTokenHelp } from './help/AgeTokenHelp'

class AgeTokenDescription extends RoundTokenDescription {
  image = AgeToken
  diameter = 2

  stockLocation = { type: LocationType.AgeStock}

  staticItems = [
    { id: 1, quantity: 40, location: this.stockLocation },
  ]

  help = AgeTokenHelp

}

export const ageTokenDescription = new AgeTokenDescription()