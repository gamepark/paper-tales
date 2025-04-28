/** @jsxImportSource @emotion/react */
import { ItemContext, PileLocator } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { isTopPlayer } from '../position/position.utils'
import { playerDraftHandLocator } from './PlayerDraftHandLocator'

class PlayerGoldStockLocator extends PileLocator {
  radius = {x:2, y:2}
  limit = 100

  getCoordinates(location: Location, context: ItemContext) {
    let { x = 0, y = 0 }  = playerDraftHandLocator.getCoordinates(location, context)

    return {
      x: x - 15,
      y: y + (isTopPlayer(context, location.player)? 18: -18)
    }
  }

  getPileId(item: MaterialItem) {
    return `${item.location.player}-${item.id}`
  }
}

export const playerGoldStockLocator = new PlayerGoldStockLocator()
