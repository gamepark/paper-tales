import { Gold } from '@gamepark/paper-tales/material/Gold'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { PileLocator } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'

export class GoldStockLocator extends PileLocator {
  radius = 3
  // Top strip y=-15 — pos 5/5 : x=11 → spans x:[8, 14] (pile r=3).
  // Gap round/gold : 1.5em.
  coordinates = { x: 11, y: -15 }

  getPileId(item: MaterialItem<PlayerColor, LocationType, Gold>): string {
    return `${item.id}`
  }
}

export const goldStockLocator = new GoldStockLocator()
