import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Locator } from '@gamepark/react-game'
import { UnitDeckLocator } from './DeckLocator'
import { PaperTalesGoldLocator } from './GoldLocator'
import { PaperTalesDiscardLocator } from './DiscardLocator'

export const Locators: Partial<Record<LocationType, Locator<PlayerColor, MaterialType, LocationType>>> = {

    [LocationType.Deck]: new UnitDeckLocator(),
    [LocationType.GoldStock]: new PaperTalesGoldLocator(),
    [LocationType.Discard]: new PaperTalesDiscardLocator(),

}

