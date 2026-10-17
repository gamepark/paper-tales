import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { BoardDescription } from '@gamepark/react-game'
import timebook1 from '../images/time/time1.png'
import timebook2 from '../images/time/time2.png'
import timebook3 from '../images/time/time3.png'
import timebook4 from '../images/time/time4.png'

import { TokenBookHelpDisplay } from './help/book/BookHelpDisplay'
import { TimeTokenHelp } from './help/TimeTokenHelp'

/** The turn counter: not on the table (the side column draws it), it carries the help of the turn and its image */
class RoundTokenDescription extends BoardDescription {
  width = 7
  transparency = true
  ratio = 1.2
  location = { type: LocationType.Time }

  images = {
    1: timebook1,
    2: timebook2,
    3: timebook3,
    4: timebook4
  }

  help = TimeTokenHelp
  helpDisplay = TokenBookHelpDisplay
}

export const roundTokenDescription = new RoundTokenDescription()
