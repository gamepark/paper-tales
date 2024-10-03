import { Building } from '@gamepark/paper-tales/material/Building'
import { CardDescription } from '@gamepark/react-game'
import Mine from '../images/buildings/en/level1/MineL1.jpg'
import Barracks from '../images/buildings/en/level1/BarracksL1.jpg'
import Tavern from '../images/buildings/en/level1/TavernL1.jpg'
import Temple from '../images/buildings/en/level1/TempleL1.jpg'
import Town from '../images/buildings/en/level1/TownL1.jpg'


export class BuildingCardDescription extends CardDescription {
    height = 10
    width = 14
    borderRadius = 0.5
  
  
  //Image en EN.
    images = {
      [Building.Mine] : Mine,
      [Building.Barracks] : Barracks,
      [Building.Tavern] : Tavern,
      [Building.Temple] : Temple,
      [Building.Town] : Town,

    }
  
  }
  
  export const buildingCardDescription = new BuildingCardDescription()