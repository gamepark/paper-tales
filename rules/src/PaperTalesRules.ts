import { hideItemId, hideItemIdToOthers, HidingStrategy, MaterialGame, MaterialItem, MaterialMove, PositiveSequenceStrategy, SecretMaterialRules, TimeLimit } from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { Draft } from './rules/Draft'
import { RuleId } from './rules/RuleId'
import { Deal } from './rules/Deal'
import { GiveDraftToNeighbor } from './rules/GiveDraftToNeighbor'
import { PlaceUnitOnBoard } from './rules/PlaceUnitOnBoard'
import { RevealBoards } from './rules/RevealBoards'
import { PayDeployedUnits } from './rules/PayDeployedUnits'
import { War } from './rules/War'
import { Income } from './rules/Income'
import { Build } from './rules/Build'
import { NextTurn } from './rules/NextTurn'
import { EndGame } from './rules/EndGame'
import { AgeEffects } from './rules/AgeEffects'
import { AgeUnitsAge } from './rules/AgeUnitsAge'
import { AgeUnitsDie } from './rules/AgeUnitsDie'

export class PaperTalesRules extends SecretMaterialRules<PlayerColor, MaterialType, LocationType>
  implements TimeLimit<MaterialGame<PlayerColor, MaterialType, LocationType>, MaterialMove<PlayerColor, MaterialType, LocationType>, PlayerColor> {
  rules = {
    [RuleId.Draft]: Draft,
    [RuleId.Deal]: Deal,
    [RuleId.GiveDraftToNeighbor]: GiveDraftToNeighbor,
    [RuleId.PlaceUnitOnBoard]: PlaceUnitOnBoard,
    [RuleId.RevealBoards]: RevealBoards,
    [RuleId.PayDeployedUnits]:PayDeployedUnits,
    [RuleId.War]: War,
    [RuleId.Income]:Income,
    [RuleId.Build]:Build,
    [RuleId.AgeEffects]:AgeEffects,
    [RuleId.AgeUnitsAge]:AgeUnitsAge,
    [RuleId.AgeUnitsDie]:AgeUnitsDie,
    [RuleId.NextTurn]:NextTurn,
    [RuleId.EndGame]:EndGame,
  }

  locationsStrategies = {
    [MaterialType.Unit]:{
      [LocationType.Deck]: new PositiveSequenceStrategy(),
      [LocationType.Discard]: new PositiveSequenceStrategy(),
      [LocationType.PlayerDraftHand]: new PositiveSequenceStrategy(),
      [LocationType.PlayerUnitHand]: new PositiveSequenceStrategy(),
    }
  }

  hidingStrategies = {
    [MaterialType.Unit]:{
      [LocationType.Deck]:hideItemId,
      [LocationType.PlayerDraftHand]:hideItemIdToOthers,
      [LocationType.PlayerUnitHand]:hideItemIdToOthers,
      [LocationType.Discard]:hideItemId,
      [LocationType.PlayerUnitBoard]:hideRotatedCardToOthers,
    }
  }


  giveTime(): number {
    return 60
  }
}

export const hideRotatedCardToOthers: HidingStrategy = (item: MaterialItem<number, LocationType>, player?: number) =>
  item.location.rotation && item.location.player !== player ? ['id'] : []