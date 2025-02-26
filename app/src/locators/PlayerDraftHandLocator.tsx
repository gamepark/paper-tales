
import { getRelativePlayerIndex, HandLocator, ItemContext, MaterialContext } from "@gamepark/react-game";
import { Location, MaterialItem } from "@gamepark/rules-api";
import { playerPositions, Position } from "./TableauLocator";
import { MaterialType } from "@gamepark/paper-tales/material/MaterialType";
import { LocationType } from "@gamepark/paper-tales/material/LocationType";

export class PlayerDraftHandLocator extends HandLocator {

  

    getCoordinates(location: Location, context: ItemContext) {
      const playerIndex = getRelativePlayerIndex(context, location.player)
      const position = playerPositions[context.rules.players.length - 2][playerIndex]
      const players = context.rules.players.length
      switch (position) {
        case Position.TopLeft:
          return { x: -48, y: -40 }   // TDB
        case Position.TopCenter:
          return { x: 50, y: -35 }    // TDB 
        case Position.TopRight:
          return { x: 80, y: -33 }    // TDB
        case Position.BottomLeft:
          return players === 2 ? { x: -36 , y: 6 } : players === 3 ? { x: -35, y: 6 } : { x: -48, y: -9 }    // TDB > 2
        case Position.BottomRight:
          return players === 2 ? { x: 36 , y: 6 } : players === 3 ? { x: 80, y: 15 } : { x: 58, y: -9 }    // TD > 2
      }
    }

    getHoverTransform(_item: MaterialItem<number, number>, _context: ItemContext<number, number, number>): string[] {
      return ['translateZ(10em)', "translateY(-5em)","rotateZ(0".concat(this.rotationUnit, ")"), 'scale(2)'];
    }

    getRadius(location: Location<number, number>, context: MaterialContext): number {
      const handLength:number = context.rules.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(location.player).getQuantity()
      return handLength === 0 ? 100 : Math.min((7.5/handLength) * 70, 90)
    }

    getBaseAngle(location: Location<number, number>, context: MaterialContext<number, number, number>): number {
      const playerIndex = getRelativePlayerIndex(context, location.player)
      const position = playerPositions[context.rules.players.length - 2][playerIndex]
      const players = context.rules.players.length
      switch (position) {
        case Position.TopLeft:
          return 0  // TDB
        case Position.TopCenter:
          return 0    // TDB 
        case Position.TopRight:
          return -90    // TDB
        case Position.BottomLeft:
          return 0
        case Position.BottomRight:
          return players === 2 ? 0 : players === 3 ? -90 : 0    // TD > 2
      }
      
    }

}

export const playerDraftHandLocator = new PlayerDraftHandLocator()