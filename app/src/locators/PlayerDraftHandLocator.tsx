
import { getRelativePlayerIndex, HandLocator, ItemContext } from "@gamepark/react-game";
import { Location, MaterialItem } from "@gamepark/rules-api";
import { playerPositions, Position } from "./TableauLocator";

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
          return { x: 50, y: -25 }    // TDB
        case Position.BottomLeft:
          return players === 2 ? { x: -46, y: 8 } : players === 3 ? { x: -50, y: 30 } : { x: -48, y: -9 }    // TDB > 2
        case Position.BottomRight:
          return players === 2 ? { x: 46, y: 8 } : players === 3 ? { x: 50, y: 30 } : { x: 58, y: -9 }    // TD > 2
      }
    }

    getHoverTransform(_item: MaterialItem<number, number>, _context: ItemContext<number, number, number>): string[] {
      return ['translateZ(10em)', "translateY(-5em)","rotateZ(0".concat(this.rotationUnit, ")"), 'scale(2)'];
    }
}

export const playerDraftHandLocator = new PlayerDraftHandLocator()