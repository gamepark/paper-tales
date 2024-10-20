import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { RoundTokenDescription } from '@gamepark/react-game'
import AgeToken from '../images/tokens/Age.jpg'

class AgeTokenDescription extends RoundTokenDescription {
  image = AgeToken
  diameter = 2

  stockLocation = { type: LocationType.AgeStock}

  staticItems = [
    { id: 1, quantity: 10, location: this.stockLocation },
  ]

}

export const ageTokenDescription = new AgeTokenDescription()