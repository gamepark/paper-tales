import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { TokenDescription } from '@gamepark/react-game'
import token_round from '../images/tokens/token_round.png'


class RoundTokenDescription extends TokenDescription {
    width = 4
    ratio = 1
    location = { type: LocationType.Time }

    image = token_round

}

export const roundTokenDescription = new RoundTokenDescription()