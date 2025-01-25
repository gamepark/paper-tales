import { ItemContext, ListLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'

class BuildingLocator extends ListLocator {
  getCoordinates(_location: Location) {
    return { y: this.getRiverY() }
  }

  getRiverY() {
    return -18
  }

  gap = { x: 7 }

  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    const coordinates = super.getItemCoordinates(item, context)
    if (item.selected) coordinates.y! -= 1
    return coordinates
  }

  getHoverTransform = () => ['translateZ(10em)', 'scale(2)']
}

export const buildingLocator = new BuildingLocator()