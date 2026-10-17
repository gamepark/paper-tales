import { ItemContext, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { getPlayerPositionDependencies, isMyAreaDisplayed, playerGoldCoordinates } from './TableLayout'

/**
 * Only my gold is on the table, the gold of the others is counted in their panel
 */
class PlayerGoldStockLocator extends PileLocator {
  coordinates = playerGoldCoordinates
  radius = { x: 2, y: 2 }
  limit = 100

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return getPlayerPositionDependencies(context)
  }

  hide(item: MaterialItem, context: ItemContext) {
    return !isMyAreaDisplayed(context, item.location.player)
  }

  getPileId(item: MaterialItem) {
    return `${item.location.player}-${item.id}`
  }
}

export const playerGoldStockLocator = new PlayerGoldStockLocator()
