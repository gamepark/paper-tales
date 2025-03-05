/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { LocationContext, LocationDescription, Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { ShieldIcon } from './component/Shield'
import { playerUnitBoard } from './PlayerUnitBoard'

class ShieldLocator extends Locator {
  locationDescription = new ShieldDescription()

  coordinates = { x: 0, y: 3, z: 5 }

  getLocations(context: MaterialContext) {
    const { rules } = context

    const boardUnit = rules.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard)
    return boardUnit.getIndexes()
      .map((index) => ({
        type: LocationType.ShieldIcon,
        parent: index
      }))
  }

  placeLocation(location: Location, context: LocationContext): string[] {
    const { rules } = context
    const card = rules.material(MaterialType.Unit).getItem(location.parent!)!
    return [
      ...playerUnitBoard.placeItem(card, { ...context, type: MaterialType.Unit, index: location.parent!, displayIndex: location.parent! }),
      ...super.placeLocation(location, context)
    ]
  }
}

class ShieldDescription extends LocationDescription {

  extraCss = css`pointer-events: auto !important;`
  height = 1
  ratio = 1.5



  content = ShieldIcon

}

export const shieldLocator = new ShieldLocator()