import { LocationType } from "@gamepark/paper-tales/material/LocationType";
import { MaterialType } from "@gamepark/paper-tales/material/MaterialType";
import { DropAreaDescription, HandLocator, ItemContext } from "@gamepark/react-game";
import { MaterialItem } from "@gamepark/rules-api";



export class PlayerBuildingHandLocator extends HandLocator {

    locationDescription = new DropAreaDescription({ width: 20, height: 8, borderRadius: 0.4 })

    coordinates = { x: -40, y: 5, z: 0 }
    radius = 2
  
    getItemIndex(item: MaterialItem, context: ItemContext): number {
        if (item.location.player === context.player) {
          const cards = context.rules.material(MaterialType.Building).location(LocationType.PlayerBuildingHand).player(context.player).getItems().map(item => item.id)
          cards.sort((a, b) => a - b)
          return cards.indexOf(item.id)
        } else {
          return super.getItemIndex(item, context)
        }
      }

}



