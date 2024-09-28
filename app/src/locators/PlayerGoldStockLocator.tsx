/** @jsxImportSource @emotion/react */
import { getRelativePlayerIndex, ItemContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { playerPositions, Position } from './TableauLocator'

class PlayerGoldStockLocator extends PileLocator {
  radius = 1
  limit = 1000

  getCoordinates(location: Location, context: ItemContext) {
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const players = context.rules.players.length
    switch (position) {
      case Position.TopLeft:
        return { x: -48, y: -40 }   // TDB
      case Position.TopCenter:
        return { x: -7, y: -40 }    // TDB 
      case Position.TopRight:
        return { x: 58, y: -40 }    // TDB
      case Position.BottomLeft:
        return players === 2 ? { x: -40, y: 10 } : players === 3 ? { x: -30, y: -9 } : { x: -48, y: -9 }    // TDB > 2
      case Position.BottomRight:
        return players === 2 ? { x: 60, y: 10 } : players === 3 ? { x: 40, y: -9 } : { x: 58, y: -9 }    // TD > 2
    }
  }

  getPileId(item: MaterialItem) {
    return `${item.location.player}-${item.id}`
  }
}

export const playerGoldStockLocator = new PlayerGoldStockLocator()