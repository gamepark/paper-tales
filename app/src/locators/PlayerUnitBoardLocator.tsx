import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { DropAreaDescription, FlexLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import { getHoverShift, getKingdomScale, getKingdomSlotCoordinates, getPlayerPositionDependencies, isKingdomDisplayed, scaleTransform } from './TableLayout'
import { placeAtPanelWhenHidden } from './placeAtPanelWhenHidden'

class PlayerUnitBoardLocator extends FlexLocator {
  getPositionDependencies(_location: Location, context: MaterialContext) {
    return getPlayerPositionDependencies(context)
  }

  getCoordinates(location: Location, context: MaterialContext) {
    return { ...getKingdomSlotCoordinates(context, location.player, location.x!, location.y!), z: 0.1 }
  }

  hide(item: MaterialItem, context: ItemContext) {
    return !isKingdomDisplayed(context, item.location.player)
  }

  placeItem(item: MaterialItem, context: ItemContext) {
    return placeAtPanelWhenHidden(this, item, context, () => [
      ...super.placeItem(item, context),
      ...scaleTransform(getKingdomScale(context, item.location.player))
    ])
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    const { x, y } = getKingdomSlotCoordinates(context, item.location.player, item.location.x!, item.location.y!)
    const scale = getKingdomScale(context, item.location.player)
    const shift = getHoverShift({
      x,
      y,
      width: unitCardDescription.width * scale,
      height: unitCardDescription.height * scale,
      zoom: 2
    })
    return ['translateZ(20em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', ...shift]
  }

  getLocations(context: MaterialContext) {
    const locations: Location[] = []
    for (const player of context.rules.players.filter((player) => isKingdomDisplayed(context, player))) {
      for (let x = 0; x <= 2; x++) {
        for (let y = 0; y < 2; y++) {
          if (y === 1 && x === 2) continue
          locations.push({
            type: LocationType.PlayerUnitBoard,
            player: player,
            x,
            y,
            z: 0
          })
        }
      }
    }
    return locations
  }

  locationDescription = new PlayerUnitBoardDescription()
}

export class PlayerUnitBoardDescription extends DropAreaDescription {
  constructor() {
    super(unitCardDescription)
  }

  getLocationSize(location: Location, context: MaterialContext) {
    const { width, height } = super.getLocationSize(location, context)
    const scale = getKingdomScale(context, location.player)
    return { width: width * scale, height: height * scale }
  }

  getExtraCss(location: Location, context: ItemContext) {
    const hasLevel2Building =
      context.rules.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(location.player).rotation(true).length > 0

    // Neutral slots: the player's colour is on their panel. The 5th slot is hatched until a level 2 building is in play (rulebook p.8)
    if (!hasLevel2Building && location.y === 0 && location.x === 2) return lockedSlotCss
    return slotCss
  }
}

const slotCss = css`
  background-color: rgba(255, 255, 255, 0.18);
`

const lockedSlotCss = css`
  background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.22) 0 0.6em, transparent 0.6em 1.2em);
`

export const playerUnitBoardLocator = new PlayerUnitBoardLocator()
