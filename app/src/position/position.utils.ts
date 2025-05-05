import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { getRelativePlayerIndex, MaterialContext } from '@gamepark/react-game'
import { Coordinates } from '@gamepark/rules-api'

export const getPlayerBoardPosition = (context: MaterialContext, player?: number): Partial<Coordinates> => {
  const index = getPlayerIndex(context, player)
  const players = context.rules.players.length
  switch (index) {
    case 1:
      return { x: 0, y: -35 }
    case 2:
      if (players === 2) return { y: -7, x: 61 }
      return { y: -35, x: players < 5 ? 65 : 55 }
    case 3:
      return { y: -35, x: 110 }
    case 4:
      return { y: -35, x: 165 }
    case 5:
      return { x: 165 }
    case 6:
      return { x: 110 }
    case 7:
      return { x: players < 5 ? 65 : 55 }
  }

  return {}
}

export const getPlayerIndex = (context: MaterialContext, player?: number) => {
  switch (context.rules.players.length) {
    case 2:
      return [0, 2][getRelativePlayerIndex(context, player)]
    case 4:
      return [0, 1, 2, 7][getRelativePlayerIndex(context, player)]
    case 5:
    case 6:
      return [0, 1, 2, 3, 6, 7][getRelativePlayerIndex(context, player)]
    default:
      return getRelativePlayerIndex(context, player)
  }
}

export const isTopPlayer = (context: MaterialContext, player?: PlayerColor) => {
  return [1, 2, 3].includes(getPlayerIndex(context, player))
}

export const getTableSize = (players: number): { xMin: number; xMax: number; yMin: number; yMax: number } => {
  switch (players) {
    case 3:
    case 4:
      return { xMin: -28, xMax: 125, yMin: -49, yMax: 39 }
    case 5:
    case 6:
      return { xMin: -28, xMax: 170, yMin: -49, yMax: 39 }
    case 7:
      return { xMin: -28, xMax: 194, yMin: -49, yMax: 39 }
    default:
      // 2 players
      return { xMin: -28, xMax: 105, yMin: -23, yMax: 41 }
  }
}
