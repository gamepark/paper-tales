import { Locator, } from '@gamepark/react-game'
import { Coordinates } from '@gamepark/rules-api'

export class RoundTokenLocator extends Locator {

  coordinates: Partial<Coordinates> = {x:0, y:-7}

}

export const roundTokenLocator = new RoundTokenLocator()