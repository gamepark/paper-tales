import { hideItemId, hideItemIdToOthers, HidingStrategy, MaterialGame, MaterialItem, MaterialMove, PositiveSequenceStrategy, SecretMaterialRules, TimeLimit } from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { Draft } from './rules/1_Recruit/Draft'
import { RuleId } from './rules/RuleId'
import { Deal } from './rules/1_Recruit/Deal'
import { GiveDraftToNeighbor } from './rules/1_Recruit/GiveDraftToNeighbor'
import { PlaceUnitOnBoard } from './rules/2_Deployment/PlaceUnitOnBoard'
import { RevealBoards } from './rules/2_Deployment/RevealBoards'
import { PayDeployedUnits } from './rules/2_Deployment/PayDeployedUnits'
import { War } from './rules/3_War/War'
import { Income } from './rules/4_Income/Income'
import { Build } from './rules/5_Build/Build'
import { NextTurn } from './rules/6_Age/NextTurn'
import { EndGame } from './rules/6_Age/EndGame'
import { AgeEffects } from './rules/6_Age/AgeEffects'
import { AgeUnitsAge } from './rules/6_Age/AgeUnitsAge'
import { AgeUnitsDie } from './rules/6_Age/AgeUnitsDie'
import { SaveUnitsWithMysticEffect } from './rules/6_Age/SaveUnitsWithMysticEffect'
import { DeployEffects } from './rules/2_Deployment/DeployEffects'

export class PaperTalesRules extends SecretMaterialRules<PlayerColor, MaterialType, LocationType>
  implements TimeLimit<MaterialGame<PlayerColor, MaterialType, LocationType>, MaterialMove<PlayerColor, MaterialType, LocationType>, PlayerColor> {
  rules = {
    [RuleId.Draft]: Draft,
    [RuleId.Deal]: Deal,
    [RuleId.GiveDraftToNeighbor]: GiveDraftToNeighbor,
    [RuleId.PlaceUnitOnBoard]: PlaceUnitOnBoard,
    [RuleId.RevealBoards]: RevealBoards,
    [RuleId.PayDeployedUnits]:PayDeployedUnits,
    [RuleId.DeployEffects]:DeployEffects,
    [RuleId.War]: War,
    [RuleId.Income]:Income,
    [RuleId.Build]:Build,
    [RuleId.SaveUnitsWithMysticEffect]:SaveUnitsWithMysticEffect,
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
    },
    [MaterialType.Building]:{
      [LocationType.PlayerBuildingBoard]: new PositiveSequenceStrategy("y")
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

  getScore(player:number){
    return this.material(MaterialType.ScoreToken).location(LocationType.PlayerScore).player(player)
  }
  

  giveTime(): number {
    return 60
  }
}

export const hideRotatedCardToOthers: HidingStrategy = (item: MaterialItem<number, LocationType>, player?: number) =>
  item.location.rotation && item.location.player !== player ? ['id'] : []


