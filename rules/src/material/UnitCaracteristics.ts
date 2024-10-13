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
    }
}

export enum LaneType {
    FrontLane = 0,
    BackLane
}

export enum Resources {
    Wood = 1,
    Food,
    Diamond,
}

export const unitCardCaracteristics: Record<Unit, UnitPattern> = {
    [Unit.Commander]: { cost: 2, power: 4 },
    [Unit.Militiaman]: { cost: 0, power: 2 },
    [Unit.TimeMaster]: { cost: 0, power: 1 },
    [Unit.Peddler]: { cost: 1, power: 1, resources:{type:[Resources.Wood]} },
    [Unit.Rogue]: { cost: 1, power: 3 },
    [Unit.Sculptor]: { cost: 0, power: 1 },
    [Unit.Treefolk]: { cost: 1, power: 3, resources:{type:[Resources.Food]} },
    [Unit.Necromancer]: { cost: 1, power: 4},
    [Unit.Veteran]: { cost: 0, power: 3},
    [Unit.Miner]: { cost: 1, power: 2, resources:{type:[Resources.Diamond]}},
    [Unit.Woodcutter]: { cost: 0, power: 2, resources:{type:[Resources.Wood]}},
    [Unit.Dragon]: {cost: 3, power: 0},
    [Unit.Knight]: { cost: 1, power: 4}, // OK.
    [Unit.Leviathan]: { cost: 3, power: 4, resources:{type:[Resources.Food, Resources.Food], condition:{ifAgeToken:true}}},
    [Unit.Shapeshifter]: { cost: 0, power:0 },
    [Unit.CaveSpirit]: { cost: 1, power: 4, resources:{type:[Resources.Diamond]} },
    [Unit.Cook]: { cost: 0, power: 1},
    [Unit.MysticalHealer]: { cost: 0, power: 1},
    [Unit.MasterAlchemist]: { cost: 2, power: 1},
    [Unit.ForestSpirit]: { cost: 3, power: 3, resources:{type:[Resources.Wood, Resources.Wood, Resources.Wood]}},
    [Unit.LandLord]: { cost: 2, power: 1, resources:{type:[Resources.Wood]}},
    [Unit.Manticore]: { cost: 2, power: 2},
    [Unit.GiantSnake]: { cost: 1, power: 4},
    [Unit.GrandArchitect]: { cost: 1, power: 1},
    [Unit.Colossus]: { cost: 2, power: 1},
    [Unit.Cerberus]: { cost: 0, power: 2},
    [Unit.Farmer]: { cost: 0, power: 1, resources:{type:[Resources.Food]}},
    [Unit.Kraken]: { cost: 6, power: 9},
    [Unit.Demon]: { cost: 2, power: 7},
    [Unit.ForestChild]: { cost: 1, power: 1, resources:{type:[Resources.Wood, Resources.Food]}},
    [Unit.Ogre]: { cost: 2, power: 2},
    [Unit.Hunter]: { cost: 0, power: 2, resources:{type:[Resources.Diamond], condition:{onLane:LaneType.FrontLane}}},
    [Unit.Blacksmith]: { cost: 0, power: 1},
    [Unit.RelicOfWisdom]: { cost: 2, power: 0},
    [Unit.WoodMerchant]: { cost: 0, power: 1},
    [Unit.Strategist]: { cost: 3, power: 1},
    [Unit.PalmReader]: { cost: 2, power: 1},
    [Unit.Archer]: { cost: 1, power: 2},
    [Unit.Golem]: { cost: 2, power: 3},
    [Unit.Salamander]: { cost: 2, power: 4},
    [Unit.Monkey]: { cost: -1, power: 1},
    [Unit.Adventurer]: { cost: 0, power: 2, resources:{type:[Resources.Diamond], condition:{perAgeToken:true}}}

}