import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { TokenDescription } from '@gamepark/react-game'
import token_round from '../images/tokens/token_round.png'
import { TimeTokenHelp } from './help/TimeTokenHelp'


class RoundTokenDescription extends TokenDescription {
    width = 4
    ratio = 1
    location = { type: LocationType.Time }

    image = token_round

    help = TimeTokenHelp

}

export const roundTokenDescription = new RoundTokenDescription()