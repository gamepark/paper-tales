import { Building } from '@gamepark/paper-tales/material/Building'
import { CardDescription, ItemContext, MaterialContext } from '@gamepark/react-game'
import Mine1 from '../images/buildings/en/level1/MineL1.jpg'
import Barracks1 from '../images/buildings/en/level1/BarracksL1.jpg'
import Tavern1 from '../images/buildings/en/level1/TavernL1.jpg'
import Temple1 from '../images/buildings/en/level1/TempleL1.jpg'
import Town1 from '../images/buildings/en/level1/TownL1.jpg'
import Mine2 from '../images/buildings/en/level2/MineL2.jpg'
import Barracks2 from '../images/buildings/en/level2/BarracksL2.jpg'
import Tavern2 from '../images/buildings/en/level2/TavernL2.jpg'
import Temple2 from '../images/buildings/en/level2/TempleL2.jpg'
import Town2 from '../images/buildings/en/level2/TownL2.jpg'
import { MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { BuildingHelp } from './help/BuildingHelp'



export class BuildingCardDescription extends CardDescription {
    height = 10
    width = 14
    borderRadius = 0.5
  
  
  //Image en EN.

    backImages = {
      [Building.Mine] : Mine2,
      [Building.Barracks] : Barracks2,
      [Building.Tavern] : Tavern2,
      [Building.Temple] : Temple2,
      [Building.Town] : Town2,
    }

    images = {
      [Building.Mine] : Mine1,
      [Building.Barracks] : Barracks1,
      [Building.Tavern] : Tavern1,
      [Building.Temple] : Temple1,
      [Building.Town] : Town1,

    }


    canDrag(move: MaterialMove, context: ItemContext): boolean {
      return super.canDrag(move, context)
    }

    isFlipped(item: Partial<MaterialItem>, context: MaterialContext): boolean {
      return item.location?.rotation || super.isFlipped(item, context)
    }

    help = BuildingHelp
    
  }
  
  export const buildingCardDescription = new BuildingCardDescription()