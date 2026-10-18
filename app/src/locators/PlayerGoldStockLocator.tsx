import { ItemContext, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { getPlayerPositionDependencies, isAreaDisplayed, playerGoldCoordinates } from './TableLayout'
import { placeAtPanelWhenHidden } from './placeAtPanelWhenHidden'

/**
 * The gold of the displayed kingdom is on the table (never hidden, rulebook p.3); the others are counted in their panel
 */
class PlayerGoldStockLocator extends PileLocator {
  coordinates = playerGoldCoordinates
  radius = { x: 3.2, y: 2.6 }
  limit = 100

  getPositionDependencies(location: Location, context: MaterialContext) {
    return { ...getPlayerPositionDependencies(context), items: super.getPositionDependencies(location, context) }
  }

  hide(item: MaterialItem, context: ItemContext) {
    return !isAreaDisplayed(context, item.location.player)
  }

  placeItem(item: MaterialItem, context: ItemContext): string[] {
    return placeAtPanelWhenHidden(this, item, context, () => super.placeItem(item, context))
  }

  getPileId(item: MaterialItem) {
    return `${item.location.player}-${item.id}`
  }
}

export const playerGoldStockLocator = new PlayerGoldStockLocator()
