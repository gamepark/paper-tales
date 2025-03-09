/** @jsxImportSource @emotion/react */
import { DropAreaDescription, getRelativePlayerIndex, HandLocator, ItemContext, MaterialContext } from "@gamepark/react-game";
import { Location, MaterialItem } from "@gamepark/rules-api";
import { playerPositions, Position } from "./TableauLocator";


export class PlayerUnitHandLocator extends HandLocator {

  locationDescription = new DropAreaDescription({ width: 20, height:14, borderRadius: 1 })

  getCoordinates(location: Location, context: ItemContext) {
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const players = context.rules.players.length
    //const handLength:number = context.rules.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(location.player).getQuantity()
    //const delta = (context.rules.players.length === 2 ? 9 : 5) - handLength 
    switch (position) {
      case Position.TopLeft:
        return players === 4 ? { x: -85, y: -10 } : { x: -100, y: -25 }   // TDB
      case Position.BottomCenter:
        return { x: 46, y: 40 }     // TDB 
      case Position.TopRight:
        return players === 3 ? { x: -40, y: -42 } : { x: 100, y: -25 }    // TDB
      case Position.BottomLeft:
        return players === 2 ? { x: -11, y: 7 } : players === 3 ? { x: 40, y: 18 } : players === 4 ? { x: 16, y: 30 } : { x: -100, y: 0 }   // TDB > 2
      case Position.BottomRight:
        return players === 2 ? { x: 11, y: 7 } : players === 3 ? { x: 40, y: -42 } : players === 4 ? { x: 85, y: 10 } : { x: 100, y: 0 }    // TD > 2
    }
  }

  getHoverTransform(_item: MaterialItem<number, number>, _context: ItemContext<number, number, number>): string[] {
    return ['translateZ(10em)', "translateY(-5em)","rotateZ(0".concat(this.rotationUnit, ")"), 'scale(2)'];
  }

      getBaseAngle(location: Location<number, number>, context: MaterialContext<number, number, number>): number {
        const playerIndex = getRelativePlayerIndex(context, location.player)
        const position = playerPositions[context.rules.players.length - 2][playerIndex]
        const players = context.rules.players.length
        switch (position) {
          case Position.TopLeft:
            return players === 4 ? 90 : players === 5 ? 90 : 0  // TDB
          case Position.BottomCenter:
            return 0    // TDB 
          case Position.TopRight:
            return players === 3 ? -180 : players === 4 ? -90 : -90    // TDB
          case Position.BottomLeft:
            return players === 5 ? 90 : 0
          case Position.BottomRight:
            return players === 2 ? 0 : players === 3 ? -180 : players === 4 ? -90 : -90    // TD > 2
        }
        
      }



  radius: number = 50;

}

export const playerUnitHandLocator = new PlayerUnitHandLocator()