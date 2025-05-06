import { css } from '@emotion/react'
import { faArrowsToDot } from '@fortawesome/free-solid-svg-icons/faArrowsToDot'
import { faHand } from '@fortawesome/free-solid-svg-icons/faHand'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { CustomMoveType, GainAgeTokenOnChosenUnitEffect } from '@gamepark/paper-tales/rules/CustomMoveType'
import { CardDescription, ItemContext, ItemMenuButton, pointerCursorCss } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
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
import { PaperTalesCardHelp } from './help/UnitCardHelp'

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

  help = PaperTalesCardHelp

  menuAlwaysVisible = true

  getItemMenu(_item: MaterialItem, context: ItemContext, legalMoves: MaterialMove[]) {
    const age = legalMoves.find((move) => {
      if (!isCustomMoveType(CustomMoveType.GainAgeTokenOnChosenUnitEffect)(move)) return false
      const data: GainAgeTokenOnChosenUnitEffect = move.data
      return data.unitIndex === context.index
    })

    const discard = legalMoves.find(
      (move) => isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.Discard && move.itemIndex === context.index
    )
    const draft = legalMoves.find(
      (move) => isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerUnitHand && move.itemIndex === context.index
    )

    const items = []
    if (draft) {
      items.push(
        <ItemMenuButton key="draft" move={draft} radius={8} angle={-150 + _item.location.x! * 1.5}>
          <FontAwesomeIcon
            icon={faHand}
            css={[
              pointerCursorCss,
              css`
                font-size: 1.2em;
              `
            ]}
          />
        </ItemMenuButton>
      )
    }
    if (discard) {
      items.push(
        <ItemMenuButton key="discard" move={discard} radius={8} angle={-40 + _item.location.x! * 1.5}>
          <FontAwesomeIcon
            icon={faTrashCan}
            css={[
              pointerCursorCss,
              css`
                font-size: 1.2em;
              `
            ]}
          />
        </ItemMenuButton>
      )
    }
    if (age) {
      items.push(
        <ItemMenuButton key="age" move={age} label={<Trans defaults="move.add.age" />} angle={260} radius={3.7} labelPosition={'right'}>
          <FontAwesomeIcon
            icon={faArrowsToDot}
            css={[
              pointerCursorCss,
              css`
                font-size: 1.2em;
              `
            ]}
          />
        </ItemMenuButton>
      )
    }

    return items
  }
}

export const unitCardDescription = new UnitCardDescription()
