import { getRelativePlayerIndex, HandLocator, MaterialContext } from "@gamepark/react-game";
import { Location } from "@gamepark/rules-api";

export class PlayerDraftHandLocator extends HandLocator {

    getCoordinates(location: Location, context: MaterialContext) {
        const player = getRelativePlayerIndex(context, location.player)
        console.log(player)
        return {x: -40 + 40*player, y: 20, z:0}
    }

}

export const playerDraftHandLocator = new PlayerDraftHandLocator()