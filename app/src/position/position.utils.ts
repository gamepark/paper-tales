import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { getRelativePlayerIndex, MaterialContext } from '@gamepark/react-game'
import { Coordinates } from '@gamepark/rules-api'

// In single-player view mode, every viewed player's content is rendered at this fixed
// baseline. Non-viewed players are hidden via `hide()` in each per-player locator, so
// the position they would otherwise resolve to is irrelevant.
export const getPlayerBoardPosition = (_context: MaterialContext, _player?: number): Partial<Coordinates> => {
  return { x: 0, y: 0 }
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

// View mode always renders the viewed player at the bottom orientation.
export const isTopPlayer = (_context: MaterialContext, _player?: PlayerColor) => {
  return false
}

export const getTableSize = (_players: number): { xMin: number; xMax: number; yMin: number; yMax: number } => {
  return { xMin: -60, xMax: 60, yMin: -30, yMax: 35 }
}
