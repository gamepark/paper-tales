import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { DropAreaDescription, ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import { getColor } from '../utils/color'
import { getViewPlayer, isNotViewedPlayerItem } from '../view/viewHelpers'

class PlayerUnitBoardLocator extends Locator {
  gap = { x: unitCardDescription.width + 0.2 }
  hide(item: MaterialItem, context: ItemContext): boolean {
    return isNotViewedPlayerItem(item, context)
  }

  getCoordinates(location: Location) {
    // Board centré à (15, 2) — à droite, loin de la colonne bâtiment gauche.
    // - cellule milieu (loc.x=1) à x=15 → base x = 15 + 10.2 = 25.2 (loc.x=0 RIGHTMOST)
    // - row top y=-5.1, row bot y=9.1 (base y=-5.1, gap 14.2)
    // Cellules : (0,0)→(25.2,-5.1) (1,0)→(15,-5.1) (2,0)→(4.8,-5.1)
    //           (0,1)→(25.2, 9.1) (1,1)→(15, 9.1)  [(2,1) excluded]
    // Spans x:[-0.2, 30.2], y:[-12.1, 16.1]
    const { x, y } = { x: 25.2, y: -5.1 }
    return {
      x: x - location.x! * (unitCardDescription.width + 0.2),
      y: y + location.y! * (unitCardDescription.height + 0.2),
      z: 0.1
    }
  }

  getLocations(context: MaterialContext) {
    const viewed = getViewPlayer(context)
    if (viewed === undefined) return []
    const locations: Location[] = []
    for (let x = 0; x <= 2; x++) {
      for (let y = 0; y < 2; y++) {
        if (y === 1 && x === 2) continue
        locations.push({
          type: LocationType.PlayerUnitBoard,
          player: viewed,
          x,
          y,
          z: 0
        })
      }
    }
    return locations
  }

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return { view: getViewPlayer(context) ?? null }
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
