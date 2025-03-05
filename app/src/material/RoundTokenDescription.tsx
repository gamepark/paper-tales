import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { BoardDescription } from '@gamepark/react-game'
import timebook1 from '../images/time/time1.png'
import timebook2 from '../images/time/time2.png'
import timebook3 from '../images/time/time3.png'
import timebook4 from '../images/time/time4.png'

import { TimeTokenHelp } from './help/TimeTokenHelp'


class RoundTokenDescription extends BoardDescription {
    width = 14
    ratio = 1.2
    location = { type: LocationType.Time }

    images = {
        [1]:timebook1,
        [2]:timebook2,
        [3]:timebook3,
        [4]:timebook4,
    }

    help = TimeTokenHelp

}

export const roundTokenDescription = new RoundTokenDescription()