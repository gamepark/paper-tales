import { Unit } from '@gamepark/paper-tales/material/Unit'
import Commander from '../images/units/fr/Commander.webp'
import Militiaman from '../images/units/fr/Militiaman.webp'
import TimeMaster from '../images/units/fr/TimeMaster.webp'
import Peddler from '../images/units/fr/Peddler.webp'
import Rogue from '../images/units/fr/Rogue.webp'
import Sculptor from '../images/units/fr/Sculptor.webp'
import Treefolk from '../images/units/fr/Treefolk.webp'
import Necromancer from '../images/units/fr/Necromancer.webp'
import Veteran from '../images/units/fr/Veteran.webp'
import Miner from '../images/units/fr/Miner.webp'
import Woodcutter from '../images/units/fr/Woodcutter.webp'
import Dragon from '../images/units/fr/Dragon.webp'
import Knight from '../images/units/fr/Knight.webp'
import Leviathan from '../images/units/fr/Leviathan.webp'
import Shapeshifter from '../images/units/fr/Shapeshifter.webp'
import CaveSpirit from '../images/units/fr/CaveSpirit.webp'
import Cook from '../images/units/fr/Cook.webp'
import MysticalHealer from '../images/units/fr/MysticalHealer.webp'
import MasterAlchemist from '../images/units/fr/MasterAlchemist.webp'
import ForestSpirit from '../images/units/fr/ForestSpirit.webp'
import LandLord from '../images/units/fr/LandLord.webp'
import Manticore from '../images/units/fr/Manticore.webp'
import GiantSnake from '../images/units/fr/GiantSnake.webp'
import GrandArchitect from '../images/units/fr/GrandArchitect.webp'
import Colossus from '../images/units/fr/Colossus.webp'
import Cerberus from '../images/units/fr/Cerberus.webp'
import Farmer from '../images/units/fr/Farmer.webp'
import Kraken from '../images/units/fr/Kraken.webp'
import Demon from '../images/units/fr/Demon.webp'
import ForestChild from '../images/units/fr/ForestChild.webp'
import Ogre from '../images/units/fr/Ogre.webp'
import Hunter from '../images/units/fr/Hunter.webp'
import Blacksmith from '../images/units/fr/Blacksmith.webp'
import RelicOfWisdom from '../images/units/fr/RelicOfWisdom.webp'
import WoodMerchant from '../images/units/fr/WoodMerchant.webp'
import Strategist from '../images/units/fr/Strategist.webp'
import PalmReader from '../images/units/fr/PalmReader.webp'
import Archer from '../images/units/fr/Archer.webp'
import Golem from '../images/units/fr/Golem.webp'
import Salamander from '../images/units/fr/Salamander.webp'
import Monkey from '../images/units/fr/Monkey.webp'
import Adventurer from '../images/units/fr/Adventurer.webp'
import { UnitCardDescription } from './UnitCardDescription'

/** The French edition of the unit cards (archive « Portage numérique », 100 px per cm, as the English ones) */
class FrenchUnitCardDescription extends UnitCardDescription {
  images = {
    [Unit.Commander]: Commander,
    [Unit.Militiaman]: Militiaman,
    [Unit.TimeMaster]: TimeMaster,
    [Unit.Peddler]: Peddler,
    [Unit.Rogue]: Rogue,
    [Unit.Sculptor]: Sculptor,
    [Unit.Treefolk]: Treefolk,
    [Unit.Necromancer]: Necromancer,
    [Unit.Veteran]: Veteran,
    [Unit.Miner]: Miner,
    [Unit.Woodcutter]: Woodcutter,
    [Unit.Dragon]: Dragon,
    [Unit.Knight]: Knight,
    [Unit.Leviathan]: Leviathan,
    [Unit.Shapeshifter]: Shapeshifter,
    [Unit.CaveSpirit]: CaveSpirit,
    [Unit.Cook]: Cook,
    [Unit.MysticalHealer]: MysticalHealer,
    [Unit.MasterAlchemist]: MasterAlchemist,
    [Unit.ForestSpirit]: ForestSpirit,
    [Unit.LandLord]: LandLord,
    [Unit.Manticore]: Manticore,
    [Unit.GiantSnake]: GiantSnake,
    [Unit.GrandArchitect]: GrandArchitect,
    [Unit.Colossus]: Colossus,
    [Unit.Cerberus]: Cerberus,
    [Unit.Farmer]: Farmer,
    [Unit.Kraken]: Kraken,
    [Unit.Demon]: Demon,
    [Unit.ForestChild]: ForestChild,
    [Unit.Ogre]: Ogre,
    [Unit.Hunter]: Hunter,
    [Unit.Blacksmith]: Blacksmith,
    [Unit.RelicOfWisdom]: RelicOfWisdom,
    [Unit.WoodMerchant]: WoodMerchant,
    [Unit.Strategist]: Strategist,
    [Unit.PalmReader]: PalmReader,
    [Unit.Archer]: Archer,
    [Unit.Golem]: Golem,
    [Unit.Salamander]: Salamander,
    [Unit.Monkey]: Monkey,
    [Unit.Adventurer]: Adventurer
  }
}

export const frenchUnitCardDescription = new FrenchUnitCardDescription()
