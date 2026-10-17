import { Building } from '@gamepark/paper-tales/material/Building'
import Mine1 from '../images/buildings/fr/level1/MineL1.webp'
import Barracks1 from '../images/buildings/fr/level1/BarracksL1.webp'
import Tavern1 from '../images/buildings/fr/level1/TavernL1.webp'
import Temple1 from '../images/buildings/fr/level1/TempleL1.webp'
import Town1 from '../images/buildings/fr/level1/TownL1.webp'
import Mine2 from '../images/buildings/fr/level2/MineL2.webp'
import Barracks2 from '../images/buildings/fr/level2/BarracksL2.webp'
import Tavern2 from '../images/buildings/fr/level2/TavernL2.webp'
import Temple2 from '../images/buildings/fr/level2/TempleL2.webp'
import Town2 from '../images/buildings/fr/level2/TownL2.webp'
import { BuildingCardDescription } from './BuildingCardDescription'

/** The French edition of the building cards, level 1 face and level 2 face */
class FrenchBuildingCardDescription extends BuildingCardDescription {
  images = {
    [Building.Mine]: Mine1,
    [Building.Barracks]: Barracks1,
    [Building.Tavern]: Tavern1,
    [Building.Temple]: Temple1,
    [Building.Town]: Town1
  }

  backImages = {
    [Building.Mine]: Mine2,
    [Building.Barracks]: Barracks2,
    [Building.Tavern]: Tavern2,
    [Building.Temple]: Temple2,
    [Building.Town]: Town2
  }
}

export const frenchBuildingCardDescription = new FrenchBuildingCardDescription()
