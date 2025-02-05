import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Locator, PileLocator } from '@gamepark/react-game'
import { unitDeckLocator } from './DeckLocator'
import { goldStockLocator } from './GoldStockLocator'
import { discardLocator } from './DiscardLocator'
import { playerDraftHandLocator } from './PlayerDraftHandLocator'
import { ageStockLocator } from './AgeStockLocator'
import { playerUnitHandLocator } from './PlayerUnitHandLocator'
import { playerGoldStockLocator } from './PlayerGoldStockLocator'
import { playerBuldingBoard } from './PlayerBuildingBoardLocator'
import { playerBuildingHandLocator } from './PlayerBuildingHandLocator'
import { playerUnitBoard } from './PlayerUnitBoard'
import { scoreBoardLocator } from './ScoreBoardLocator'
import { scoreTokenLocator } from './ScoreTokenLocator'
import { roundTokenLocator } from './RoundTokenLocator'
import { cardRotateButtonLocator } from './CardRotateButtonLocator'


export const Locators: Partial<Record<LocationType, Locator<PlayerColor, MaterialType, LocationType>>> = {

    [LocationType.Deck]: unitDeckLocator,
    [LocationType.GoldStock]: goldStockLocator,
    [LocationType.Discard]: discardLocator,
    [LocationType.PlayerDraftHand]: playerDraftHandLocator,
    [LocationType.AgeStock]: ageStockLocator,
    [LocationType.PlayerUnitHand]: playerUnitHandLocator,
    [LocationType.PlayerGoldStock]: playerGoldStockLocator,
    [LocationType.PlayerBuildingBoard]: playerBuldingBoard,
    [LocationType.PlayerBuildingHand]: playerBuildingHandLocator,
    [LocationType.PlayerUnitBoard]: playerUnitBoard,
    [LocationType.ScoreBoard]: scoreBoardLocator,
    [LocationType.PlayerScore]: scoreTokenLocator,
    [LocationType.Time]: roundTokenLocator,
    [LocationType.OnCard]: new PileLocator({ parentItemType: MaterialType.Unit , radius: 1, positionOnParent: { x: 50, y: 40 } }),
    [LocationType.CardRotate]: cardRotateButtonLocator,







}

