/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { LocationContext, LocationDescription, Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { CardBoardRotateButton } from './component/CardBoardRotateButton'
import { playerBuildingBoardLocator } from './PlayerBuildingBoardLocator'



class CardBoardRotateButtonLocator extends Locator {
  locationDescription = new CardBoardRotateButtonDescription()

  coordinates = { x: -6.9, y: -1, z: 5 }

  getLocations(context: MaterialContext) {
    const { rules } = context

    const buildingCards = rules.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard)
    return buildingCards.getIndexes()
      .map((index) => ({
        type: LocationType.CardBoardRotate,
        parent: index
      }))
  }

  placeLocation(location: Location, context: LocationContext): string[] {
    const { rules } = context
    const card = rules.material(MaterialType.Building).getItem(location.parent!)!
    return [
      ...playerBuildingBoardLocator.placeItem(card, { ...context, type: MaterialType.Building, index: location.parent!, displayIndex: location.parent! }),
      ...super.placeLocation(location, context)
    ]
  }
}

class CardBoardRotateButtonDescription extends LocationDescription {
  height = 2
  width = 2
  borderRadius = 1
  extraCss = css`pointer-events: auto !important;`

  content = CardBoardRotateButton

}

export const cardBoardRotateButtonLocator = new CardBoardRotateButtonLocator()