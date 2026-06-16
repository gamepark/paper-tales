import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { ItemContext, MaterialContext } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'

export function getViewPlayer(context: MaterialContext): PlayerColor | undefined {
  const explicitView = (context.rules as unknown as { game: { view?: PlayerColor } }).game.view
  return explicitView ?? (context.player as PlayerColor | undefined) ?? (context.rules.players[0] as PlayerColor | undefined)
}

export function isNotViewedPlayerItem(item: MaterialItem, context: ItemContext): boolean {
  if (item.location.player === undefined) return false
  return item.location.player !== getViewPlayer(context)
}
