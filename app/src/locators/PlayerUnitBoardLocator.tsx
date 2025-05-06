import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { DropAreaDescription, FlexLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import { isTopPlayer } from '../position/position.utils'
import { getColor } from '../utils/color'
import { playerDraftHandLocator } from './PlayerDraftHandLocator'

class PlayerUnitBoardLocator extends FlexLocator {
  getCoordinates(location: Location, context: ItemContext) {
    let { x = 0, y = 0 } = playerDraftHandLocator.getCoordinates(location, context)
    const isTopPlayers = isTopPlayer(context, location.player)
    const factor = isTopPlayers ? -1 : 1
    x += 5

    if (isTopPlayers) {
      y += unitCardDescription.height * 2 + 1.5
    } else {
      y -= unitCardDescription.height * 2 + 1.5
    }

    return {
      x: x - location.x! * (unitCardDescription.width + 0.2),
      y: y + factor * location.y! * (unitCardDescription.height + 0.2),
      z: 0.1
    }
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    if (item.location.y === 0 && context.player === item.location.player)
      return ['translateZ(10em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(15%)']
    return ['translateZ(10em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)']
  }

  getLocations(context: MaterialContext) {
    const locations: Location[] = []
    for (const player of context.rules.players) {
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

  getExtraCss(location: Location, context: ItemContext) {
    const hasLevel2Building =
      context.rules.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(location.player).rotation(true).length > 0

    const color = getColor(location.player!).substring(0, 7)
    if (!hasLevel2Building && location.y === 0 && location.x === 2) {
      return css`
        background-image: linear-gradient(
          45deg,
          ${color}80 25%,
          ${color}00 25%,
          ${color}00 50%,
          ${color}80 50%,
          ${color}80 75%,
          ${color}00 75%,
          ${color}00 100%
        );
        background-size: 57px 57px;
      `
    }

    return css`
      background-color: ${color}80;
    `
  }
}

export const playerUnitBoardLocator = new PlayerUnitBoardLocator()
