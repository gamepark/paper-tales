import { Locator, MaterialContext } from "@gamepark/react-game";
import { Location } from "@gamepark/rules-api";

export class PlayerHandLocator extends Locator {

    getCoordinates(_location: Location, _context: MaterialContext) {
        return {x: -10, y: 10, z:0}
    }

}

export const playerHandLocator = new PlayerHandLocator()