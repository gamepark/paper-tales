import { css } from '@emotion/react'
import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { CardDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
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
import { BuildIcon } from './icons/PaperIcons'
import { PaperMenuButton } from './PaperMenuButton'
import { cardAppearCss } from '../theme/tableTheme'
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

  getItemExtraCss(item: MaterialItem, context: ItemContext) {
    // Not built yet: dimmed, unless I can build it right now (I have the resources, the gold and the land, rulebook
    // p.7). Hovered: above its neighbours in the grid, in colour.
    const dimmed = item.location.type === LocationType.PlayerBuildingHand && !this.canBuildNow(context)
    return [cardAppearCss, hoverAboveCss, hoveredItemMenuAboveCss, veilCss, dimmed && dimmedCss]
  }

  /** During my construction, a legal move builds this building */
  canBuildNow(context: ItemContext) {
    if (context.rules.game.rule?.id !== RuleId.Build || context.player === undefined) return false
    return context.rules
      .getLegalMoves(context.player)
      .some((move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === context.index)
  }

  menuAlwaysVisible = true

  getItemMenu(_item: MaterialItem, context: ItemContext, _legalMoves: MaterialMove[]) {
    const flip = _legalMoves.find((move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === context.index && move.location.rotation === true)

    const buildAsIs = _legalMoves.find((move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === context.index && !move.location.rotation)

    const items = []
    if (buildAsIs) {
      items.push(
        <PaperMenuButton key="build-as-is" move={buildAsIs} angle={-87} radius={7} level={1}>
          <BuildIcon />
        </PaperMenuButton>
      )
    }

    if (flip) {
      items.push(
        <PaperMenuButton key="flip" move={flip} angle={87} radius={7} level={2}>
          <BuildIcon />
        </PaperMenuButton>
      )
    }

    return items
  }
}

const hoverAboveCss = css`
  &:hover {
    z-index: 100;
  }
`

// A veil over the front face rather than a filter: a filter opens a stacking context that would flatten the 3D lift
// of the hovered card under its neighbours
// The veil is always there and only its opacity changes, so that a building lights up smoothly when it gets built
const veilCss = css`
  > * > *:first-of-type::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: rgba(40, 32, 24, 0.62);
    opacity: 0;
    transition: opacity 0.6s;
    pointer-events: none;
  }
`

const dimmedCss = css`
  > * > *:first-of-type::before {
    opacity: 1;
  }

  /* The framework turns off the pointer events of the card itself: its hover is read on the item display around it */
  *:hover > & > * > *:first-of-type::before {
    opacity: 0;
  }
`

export const buildingCardDescription = new BuildingCardDescription()
