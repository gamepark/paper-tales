/** @jsxImportSource @emotion/react */
import { getRelativePlayerIndex, ItemContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { playerPositions, Position } from './TableauLocator'

class PlayerGoldStockLocator extends PileLocator {
  radius = {x:2, y:2}
  limit = 100

  getCoordinates(location: Location, context: ItemContext) {
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const players = context.rules.players.length
    switch (position) {
      case Position.TopLeft:
        return players === 4 ? { x: 15, y: -30 } : { x: -10, y: -36 }
      case Position.BottomCenter:
        return { x: 14, y: 30 } 
      case Position.TopRight:
        return players === 3 ? { x: -60, y: 3 } : players === 4 ? { x: -15, y: -30 } : { x: 10, y: -36 }
      case Position.BottomLeft:
        return players === 2 ? { x: -16, y: -7 } : players === 3 ? { x: 15, y: 10 } : players === 4 ? { x: -80, y: 15 } : { x: -40, y: 20 }
      case Position.BottomRight:
        return players === 2 ? { x: 16, y: -7 } : players === 3 ? { x: 60, y: 3 } : players === 4 ? { x: 73, y: 15 } : { x: 40, y: 20 }
    }
  }

  getPileId(item: MaterialItem) {
    return `${item.location.player}-${item.id}`
  }
}

export const playerGoldStockLocator = new PlayerGoldStockLocator()