import { Building } from './Building'
import { CountKind, Effect, EffectType, WhichUnit } from './effects/Effect'
import { MaterialType } from './MaterialType'
import { Resources } from './Resources'

export type BuildingPattern = {
  /** Legend points at the end of the game, for the level 1 and the level 2 faces (rulebook p.8) */
  points1: number
  points2: number
  cost1: Resources[]
  cost1Alternate?: Resources[]
  cost2: Resources[]
  cost2Alternate?: Resources[]
  resources1?: Resources[]
  resources2?: Resources[]
  /** The effects of the level 1 face; the level 2 face has them too, plus its own (rulebook p.4) */
  effect1?: Effect[]
  effect2?: Effect[]
}

export const buildingCardCaracteristics: Record<Building, BuildingPattern> = {
  [Building.Mine]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Wood],
    cost2: [Resources.Wood, Resources.Diamond],
    resources1: [Resources.Diamond],
    effect2: [
      {
        type: EffectType.ScoreAtWar,
        amount: 2,
        perResource: Resources.Diamond
      }
    ]
  },
  [Building.Tavern]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Food],
    cost2: [Resources.Wood, Resources.Food],
    effect1: [
      {
        type: EffectType.IncomePerResource,
        amount: 1,
        resource: Resources.Food
      }
    ],
    effect2: [
      {
        type: EffectType.ScoreAtWar,
        amount: 1,
        perResource: Resources.Food
      }
    ]
  },
  [Building.Barracks]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Wood],
    cost2: [Resources.Wood, Resources.Food],
    effect1: [
      {
        type: EffectType.AddWarPower,
        powerAdded: 1,
        perResource: [Resources.Wood]
      }
    ],
    effect2: [
      {
        type: EffectType.ScoreAtWar,
        amount: 1,
        perUnitStrongerThan: 3
      }
    ]
  },
  [Building.Town]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Wood],
    cost2: [Resources.Wood, Resources.Wood],
    resources1: [Resources.Wood, Resources.Food],
    resources2: [Resources.Diamond]
  },
  [Building.Temple]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Diamond],
    cost1Alternate: [Resources.Gold, Resources.Gold],
    cost2: [Resources.Diamond, Resources.Diamond],
    cost2Alternate: [Resources.Gold, Resources.Gold, Resources.Gold],
    effect1: [
      {
        type: EffectType.Income,
        amount: 2
      }
    ],
    effect2: [
      {
        type: EffectType.ScoreAtWar,
        amount: 2
      }
    ]
  },
  // Beyond the gates
  [Building.Abbey]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Food, Resources.Gold, Resources.Gold, Resources.Gold],
    cost2: [Resources.Food, Resources.Gold, Resources.Gold, Resources.Gold],
    resources1: [Resources.Food, Resources.Food],
    effect2: [{ type: EffectType.ScoreAtWar, amount: 1, per: { kind: CountKind.Resources } }]
  },
  [Building.Library]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Wood, Resources.Diamond, Resources.Gold],
    cost2: [Resources.Wood, Resources.Diamond, Resources.Gold],
    effect1: [{ type: EffectType.GainOnAge, token: MaterialType.Gold, amount: 1, per: { kind: CountKind.DyingUnits } }],
    effect2: [{ type: EffectType.ScoreAtWar, amount: 1, per: { kind: CountKind.AgeTokensInKingdom } }]
  },
  [Building.Crypt]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Diamond],
    cost2: [Resources.Wood, Resources.Diamond],
    resources2: [Resources.Food, Resources.Food],
    effect1: [{ type: EffectType.GainAgeToken, onDeployment: false, whichUnit: WhichUnit.All, amount: 1 }],
    effect2: [{ type: EffectType.Income, amount: 2 }]
  },
  [Building.BlackMarket]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Diamond],
    cost2: [Resources.Diamond, Resources.Gold, Resources.Gold],
    resources1: [Resources.Diamond],
    effect2: [{ type: EffectType.ScoreAtWar, amount: 1, per: { kind: CountKind.IncomeGold } }]
  },
  [Building.BackRoom]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Food],
    cost2: [Resources.Wood, Resources.Diamond],
    effect1: [{ type: EffectType.IgnoreLevel2Cost }],
    effect2: [{ type: EffectType.AddWarPower, powerAdded: 2 }]
  },
  [Building.Port]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Food],
    cost2: [Resources.Food, Resources.Gold, Resources.Gold],
    effect1: [
      { type: EffectType.AddWarPower, powerAdded: -2 },
      { type: EffectType.Income, amount: 2 }
    ],
    effect2: [{ type: EffectType.ScoreAtWar, amount: 2, per: { kind: CountKind.ResourceTypes } }]
  },
  // What forges legends
  [Building.Inn]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Wood, Resources.Food],
    cost2: [Resources.Wood],
    effect1: [{ type: EffectType.Income, amount: 2 }],
    effect2: [{ type: EffectType.ScoreAtWar, amount: 1, per: { kind: CountKind.UnitCosts } }]
  },
  [Building.Sawmill]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Wood, Resources.Wood],
    cost2: [Resources.Wood],
    resources1: [Resources.Wood, Resources.Wood],
    effect2: [{ type: EffectType.ScoreAtWar, amount: 1, per: { kind: CountKind.Resources, resources: [Resources.Wood] } }]
  },
  [Building.RoyalPalace]: {
    points1: 1,
    points2: 3,
    cost1: [Resources.Wood],
    cost2: [Resources.Wood, Resources.Gold, Resources.Gold],
    effect1: [{ type: EffectType.Income, amount: 1, per: { kind: CountKind.Artifacts } }],
    effect2: [{ type: EffectType.ScoreAtWar, amount: 2, per: { kind: CountKind.Artifacts } }]
  }
}
