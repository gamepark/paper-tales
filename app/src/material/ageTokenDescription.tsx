import { LocationType } from "@gamepark/paper-tales/material/LocationType"
import { TokenDescription } from "@gamepark/react-game"
import AgeToken from '../images/tokens/Age.png'

class AgeTokenDescription extends TokenDescription {
  image = AgeToken
  width = 2
  height = 2

  stockLocation = { type: LocationType.AgeStock}

  staticItems = [
    { id: 1, quantity: 10, location: this.stockLocation },
  ]

}

export const ageTokenDescription = new AgeTokenDescription()