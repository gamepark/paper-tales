import { AgeLocation, ConditionKind, CountKind, Effect, EffectType, WhichBuilding, WhichUnit } from './effects/Effect'
import { MaterialType } from './MaterialType'
import { Resources } from './Resources'
import { Unit } from './Unit'

export type UnitPattern = {
  cost: number
  power: number
  /** The resources printed in the scroll of the card, each line with its own condition */
  resources?: ResourceProduction[]
  effect?: Effect[]
}

export type ResourceProduction = {
  type: Resources[]
  condition?: ResourcesCondition
}

export type ResourcesCondition = {
  onLane?: LaneType
  perAgeToken?: boolean
  ifAgeToken?: boolean
}

export enum LaneType {
  FrontLane = 0,
  BackLane
}

export const unitCardCaracteristics: Record<Unit, UnitPattern> = {
  [Unit.Commander]: {
    cost: 2,
    power: 4,
    effect: [
      {
        type: EffectType.GainTokenIfWinWar,
        token: MaterialType.ScoreToken,
        amount: 1
      }
    ]
  },
  [Unit.Militiaman]: {
    cost: 0,
    power: 2,
    effect: [
      {
        type: EffectType.AddWarPower,
        powerAdded: 1,
        perAgeToken: AgeLocation.OnUnit
      }
    ]
  },
  [Unit.TimeMaster]: {
    cost: 0,
    power: 1,
    effect: [
      {
        type: EffectType.GainAgeTokenOnChosenUnit,
        amount: 2,
        onDeployment: true
      }
    ]
  },
  [Unit.Peddler]: {
    cost: 1,
    power: 1,
    resources: [{
      type: [Resources.Wood]
    }],
    effect: [
      {
        type: EffectType.Income,
        amount: 1
      }
    ]
  },
  [Unit.Rogue]: {
    cost: 1,
    power: 3,
    effect: [
      {
        type: EffectType.GainTokenIfWinWar,
        token: MaterialType.Gold,
        amount: 1
      }
    ]
  },
  [Unit.Sculptor]: {
    cost: 0,
    power: 1,
    effect: [
      {
        type: EffectType.GainTokenIfDying,
        amount: 3,
        tokenGain: MaterialType.ScoreToken,
        whoDies: WhichUnit.Myself
      }
    ]
  },
  [Unit.Treefolk]: {
    cost: 1,
    power: 3,
    resources: [{
      type: [Resources.Food]
    }]
  }, // OK
  [Unit.Necromancer]: {
    cost: 1,
    power: 4,
    effect: [
      {
        type: EffectType.GainAgeToken,
        amount: 1,
        onDeployment: true,
        whichUnit: WhichUnit.Others
      }
    ]
  },
  [Unit.Veteran]: {
    cost: 0,
    power: 3,
    effect: [
      {
        type: EffectType.GainAgeToken,
        amount: 1,
        onDeployment: true,
        whichUnit: WhichUnit.Myself
      }
    ]
  },
  [Unit.Miner]: {
    cost: 1,
    power: 2,
    resources: [{
      type: [Resources.Diamond]
    }]
  }, // OK
  [Unit.Woodcutter]: {
    cost: 0,
    power: 2,
    resources: [{
      type: [Resources.Wood]
    }]
  },
  [Unit.Dragon]: {
    cost: 3,
    power: 0,
    effect: [
      {
        type: EffectType.ChangeWarPower,
        alternativePower: 7,
        ifResource: [Resources.Diamond]
      }
    ]
  },
  [Unit.Knight]: {
    cost: 1,
    power: 4
  }, // OK
  [Unit.Leviathan]: {
    cost: 3,
    power: 4,
    resources: [{
      type: [Resources.Food, Resources.Food],
      condition: { ifAgeToken: true }
    }],
    effect: [
      {
        type: EffectType.AddWarPower,
        powerAdded: 2,
        perResource: [Resources.Food]
      },
      {
        type: EffectType.CantWar,
        ifAgeToken: true
      }
    ]
  },
  [Unit.Shapeshifter]: {
    cost: 0,
    power: 0,
    effect: [
      {
        type: EffectType.Shapeshifter,
        onDeployment: true
      }
    ]
  },
  [Unit.CaveSpirit]: {
    cost: 1,
    power: 4,
    resources: [{
      type: [Resources.Diamond]
    }],
    effect: [
      {
        type: EffectType.GainAgeToken,
        amount: 1,
        onDeployment: true,
        whichUnit: WhichUnit.Myself
      }
    ]
  },
  [Unit.Cook]: {
    cost: 0,
    power: 1,
    effect: [
      {
        type: EffectType.IncomePerResource,
        resource: Resources.Food,
        amount: 1
      }
    ]
  },
  [Unit.MysticalHealer]: {
    cost: 0,
    power: 1,
    effect: [
      {
        type: EffectType.MysticEffect
      }
    ]
  },
  [Unit.MasterAlchemist]: {
    cost: 2,
    power: 1,
    effect: [
      {
        type: EffectType.IncomePerResource,
        resource: Resources.Wood,
        amount: 1
      },
      {
        type: EffectType.GainTokenIfWinWar,
        token: MaterialType.ScoreToken,
        perResource: [Resources.Diamond],
        amount: 1
      },
      {
        type: EffectType.GainAgeTokenOnChosenUnit,
        onDeployment: false,
        amount: 1,
        perResource: Resources.Food
      }
    ]
  },
  [Unit.ForestSpirit]: {
    cost: 3,
    power: 3,
    resources: [{
      type: [Resources.Wood, Resources.Wood, Resources.Wood]
    }]
  }, // OK
  [Unit.LandLord]: {
    cost: 2,
    power: 1,
    resources: [{
      type: [Resources.Wood]
    }],
    // Printed on the card: ignore the land cost (construction)
    effect: [{ type: EffectType.IgnoreFieldCost }]
  },
  [Unit.Manticore]: {
    cost: 2,
    power: 2,
    effect: [
      {
        type: EffectType.AddWarPower,
        powerAdded: 2,
        perResource: [Resources.Food]
      }
    ]
  },
  [Unit.GiantSnake]: {
    cost: 1,
    power: 4,
    effect: [
      {
        type: EffectType.IncomeIfAgeToken,
        amount: 3
      },
      {
        type: EffectType.ChangeWarPower,
        alternativePower: 0,
        ifAgeToken: true
      }
    ]
  },
  [Unit.GrandArchitect]: {
    cost: 1,
    power: 1,
    effect: [
      {
        type: EffectType.ReplaceResourceByGold,
        resource: [Resources.Wood, Resources.Food, Resources.Diamond]
      }
    ]
  },
  [Unit.Colossus]: {
    cost: 2,
    power: 1,
    effect: [
      {
        type: EffectType.ChangeWarPower,
        alternativePower: 7,
        ifAgeToken: true
      },
      {
        type: EffectType.GainTokenIfWinWar,
        token: MaterialType.ScoreToken,
        amount: 1
      }
    ]
  },
  [Unit.Cerberus]: {
    cost: 0,
    power: 2,
    effect: [
      {
        type: EffectType.ChangeWarPower,
        alternativePower: 3,
        ifResource: [Resources.Food]
      }
    ]
  },
  [Unit.Farmer]: {
    cost: 0,
    power: 1,
    resources: [{
      type: [Resources.Food]
    }]
  }, // OK
  [Unit.Kraken]: {
    cost: 6,
    power: 9,
    effect: [
      {
        type: EffectType.GainTokenIfDying,
        amount: 1,
        tokenGain: MaterialType.ScoreToken,
        whoDies: WhichUnit.All,
        perAgeToken: true
      },
      {
        type: EffectType.GainAgeToken,
        amount: 1,
        onDeployment: true,
        whichUnit: WhichUnit.Others
      },
      {
        type: EffectType.GainTokenOnDeploy,
        amount: -3,
        onDeployment: true,
        token: MaterialType.ScoreToken,
        per: { kind: CountKind.Level2Buildings }
      }
    ]
  },
  [Unit.Demon]: {
    cost: 2,
    power: 7,
    effect: [
      {
        type: EffectType.GainTokenIfDying,
        amount: -3,
        tokenGain: MaterialType.ScoreToken,
        whoDies: WhichUnit.Myself,
        ifSingleAgeToken: true
      },
      {
        type: EffectType.GainAgeToken,
        amount: 1,
        onDeployment: true,
        whichUnit: WhichUnit.Myself
      }
    ]
  },
  [Unit.ForestChild]: {
    cost: 1,
    power: 1,
    resources: [{
      type: [Resources.Wood, Resources.Food]
    }]
  }, // OK
  [Unit.Ogre]: {
    cost: 2,
    power: 2,
    effect: [
      {
        type: EffectType.AddWarPower,
        powerAdded: 1,
        perGoldOnIncomePhase: true
      }
    ]
  },
  [Unit.Hunter]: {
    cost: 0,
    power: 2,
    resources: [{
      type: [Resources.Food],
      condition: {
        onLane: LaneType.FrontLane
      }
    }]
  }, // OK
  [Unit.Blacksmith]: {
    cost: 0,
    power: 1,
    effect: [
      {
        type: EffectType.Income,
        amount: 1
      }
    ]
  },
  [Unit.RelicOfWisdom]: {
    cost: 2,
    power: 0,
    effect: [
      {
        type: EffectType.SpecialDyingCondition,
        dyingFromAmount: 0
      },
      {
        type: EffectType.RelicEffect,
        amount: 2
      }
    ]
  },
  [Unit.WoodMerchant]: {
    cost: 0,
    power: 1,
    effect: [
      {
        type: EffectType.ReplaceResourceByGold,
        resource: [Resources.Wood]
      }
    ]
  },
  [Unit.Strategist]: {
    cost: 3,
    power: 1,
    effect: [
      {
        type: EffectType.WarFromBacklane
      },
      {
        type: EffectType.AddWarPower,
        powerAdded: 1,
        perAgeToken: AgeLocation.InRealm
      }
    ]
  },
  [Unit.PalmReader]: {
    cost: 2,
    power: 1,
    effect: [
      {
        type: EffectType.GainTokenIfDying,
        amount: 1,
        tokenGain: MaterialType.ScoreToken,
        whoDies: WhichUnit.All,
        perAgeToken: true
      }
    ]
  },
  [Unit.Archer]: {
    cost: 1,
    power: 2,
    effect: [
      {
        type: EffectType.WarFromBacklane
      }
    ]
  },
  [Unit.Golem]: {
    cost: 2,
    power: 3,
    effect: [
      {
        type: EffectType.ImproveBuilding,
        onDeployment: true,
        whichBuilding: WhichBuilding.All
      }
    ]
  },
  [Unit.Salamander]: {
    cost: 2,
    power: 4,
    effect: [
      {
        type: EffectType.AddWarPower,
        powerAdded: 1,
        perAgeToken: AgeLocation.OnUnit
      },
      {
        type: EffectType.SpecialDyingCondition,
        dyingFromAmount: 2
      }
    ]
  },
  [Unit.Monkey]: {
    cost: -1,
    power: 1,
    effect: [
      {
        type: EffectType.GainTokenIfDying,
        amount: 1,
        tokenGain: MaterialType.Gold,
        whoDies: WhichUnit.Myself,
        perAgeToken: true
      }
    ]
  },
  [Unit.Adventurer]: {
    cost: 0,
    power: 2,
    resources: [{
      type: [Resources.Diamond],
      condition: {
        perAgeToken: true
      }
    }]
  }, // OK
  // Beyond the gates
  [Unit.WizardApprentice]: {
    cost: 0,
    power: 1,
    effect: [{ type: EffectType.MoveAgeToken, onDeployment: true }]
  },
  [Unit.Shadow]: {
    cost: 1,
    power: 3,
    effect: [{ type: EffectType.ReactivateRevealEffects, onDeployment: true }]
  },
  [Unit.Imp]: {
    cost: -2,
    power: 2,
    effect: [
      { type: EffectType.GainAgeToken, amount: 1, onDeployment: true, whichUnit: WhichUnit.Myself },
      { type: EffectType.GainTokenIfDying, amount: -2, tokenGain: MaterialType.ScoreToken, whoDies: WhichUnit.Myself, ifSingleAgeToken: true }
    ]
  },
  [Unit.Dryad]: {
    cost: 1,
    power: 3,
    resources: [{ type: [Resources.Wood] }],
    effect: [
      { type: EffectType.GainAgeToken, amount: 1, onDeployment: true, whichUnit: WhichUnit.Myself },
      { type: EffectType.ReplaceResourceByResource, by: Resources.Wood, resource: [Resources.Food, Resources.Diamond] }
    ]
  },
  [Unit.Smuggler]: {
    cost: 0,
    power: 1,
    effect: [{ type: EffectType.GainTokenOnDeploy, onDeployment: true, token: MaterialType.Gold, amount: 1, per: { kind: CountKind.ResourceTypes } }]
  },
  [Unit.Djinn]: {
    cost: 2,
    power: 1,
    effect: [
      { type: EffectType.ImproveBuilding, onDeployment: true, whichBuilding: WhichBuilding.Choice },
      { type: EffectType.GainAgeTokenOnChosenUnit, onDeployment: true, amount: 1 },
      { type: EffectType.GainTokenOnDeploy, onDeployment: true, token: MaterialType.Gold, amount: 1 }
    ]
  },
  [Unit.Princess]: {
    cost: 5,
    power: 1,
    effect: [{ type: EffectType.DoubleBuildingWarScore }]
  },
  [Unit.HighSteward]: {
    cost: 2,
    power: 3,
    resources: [{ type: [Resources.Food] }],
    effect: [
      { type: EffectType.GainTokenOnDeploy, onDeployment: true, token: MaterialType.Gold, amount: 1, per: { kind: CountKind.UnitsWithPower, min: 3 } }
    ]
  },
  [Unit.Noble]: {
    cost: 3,
    power: 1,
    resources: [{ type: [Resources.Diamond] }],
    effect: [
      { type: EffectType.GainTokenOnDeploy, onDeployment: true, token: MaterialType.ScoreToken, amount: 2, per: { kind: CountKind.UnitsWithCost, min: 2 } }
    ]
  },
  [Unit.LostSoul]: {
    cost: 4,
    power: 0,
    effect: [{ type: EffectType.GainTokenIfDying, amount: 7, tokenGain: MaterialType.ScoreToken, whoDies: WhichUnit.Myself }]
  },
  [Unit.RelicOfWar]: {
    cost: 2,
    power: 0,
    effect: [
      { type: EffectType.AddWarPower, powerAdded: 1, perAgeToken: AgeLocation.OnUnit },
      { type: EffectType.SpecialDyingCondition, dyingFromAmount: 0 },
      { type: EffectType.RelicEffect, amount: 1 }
    ]
  },
  [Unit.RelicOfLight]: {
    cost: 2,
    power: 2,
    effect: [
      { type: EffectType.SpecialDyingCondition, dyingFromAmount: 0 },
      { type: EffectType.GainOnAge, token: MaterialType.ScoreToken, amount: 1, per: { kind: CountKind.OtherSurvivingUnits } }
    ]
  },
  [Unit.Jeweler]: {
    cost: 1,
    power: 2,
    resources: [{ type: [Resources.Diamond], condition: { perAgeToken: true } }],
    effect: [{ type: EffectType.Income, amount: 1, per: { kind: CountKind.AgeTokensOnSelf } }]
  },
  // What forges legends
  [Unit.ServileMinion]: {
    cost: -1,
    power: 2,
    effect: [{ type: EffectType.GainAgeToken, amount: 1, onDeployment: true, whichUnit: WhichUnit.Myself }]
  },
  [Unit.CaveLizard]: {
    cost: 1,
    power: 2,
    resources: [{ type: [Resources.Diamond], condition: { perAgeToken: true } }, { type: [Resources.Food] }]
  },
  [Unit.Pioneer]: {
    cost: 1,
    power: 2,
    resources: [{ type: [Resources.Wood, Resources.Diamond] }],
    effect: [{ type: EffectType.GainAgeToken, amount: 1, onDeployment: true, whichUnit: WhichUnit.Myself }]
  },
  [Unit.WeaponMaster]: {
    cost: 0,
    power: 3,
    effect: [{ type: EffectType.GainAgeToken, amount: 1, onDeployment: true, whichUnit: WhichUnit.OthersDeployedThisTurn }]
  },
  [Unit.GoldDigger]: {
    cost: 2,
    power: 1,
    resources: [{ type: [Resources.Diamond], condition: { onLane: LaneType.FrontLane } }],
    effect: [{ type: EffectType.Income, amount: 2 }]
  },
  [Unit.WolfPack]: {
    cost: 2,
    power: 2,
    resources: [{ type: [Resources.Food] }],
    effect: [
      { type: EffectType.GainAgeToken, amount: 1, onDeployment: true, whichUnit: WhichUnit.Myself },
      { type: EffectType.AddWarPower, powerAdded: 2, perResource: [Resources.Food] }
    ]
  },
  [Unit.Trapper]: {
    cost: 1,
    power: 1,
    resources: [{ type: [Resources.Wood] }],
    effect: [{ type: EffectType.IncomePerResource, resource: Resources.Food, amount: 1 }]
  },
  [Unit.BannerBearer]: {
    cost: 0,
    power: 1,
    effect: [
      {
        type: EffectType.GainTokenOnDeploy,
        onDeployment: true,
        token: MaterialType.Gold,
        amount: 2,
        condition: { kind: ConditionKind.UnitWithCost, min: 2 }
      },
      {
        type: EffectType.GainTokenOnDeploy,
        onDeployment: true,
        token: MaterialType.ScoreToken,
        amount: 2,
        condition: { kind: ConditionKind.UnitWithCost, min: 3 }
      }
    ]
  },
  [Unit.RelicOfHarvest]: {
    cost: 2,
    power: 1,
    effect: [
      {
        type: EffectType.ScoreAtWar,
        amount: 1,
        per: { kind: CountKind.Resources, resources: [Resources.Wood, Resources.Food] },
        condition: { kind: ConditionKind.OnFrontLane }
      },
      { type: EffectType.SpecialDyingCondition, dyingFromAmount: 0 }
    ]
  },
  [Unit.RelicOfFate]: {
    cost: 2,
    power: 0,
    effect: [
      { type: EffectType.GainTokenIfDying, amount: 1, tokenGain: MaterialType.ScoreToken, whoDies: WhichUnit.All, perAgeToken: true },
      { type: EffectType.SpecialDyingCondition, dyingFromAmount: 0 },
      { type: EffectType.RelicEffect, amount: 1 }
    ]
  },
  [Unit.WarMusician]: {
    cost: 0,
    power: 1,
    effect: [
      { type: EffectType.AddWarPower, powerAdded: 1, per: { kind: CountKind.Artifacts } },
      { type: EffectType.GainTokenIfDying, amount: 1, tokenGain: MaterialType.ScoreToken, whoDies: WhichUnit.Myself, per: { kind: CountKind.Artifacts } }
    ]
  },
  [Unit.Scribe]: {
    cost: 0,
    power: 1,
    effect: [
      { type: EffectType.GainTokenOnDeploy, onDeployment: true, token: MaterialType.Gold, amount: 1, per: { kind: CountKind.Artifacts } },
      { type: EffectType.GainTokenOnDeploy, onDeployment: true, token: MaterialType.ScoreToken, amount: 1, per: { kind: CountKind.Artifacts } }
    ]
  },
  [Unit.CourtJester]: {
    cost: 3,
    power: 1,
    effect: [
      { type: EffectType.DrawArtifact, onDeployment: true },
      { type: EffectType.Income, amount: 1, per: { kind: CountKind.Artifacts } }
    ]
  },
  [Unit.Titan]: {
    cost: 8,
    power: 8,
    resources: [{ type: [Resources.Wood, Resources.Food, Resources.Diamond] }],
    effect: [{ type: EffectType.BuildRandomLevel2, onDeployment: true }]
  }
}
