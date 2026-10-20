import { css } from '@emotion/react'
import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { CardDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
import { isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import i18next from 'i18next'
import { isWarView } from '../locators/TableLayout'
import { cutLine, paper, paperFont, tornClip } from '../theme/tableTheme'
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
import Abbey1 from '../images/buildings/en/level1/AbbeyL1.jpg'
import Abbey2 from '../images/buildings/en/level2/AbbeyL2.jpg'
import Library1 from '../images/buildings/en/level1/LibraryL1.jpg'
import Library2 from '../images/buildings/en/level2/LibraryL2.jpg'
import Crypt1 from '../images/buildings/en/level1/CryptL1.jpg'
import Crypt2 from '../images/buildings/en/level2/CryptL2.jpg'
import BlackMarket1 from '../images/buildings/en/level1/BlackMarketL1.jpg'
import BlackMarket2 from '../images/buildings/en/level2/BlackMarketL2.jpg'
import BackRoom1 from '../images/buildings/en/level1/BackRoomL1.jpg'
import BackRoom2 from '../images/buildings/en/level2/BackRoomL2.jpg'
import Port1 from '../images/buildings/en/level1/PortL1.jpg'
import Port2 from '../images/buildings/en/level2/PortL2.jpg'
import Inn1 from '../images/buildings/en/level1/InnL1.jpg'
import Inn2 from '../images/buildings/en/level2/InnL2.jpg'
import Sawmill1 from '../images/buildings/en/level1/SawmillL1.jpg'
import Sawmill2 from '../images/buildings/en/level2/SawmillL2.jpg'
import RoyalPalace1 from '../images/buildings/en/level1/RoyalPalaceL1.jpg'
import RoyalPalace2 from '../images/buildings/en/level2/RoyalPalaceL2.jpg'
import { BuildingBookHelp } from './help/BuildingBookHelp'
import { BuildingBookHelpDisplay } from './help/book/BuildingBookHelpDisplay'
import { BuildIcon } from './icons/PaperIcons'
import { PaperMenuButton } from './PaperMenuButton'
import { hoveredItemMenuAboveCss } from './hoverMenuCss'

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
    [Building.Town]: Town2,
    [Building.Abbey]: Abbey2,
    [Building.Library]: Library2,
    [Building.Crypt]: Crypt2,
    [Building.BlackMarket]: BlackMarket2,
    [Building.BackRoom]: BackRoom2,
    [Building.Port]: Port2,
    [Building.Inn]: Inn2,
    [Building.Sawmill]: Sawmill2,
    [Building.RoyalPalace]: RoyalPalace2
  }

  images = {
    [Building.Mine]: Mine1,
    [Building.Barracks]: Barracks1,
    [Building.Tavern]: Tavern1,
    [Building.Temple]: Temple1,
    [Building.Town]: Town1,
    [Building.Abbey]: Abbey1,
    [Building.Library]: Library1,
    [Building.Crypt]: Crypt1,
    [Building.BlackMarket]: BlackMarket1,
    [Building.BackRoom]: BackRoom1,
    [Building.Port]: Port1,
    [Building.Inn]: Inn1,
    [Building.Sawmill]: Sawmill1,
    [Building.RoyalPalace]: RoyalPalace1
  }

  isFlipped(item: Partial<MaterialItem>, context: MaterialContext): boolean {
    return !!item.location?.rotation || super.isFlipped(item, context)
  }

  help = BuildingBookHelp
  helpDisplay = BuildingBookHelpDisplay

  getItemExtraCss(item: MaterialItem, context: ItemContext) {
    // Hovered: above its neighbours in the grid. A building that cannot be built now is darkened by a veil laid on the
    // card (see VeilLocators). The "Not built" band is drawn on the card itself: it moves and turns with it, and fades out
    // when it gets built.
    const unbuilt = item.location.type === LocationType.PlayerBuildingHand
    const band = !isWarView(context) && unbuiltBandCss(i18next.t('building.unbuilt', 'Not built'))
    return [hoverAboveCss, hoveredItemMenuAboveCss, band, band && !unbuilt && builtCss]
  }

  menuAlwaysVisible = true

  getItemMenu(_item: MaterialItem, context: ItemContext, _legalMoves: MaterialMove[]) {
    const flip = _legalMoves.find((move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === context.index && move.location.rotation === true)

    const buildAsIs = _legalMoves.find((move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === context.index && !move.location.rotation)

    const items = []
    if (buildAsIs) {
      items.push(
        <PaperMenuButton key="build-as-is" move={buildAsIs} x={-BUILD_BUTTON_X} y={BUILD_BUTTON_Y} level={1}>
          <BuildIcon />
        </PaperMenuButton>
      )
    }

    if (flip) {
      items.push(
        <PaperMenuButton key="flip" move={flip} x={BUILD_BUTTON_X} y={BUILD_BUTTON_Y} level={2}>
          <BuildIcon />
        </PaperMenuButton>
      )
    }

    return items
  }
}

/**
 * The 2 construction buttons stand side by side at the top of the picture, above the "Not built" band, level 1 at the left:
 * on the edges, they would run into the buttons of the next building of the grid
 */
const BUILD_BUTTON_X = 3
const BUILD_BUTTON_Y = -3.1

const hoverAboveCss = css`
  &:hover {
    z-index: 100;
  }
`

/**
 * A band of ink-coloured paper across the card, tilted (the same as the bands of the table, see Sash). On the card itself,
 * just over its front face: the faces carry the highlight of the framework on their own ::after.
 */
const unbuiltBandCss = (label: string) => css`
  &::after {
    content: ${JSON.stringify(label)};
    position: absolute;
    left: 50%;
    top: 50%;
    padding: 0.35em 1.3em 0.2em;
    transform: translate(-50%, -50%) translateZ(0.4em) rotate(-14deg);
    background: ${cutLine};
    clip-path: ${tornClip};
    color: ${paper};
    font-family: ${paperFont};
    font-weight: 800;
    font-size: 1.35em;
    white-space: nowrap;
    filter: drop-shadow(0.16em 0.2em 0 #00000059);
    opacity: 1;
    transition:
      opacity 0.6s,
      transform 0.6s;
    pointer-events: none;
  }
`

/** Built: the band lifts off and fades, while the veil goes and the card lights up */
const builtCss = css`
  &::after {
    opacity: 0;
    transform: translate(-50%, -80%) translateZ(0.4em) rotate(-20deg) scale(1.15);
  }
`

export const buildingCardDescription = new BuildingCardDescription()
