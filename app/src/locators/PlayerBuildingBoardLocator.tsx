import { ListLocator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import { isTopPlayer } from '../position/position.utils'
import { playerDraftHandLocator } from './PlayerDraftHandLocator'

export class PlayerBuildingBoardLocator extends ListLocator {
  maxGap = { y: -18 }
  gap = { y: -10.5 }

  getCoordinates(location: Location, context: MaterialContext) {
    let { x = 0, y = 0 } = playerDraftHandLocator.getCoordinates(location, context)
    const isTop = isTopPlayer(context, location.player)
    x += 18

    if (isTop) {
      y += unitCardDescription.height + 17.5
    } else {
      y -= unitCardDescription.height - 0.7
    }

    return { x, y }
  }
}

export const playerBuildingBoardLocator = new PlayerBuildingBoardLocator()
