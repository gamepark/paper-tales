import { AgeLocation, Effect, EffectType, WhichBuilding, WhichUnit } from "./effects/Effect"
import { MaterialType } from "./MaterialType"
import { Resources } from "./Resources"
import { Unit } from "./Unit"

export type UnitPattern = {
    cost: number,
    power: number,
    // effects?:Effect[]
    resources?: {
        type : Resources[],
        condition?:{
            onLane?:LaneType,
            perAgeToken?:boolean,
            ifAgeToken?:boolean,
        }
    },
    effect? : Effect[]

}

export enum LaneType {
    FrontLane = 0,
    BackLane
}

export const unitCardCaracteristics: Record<Unit, UnitPattern> = {
    [Unit.Commander]: {
        cost: 2, 
        power: 4,
        effect:[{
            type:EffectType.GainTokenIfWinWar,
            token:MaterialType.ScoreToken,
            amount:1,
        
        }]
    },
    [Unit.Militiaman]: { 
        cost: 0, 
        power: 2,
        effect:[{
            type:EffectType.AddWarPower,
            powerAdded:1,
            perAgeToken:AgeLocation.OnUnit
        }]
    },
    [Unit.TimeMaster]: { 
        cost: 0, 
        power: 1 
    },
    [Unit.Peddler]: { 
        cost: 1, 
        power: 1, 
        resources:{
            type:[Resources.Wood]
        },
        effect:[{
            type:EffectType.Income,
            amount:1
        }]
    },
    [Unit.Rogue]: { 
        cost: 1, 
        power: 3,
        effect:[{
            type:EffectType.GainTokenIfWinWar,
            token:MaterialType.Gold,
            amount:1
        }] 
    },
    [Unit.Sculptor]: { 
        cost: 0, 
        power: 1,
        effect:[{
            type:EffectType.GainTokenIfDying,
            amount:3,
            tokenGain:MaterialType.ScoreToken,
            whoDies:WhichUnit.Myself
        }]
    },
    [Unit.Treefolk]: { 
        cost: 1, 
        power: 3, 
        resources:{
            type:[Resources.Food]
        }
    },  // OK
    [Unit.Necromancer]: { 
        cost: 1, 
        power: 4,
        effect:[{
            type:EffectType.GainAgeToken,
            amount:1,
            onDeployment:true,
            whichUnit:WhichUnit.Others
        }]
    },
    [Unit.Veteran]: { 
        cost: 0, 
        power: 3,
        effect:[{
            type:EffectType.GainAgeToken,
            amount:1,
            onDeployment:true,
            whichUnit:WhichUnit.Myself
        }]
    },
    [Unit.Miner]: { 
        cost: 1, 
        power: 2, 
        resources:{
            type:[Resources.Diamond]
        }
    },   // OK
    [Unit.Woodcutter]: { 
        cost: 0, 
        power: 2, 
        resources:{
            type:[Resources.Wood]
        }
    },
    [Unit.Dragon]: {
        cost: 3, 
        power: 0,
        effect:[{
            type:EffectType.ChangeWarPower,
            alternativePower:7,
            ifResource:[Resources.Diamond]
        }]
    },
    [Unit.Knight]: { 
        cost: 1, 
        power: 4
    }, // OK
    [Unit.Leviathan]: { 
        cost: 3, 
        power: 4, 
        resources:{
            type:[Resources.Food, Resources.Food],
            condition:{ifAgeToken:true}
        },
        effect:[{
            type:EffectType.AddWarPower,
            powerAdded:2,
            perResource:[Resources.Food]
        },
        {
            type:EffectType.CantWar,
            ifAgeToken:true
        }]
    },
    [Unit.Shapeshifter]: { 
        cost: 0, 
        power:0 
    },
    [Unit.CaveSpirit]: { 
        cost: 1, 
        power: 4, 
        resources:{
            type:[Resources.Diamond]
        },
        effect:[{
            type:EffectType.GainAgeToken,
            amount:1,
            onDeployment:true,
            whichUnit:WhichUnit.Myself
        }]
    },
    [Unit.Cook]: { 
        cost: 0, 
        power: 1,
        effect:[{
            type:EffectType.IncomePerResource,
            resource:Resources.Food,
            amount:1
        }]
    },
    [Unit.MysticalHealer]: { 
        cost: 0, 
        power: 1,
        effect:[{
            type:EffectType.MysticEffect
        }]
    },
    [Unit.MasterAlchemist]: { 
        cost: 2, 
        power: 1,
        effect:[{
            type:EffectType.IncomePerResource,
            resource:Resources.Wood,
            amount:1
        },
        {
            type:EffectType.GainTokenIfWinWar,
            token:MaterialType.ScoreToken,
            perResource:[Resources.Diamond],
            amount:1
        }
        ]
    },
    [Unit.ForestSpirit]: { 
        cost: 3, 
        power: 3, 
        resources:{
            type:[Resources.Wood, Resources.Wood, Resources.Wood]
        }
    },   // OK
    [Unit.LandLord]: { 
        cost: 2, 
        power: 1, 
        resources:{
            type:[Resources.Wood]
        }
    },
    [Unit.Manticore]: { 
        cost: 2, 
        power: 2,
        effect:[{
            type:EffectType.AddWarPower,
            powerAdded:2,
            perResource:[Resources.Food]
        }]
    },
    [Unit.GiantSnake]: { 
        cost: 1, 
        power: 4,
        effect:[{
            type:EffectType.IncomeIfAgeToken,
            amount:3
        },{
            type:EffectType.ChangeWarPower,
            alternativePower:0,
            ifAgeToken:true
        }
    
        ]
    },
    [Unit.GrandArchitect]: {
        cost: 1, 
        power: 1
    },
    [Unit.Colossus]: { 
        cost: 2, 
        power: 1,
        effect:[{
            type:EffectType.ChangeWarPower,
            alternativePower:7,
            ifAgeToken:true
        },
        {
            type:EffectType.GainTokenIfWinWar,
            token:MaterialType.ScoreToken,
            amount:1
        }]
    },
    [Unit.Cerberus]: { 
        cost: 0, 
        power: 2,
        effect:[{
            type:EffectType.ChangeWarPower,
            alternativePower:3,
            ifResource:[Resources.Food]
        }]
    },
    [Unit.Farmer]: { 
        cost: 0, 
        power: 1, 
        resources:{
            type:[Resources.Food]
        }
    }, // OK
    [Unit.Kraken]: { 
        cost: 6, 
        power: 9,
        effect:[{
            type:EffectType.GainTokenIfDying,
            amount:1,
            tokenGain:MaterialType.ScoreToken,
            whoDies:WhichUnit.All,
            perAgeToken:true
        },
        {
            type:EffectType.GainAgeToken,
            amount:1,
            onDeployment:true,
            whichUnit:WhichUnit.Others
        },
        {
            type:EffectType.GainTokenOnDeploy,
            amount:3,
            onDeployment:true,
            token:MaterialType.ScoreToken,
            perLevel2Builds:true
        }]
    },
    [Unit.Demon]: { 
        cost: 2, 
        power: 7,
        effect:[{
            type:EffectType.GainTokenIfDying,
            amount:-3,
            tokenGain:MaterialType.ScoreToken,
            whoDies:WhichUnit.Myself,
            ifAgeToken:true
        },
        {
            type:EffectType.GainAgeToken,
            amount:1,
            onDeployment:true,
            whichUnit:WhichUnit.Myself
        }]
    },
    [Unit.ForestChild]: { 
        cost: 1, 
        power: 1, 
        resources:{
            type:[Resources.Wood, Resources.Food]
        }
    },    // OK
    [Unit.Ogre]: { 
        cost: 2, 
        power: 2,
        effect:[{
            type:EffectType.AddWarPower,
            powerAdded:1,
            perGoldOnIncomePhase:true
        }]
    },
    [Unit.Hunter]: { 
        cost: 0, 
        power: 2, 
        resources:{
            type:[Resources.Food], 
            condition:{
                onLane:LaneType.FrontLane
            }
        }
    },       // OK
    [Unit.Blacksmith]: { 
        cost: 0, 
        power: 1,
        effect:[{
            type:EffectType.Income,
            amount:1
        }]
    },
    [Unit.RelicOfWisdom]: { 
        cost: 2, 
        power: 0,
        effect:[{
            type:EffectType.SpecialDyingCondition,
            dyingFromAmount:false
        },
        {
            type:EffectType.RelicEffect,
            amount:2
        }]
    },
    [Unit.WoodMerchant]: { 
        cost: 0, 
        power: 1,
        effect:[{
            type:EffectType.ReplaceResourceByGold,
            resource:[Resources.Wood]
        }]
    },
    [Unit.Strategist]: { 
        cost: 3, 
        power: 1,
        effect:[{
            type:EffectType.WarFromBacklane
        },
        {
            type:EffectType.AddWarPower,
            powerAdded:1,
            perAgeToken:AgeLocation.InRealm
        }]
    },
    [Unit.PalmReader]: { 
        cost: 2, 
        power: 1,
        effect:[{
            type:EffectType.GainTokenIfDying,
            amount:1,
            tokenGain:MaterialType.ScoreToken,
            whoDies:WhichUnit.All
        }]
    },
    [Unit.Archer]: { 
        cost: 1, 
        power: 2,
        effect:[{
            type:EffectType.WarFromBacklane
        }]
    },
    [Unit.Golem]: { 
        cost: 2, 
        power: 3,
        effect:[{
            type:EffectType.ImproveBuilding,
            onDeployment:true,
            whichBuilding:WhichBuilding.All
        }]
    },
    [Unit.Salamander]: { 
        cost: 2, 
        power: 4,
        effect:[{
            type:EffectType.AddWarPower,
            powerAdded:1,
            perAgeToken:AgeLocation.OnUnit
        },
        {
            type:EffectType.SpecialDyingCondition,
            dyingFromAmount:2
        }]
    },
    [Unit.Monkey]: { 
        cost: -1,
        power: 1,
        effect:[{
            type:EffectType.GainTokenIfDying,
            amount:1,
            tokenGain:MaterialType.Gold,
            whoDies:WhichUnit.Myself,
            perAgeToken:true
        }]
    },
    [Unit.Adventurer]: { 
        cost: 0, 
        power: 2, 
        resources:{
            type:[Resources.Diamond],
            condition:{
                perAgeToken:true
            }
        }
    }     // OK

}