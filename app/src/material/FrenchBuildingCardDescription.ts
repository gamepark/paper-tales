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
import Abbey1 from '../images/buildings/fr/level1/AbbeyL1.webp'
import Abbey2 from '../images/buildings/fr/level2/AbbeyL2.webp'
import Library1 from '../images/buildings/fr/level1/LibraryL1.webp'
import Library2 from '../images/buildings/fr/level2/LibraryL2.webp'
import Crypt1 from '../images/buildings/fr/level1/CryptL1.webp'
import Crypt2 from '../images/buildings/fr/level2/CryptL2.webp'
import BlackMarket1 from '../images/buildings/fr/level1/BlackMarketL1.webp'
import BlackMarket2 from '../images/buildings/fr/level2/BlackMarketL2.webp'
import BackRoom1 from '../images/buildings/fr/level1/BackRoomL1.webp'
import BackRoom2 from '../images/buildings/fr/level2/BackRoomL2.webp'
import Port1 from '../images/buildings/fr/level1/PortL1.webp'
import Port2 from '../images/buildings/fr/level2/PortL2.webp'
import Inn1 from '../images/buildings/fr/level1/InnL1.webp'
import Inn2 from '../images/buildings/fr/level2/InnL2.webp'
import Sawmill1 from '../images/buildings/fr/level1/SawmillL1.webp'
import Sawmill2 from '../images/buildings/fr/level2/SawmillL2.webp'
import RoyalPalace1 from '../images/buildings/fr/level1/RoyalPalaceL1.webp'
import RoyalPalace2 from '../images/buildings/fr/level2/RoyalPalaceL2.webp'
import { BuildingCardDescription } from './BuildingCardDescription'

/** The French edition of the building cards, level 1 face and level 2 face */
class FrenchBuildingCardDescription extends BuildingCardDescription {
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
}

export const frenchBuildingCardDescription = new FrenchBuildingCardDescription()
