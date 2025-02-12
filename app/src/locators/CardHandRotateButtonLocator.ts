/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { LocationContext, LocationDescription, Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { CardHandRotateButton } from './component/CardHandRotateButton'
import { playerBuildingHandLocator } from './PlayerBuildingHandLocator'



class CardHandRotateButtonLocator extends Locator {
  locationDescription = new CardHandRotateButtonDescription()

  coordinates = { x: -6.9, y: -1, z: 5 }

  getLocations(context: MaterialContext) {
    const { rules } = context

    const buildingCards = rules.material(MaterialType.Building).location(LocationType.PlayerBuildingHand)
    return buildingCards.getIndexes()
      .map((index) => ({
        type: LocationType.CardHandRotate,
        parent: index
      }))
  }

  placeLocation(location: Location, context: LocationContext): string[] {
    const { rules } = context
    const card = rules.material(MaterialType.Building).getItem(location.parent!)!
    return [
      ...playerBuildingHandLocator.placeItem(card, { ...context, type: MaterialType.Building, index: location.parent!, displayIndex: location.parent! }),
      ...super.placeLocation(location, context)
    ]
  }
}

class CardHandRotateButtonDescription extends LocationDescription {
  height = 2
  width = 2
  borderRadius = 1
  extraCss = css`pointer-events: auto !important;`

  content = CardHandRotateButton

}

export const cardHandRotateButtonLocator = new CardHandRotateButtonLocator()