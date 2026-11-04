import { ItemContext, MaterialContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { getGoldCoordinates, getKingdomScale, getPlayerPositionDependencies, getWarCenter, isKingdomDisplayed, isWarView, scaleTransform } from './TableLayout'
import { placeAtPanelWhenHidden } from './placeAtPanelWhenHidden'

/**
 * The gold of a displayed kingdom is on the table, in the empty corner of the kingdom, at its scale: the 3 kingdoms of the
 * neighbours view show theirs (never hidden, rulebook p.3). The others are counted in their panel.
 */
class PlayerGoldStockLocator extends PileLocator {
  radius = { x: 3.2, y: 2.6 }
  limit = 100

  getPositionDependencies(location: Location, context: MaterialContext) {
    return { ...getPlayerPositionDependencies(context), center: isWarView(context) && getWarCenter(context), items: super.getPositionDependencies(location, context) }
  }

  getCoordinates(location: Location, context: MaterialContext) {
    return getGoldCoordinates(context, location.player)
  }

  /** The pile keeps its shape at the scale of the kingdom */
  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    const coordinates = super.getItemCoordinates(item, context)
    const center = this.getCoordinates(item.location, context)
    const scale = getKingdomScale(context, item.location.player)
    return { ...coordinates, x: center.x + (coordinates.x! - center.x) * scale, y: center.y + (coordinates.y! - center.y) * scale }
  }

  hide(item: MaterialItem, context: ItemContext) {
    return !isKingdomDisplayed(context, item.location.player)
  }

  placeItem(item: MaterialItem, context: ItemContext): string[] {
    return placeAtPanelWhenHidden(this, item, context, () => [...super.placeItem(item, context), ...scaleTransform(getKingdomScale(context, item.location.player))])
  }

  getPileId(item: MaterialItem) {
    return `${item.location.player}-${item.id}`
  }
}

export const playerGoldStockLocator = new PlayerGoldStockLocator()
