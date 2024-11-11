import { Building } from "./Building"
import { Effect, EffectType } from "./effects/Effect"
import { Resources } from "./Resources"



export type BuildingPattern = {
    cost1: Resources[],
    cost1Alternate?: Resources[],
    cost2: Resources[],
    cost2Alternate?: Resources[],
    resources1?:Resources[],
    resources2?:Resources[],
    effect1?:Effect[]   // Tous les batiments n'ont qu'un seul effet, sauf le port de l'extension qui en a deux... Sad
    effect2?:Effect[]

}


export const buildingCardCaracteristics: Record<Building, BuildingPattern> = {

    [Building.Mine] : {
        cost1:[Resources.Wood],
        cost2:[Resources.Wood, Resources.Diamond],
        resources1:[Resources.Diamond],  
        effect2:[{
            type:EffectType.ScoreAtWar,
            amount:2,
            perResource:Resources.Diamond
        }]  
    },
    [Building.Tavern] : {
        cost1:[Resources.Food],
        cost2:[Resources.Wood, Resources.Food],
        effect1:[{
            type:EffectType.IncomePerResource,
            amount:1,
            resource:Resources.Food
        }],
        effect2:[{
            type:EffectType.ScoreAtWar,
            amount:1,
            perResource:Resources.Food
        }]

    },
    [Building.Barracks] : {
        cost1:[Resources.Wood], 
        cost2:[Resources.Wood, Resources.Food],
        effect1:[{
            type:EffectType.AddWarPower,
            powerAdded:1,
            perResource:[Resources.Wood]
        }],
        effect2:[{
            type:EffectType.ScoreAtWar,
            amount:1,
            perUnitStrongerThan:3
        }]
    },
    [Building.Town] : {
        cost1:[Resources.Wood], 
        cost2:[Resources.Wood, Resources.Wood],
        resources1:[Resources.Wood, Resources.Food],
        resources2:[Resources.Diamond],
    },
    [Building.Temple] : {
        cost1:[Resources.Diamond], 
        cost1Alternate:[Resources.Gold, Resources.Gold],
        cost2:[Resources.Diamond, Resources.Diamond],
        cost2Alternate:[Resources.Gold, Resources.Gold, Resources.Gold],
        effect1:[{
            type:EffectType.Income,
            amount:2
        }],
        effect2:[{
            type:EffectType.ScoreAtWar,
            amount:2
        }]

    },    
}

