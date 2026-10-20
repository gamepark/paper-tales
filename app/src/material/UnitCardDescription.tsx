import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { CardDescription, ItemContext } from '@gamepark/react-game'
import { MaterialItem, MaterialMove } from '@gamepark/rules-api'
import i18next from 'i18next'
import Adventurer from '../images/units/en/Adventurer.jpg'
import Archer from '../images/units/en/Archer.jpg'
import Blacksmith from '../images/units/en/Blacksmith.jpg'
import CardBack from '../images/units/en/CardBack.jpg'
import CaveSpirit from '../images/units/en/CaveSpirit.jpg'
import Cerberus from '../images/units/en/Cerberus.jpg'
import Colossus from '../images/units/en/Colossus.jpg'
import Commander from '../images/units/en/Commander.jpg'
import Cook from '../images/units/en/Cook.jpg'
import Demon from '../images/units/en/Demon.jpg'
import Dragon from '../images/units/en/Dragon.jpg'
import Farmer from '../images/units/en/Farmer.jpg'
import ForestChild from '../images/units/en/ForestChild.jpg'
import ForestSpirit from '../images/units/en/ForestSpirit.jpg'
import GiantSnake from '../images/units/en/GiantSnake.jpg'
import Golem from '../images/units/en/Golem.jpg'
import GrandArchitect from '../images/units/en/GrandArchitect.jpg'
import Hunter from '../images/units/en/Hunter.jpg'
import Knight from '../images/units/en/Knight.jpg'
import kraken from '../images/units/en/Kraken.jpg'
import Landlord from '../images/units/en/LandLord.jpg'
import Leviathan from '../images/units/en/Leviathan.jpg'
import Manticore from '../images/units/en/Manticore.jpg'
import MasterAlchemist from '../images/units/en/MasterAlchemist.jpg'
import Militiaman from '../images/units/en/Militiaman.jpg'
import Miner from '../images/units/en/Miner.jpg'
import Monkey from '../images/units/en/Monkey.jpg'
import MysticalHealer from '../images/units/en/MysticalHealer.jpg'
import Necromancer from '../images/units/en/Necromancer.jpg'
import Ogre from '../images/units/en/Ogre.jpg'
import PalmReader from '../images/units/en/PalmReader.jpg'
import Peddler from '../images/units/en/Peddler.jpg'
import RelicOfWisdom from '../images/units/en/RelicOfWisdom.jpg'
import Rogue from '../images/units/en/Rogue.jpg'
import Salamander from '../images/units/en/Salamander.jpg'
import Sculptor from '../images/units/en/Sculptor.jpg'
import Shapeshifter from '../images/units/en/Shapeshifter.jpg'
import Strategist from '../images/units/en/Strategist.jpg'
import TimeMaster from '../images/units/en/TimeMaster.jpg'
import Treefolk from '../images/units/en/Treefolk.jpg'
import Veteran from '../images/units/en/Veteran.jpg'
import Woodcutter from '../images/units/en/Woodcutter.jpg'
import WoodMerchant from '../images/units/en/WoodMerchant.jpg'
import { isWarView } from '../locators/TableLayout'
import { hoveredItemMenuAboveCss } from './hoverMenuCss'
import { UnitActionLabel } from './actions/UnitActionLabel'
import { getUnitActions, UnitAction, unitActionIcons, unitActionTexts } from './actions/UnitActions'
import { MenuPosition, PaperMenuButton } from './PaperMenuButton'
import { UnitHelp } from './help/UnitHelp'
import { BookHelpDisplay } from './help/book/BookHelpDisplay'

export class UnitCardDescription extends CardDescription {
  height = 14
  width = 10
  borderRadius = 0.5

  backImage = CardBack

  //Image en EN.
  images = {
    [Unit.Commander]: Commander,
    [Unit.Adventurer]: Adventurer,
    [Unit.Archer]: Archer,
    [Unit.Blacksmith]: Blacksmith,
    [Unit.CaveSpirit]: CaveSpirit,
    [Unit.Cerberus]: Cerberus,
    [Unit.Colossus]: Colossus,
    [Unit.Cook]: Cook,
    [Unit.Demon]: Demon,
    [Unit.Dragon]: Dragon,
    [Unit.Farmer]: Farmer,
    [Unit.ForestChild]: ForestChild,
    [Unit.ForestSpirit]: ForestSpirit,
    [Unit.GiantSnake]: GiantSnake,
    [Unit.Golem]: Golem,
    [Unit.GrandArchitect]: GrandArchitect,
    [Unit.Hunter]: Hunter,
    [Unit.Knight]: Knight,
    [Unit.Kraken]: kraken,
    [Unit.LandLord]: Landlord,
    [Unit.Leviathan]: Leviathan,
    [Unit.Manticore]: Manticore,
    [Unit.MasterAlchemist]: MasterAlchemist,
    [Unit.Militiaman]: Militiaman,
    [Unit.Miner]: Miner,
    [Unit.Monkey]: Monkey,
    [Unit.MysticalHealer]: MysticalHealer,
    [Unit.Necromancer]: Necromancer,
    [Unit.Ogre]: Ogre,
    [Unit.PalmReader]: PalmReader,
    [Unit.Peddler]: Peddler,
    [Unit.RelicOfWisdom]: RelicOfWisdom,
    [Unit.Rogue]: Rogue,
    [Unit.Salamander]: Salamander,
    [Unit.Sculptor]: Sculptor,
    [Unit.Shapeshifter]: Shapeshifter,
    [Unit.Strategist]: Strategist,
    [Unit.TimeMaster]: TimeMaster,
    [Unit.Treefolk]: Treefolk,
    [Unit.Veteran]: Veteran,
    [Unit.Woodcutter]: Woodcutter,
    [Unit.WoodMerchant]: WoodMerchant
  }

  help = UnitHelp
  helpDisplay = BookHelpDisplay

  // The discard and the back row of a war are darkened by a veil laid on the card (see VeilLocators)
  getItemExtraCss() {
    return [hoveredItemMenuAboveCss]
  }

  // The neighbours view is for looking at the war, not for arranging my kingdom: no drag there (discard nor slot change)
  canDrag(move: MaterialMove, context: ItemContext) {
    return !isWarView(context) && super.canDrag(move, context)
  }

  menuAlwaysVisible = true

  getItemMenu(item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]) {
    const actions = getUnitActions(legalMoves, context.index, isWarView(context))
    const button = (action: UnitAction, position: MenuPosition, labelled: boolean) => {
      const move = actions[action]
      if (!move) return undefined
      const Icon = unitActionIcons[action]
      const [key, defaults] = unitActionTexts[action]
      return (
        <PaperMenuButton
          key={action}
          move={move}
          label={labelled ? <UnitActionLabel action={action} /> : undefined}
          labelPosition="right"
          title={labelled ? undefined : i18next.t(key, defaults)}
          {...position}
        >
          <Icon />
        </PaperMenuButton>
      )
    }
    // In the draft fan, the buttons stand in a row just above the left edge of each card, whatever the number of cards:
    // they never hide the name nor the cost, and on a zoomed card they land on the picture, not on the text. No label,
    // for the 2 buttons to fit side by side with 2 players (the help of the card names them)
    // The framework places the menu without the rotation of the card: the angles turn with the card in a fan, so that the
    // buttons stand at the same place on every card
    const tilt = context.locators[item.location.type]?.getItemRotateZ(item, context) ?? 0
    if (item.location.type === LocationType.PlayerDraftHand) {
      return [
        button(UnitAction.Keep, { radius: 9.3, angle: -23.5 + tilt }, false),
        button(UnitAction.Discard, { radius: 8.55, angle: -6 + tilt }, false)
      ]
    }
    // In my hand during the deployment, the discard stands above the card, where Keep stood during the recruitment
    if (item.location.type === LocationType.PlayerUnitHand) return [button(UnitAction.Discard, { radius: 9.3, angle: -23.5 + tilt }, false)]
    return [
      button(UnitAction.Save, { radius: 3, angle: -110 }, true),
      button(UnitAction.Discard, { radius: 8, angle: -40 }, false),
      button(UnitAction.AddAge, { radius: 3.7, angle: 260 }, true)
    ]
  }
}


export const unitCardDescription = new UnitCardDescription()
