/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { faHammer } from '@fortawesome/free-solid-svg-icons/faHammer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Building } from '@gamepark/paper-tales/material/Building'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { CardDescription, ItemContext, ItemMenuButton, MaterialContext, pointerCursorCss } from '@gamepark/react-game'
import { isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import Barracks1 from '../images/buildings/en/level1/BarracksL1.jpg'
import Mine1 from '../images/buildings/en/level1/MineL1.jpg'
import Tavern1 from '../images/buildings/en/level1/TavernL1.jpg'
import Temple1 from '../images/buildings/en/level1/TempleL1.jpg'
import Town1 from '../images/buildings/en/level1/TownL1.jpg'
import Barracks2 from '../images/buildings/en/level2/BarracksL2.jpg'
import Mine2 from '../images/buildings/en/level2/MineL2.jpg'
import Tavern2 from '../images/buildings/en/level2/TavernL2.jpg'
import Temple2 from '../images/buildings/en/level2/TempleL2.jpg'
import Town2 from '../images/buildings/en/level2/TownL2.jpg'
import { BuildingHelp } from './help/BuildingHelp'

export class BuildingCardDescription extends CardDescription {
  height = 10
  width = 14
  borderRadius = 0.5

  //Image en EN.

  backImages = {
    [Building.Mine]: Mine2,
    [Building.Barracks]: Barracks2,
    [Building.Tavern]: Tavern2,
    [Building.Temple]: Temple2,
    [Building.Town]: Town2
  }

  images = {
    [Building.Mine]: Mine1,
    [Building.Barracks]: Barracks1,
    [Building.Tavern]: Tavern1,
    [Building.Temple]: Temple1,
    [Building.Town]: Town1
  }

  isFlipped(item: Partial<MaterialItem>, context: MaterialContext): boolean {
    return !!item.location?.rotation || super.isFlipped(item, context)
  }

  help = BuildingHelp

  menuAlwaysVisible = true

  getItemMenu(_item: MaterialItem, context: ItemContext, _legalMoves: MaterialMove[]) {
    const flip = _legalMoves.find((move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === context.index && move.location.rotation === true)

    const buildAsIs = _legalMoves.find((move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === context.index && !move.location.rotation)

    const items = []
    if (buildAsIs) {
      items.push(
        <ItemMenuButton key="build-as-is" move={buildAsIs} angle={-87} radius={7} css={largeButtonCss}>
          <div>
            <FontAwesomeIcon icon={faHammer} css={iconCss} /> 1
          </div>
        </ItemMenuButton>
      )
    }

    if (flip) {
      items.push(
        <ItemMenuButton key="flip" move={flip} angle={87} radius={7} css={largeButtonCss}>
          <div>
            <FontAwesomeIcon icon={faHammer} css={iconCss} /> 2
          </div>
        </ItemMenuButton>
      )
    }

    return items
  }
}

const largeButtonCss = css`
  width: 3em;
  font-weight: bold;
  padding-right: 0.2em;
`

const iconCss = css`
  ${pointerCursorCss};
  font-size: 1.2em;
`

export const buildingCardDescription = new BuildingCardDescription()
