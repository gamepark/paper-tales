import { Building } from "./Building"
import { Resources } from "./Resources"



export type BuildingPattern = {
    cost1: Resources[],
    cost1Alternate?: Resources[],
    cost2: Resources[],
    cost2Alternate?: Resources[],
    resources1?:Resources[],
    resources2?:Resources[],
    //effect1:
    //effect2:

}


export const buildingCardCaracteristics: Record<Building, BuildingPattern> = {

    [Building.Mine] : {
        cost1:[Resources.Wood],
        cost2:[Resources.Wood, Resources.Diamond],
        resources1:[Resources.Diamond],    
    },
    [Building.Tavern] : {
        cost1:[Resources.Food],
        cost2:[Resources.Wood, Resources.Food]
    },
    [Building.Barracks] : {
        cost1:[Resources.Wood], 
        cost2:[Resources.Wood, Resources.Food]
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
    },    // TODO
}

