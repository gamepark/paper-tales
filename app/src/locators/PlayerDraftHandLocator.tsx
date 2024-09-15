import { LocationType } from "@gamepark/paper-tales/material/LocationType";
import { MaterialType } from "@gamepark/paper-tales/material/MaterialType";
import { getRelativePlayerIndex, HandLocator, ItemContext, MaterialContext } from "@gamepark/react-game";
import { Location, MaterialItem } from "@gamepark/rules-api";

export class PlayerDraftHandLocator extends HandLocator {

    getCoordinates(location: Location, context: MaterialContext) {
        const player = getRelativePlayerIndex(context, location.player)
        return {x: -40 + 40*player, y: 20, }
    }

    getItemIndex(item: MaterialItem, context: ItemContext): number {
        if (item.location.player === context.player) {
          const cards = context.rules.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(context.player).getItems().map(item => item.id)
          cards.sort((a, b) => a - b)
          return cards.indexOf(item.id)
        } else {
          return super.getItemIndex(item, context)
        }
      }

}

export const playerDraftHandLocator = new PlayerDraftHandLocator()