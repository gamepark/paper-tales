import { Building } from "./Building"



export type BuildingPattern = {
    cost1: (Resources | number)[],
    cost2: (Resources | number)[],
    //effect1:
    //effect2:

}

export enum Resources {
    Wood = 1,
    Food,
    Diamond,
}


export const buildingCardCaracteristics: Record<Building, BuildingPattern> = {

    [Building.Mine] : {cost1:[Resources.Wood], cost2:[Resources.Wood, Resources.Diamond]},
    [Building.Tavern] : {cost1:[Resources.Food], cost2:[Resources.Wood, Resources.Food]},
    [Building.Barracks] : {cost1:[Resources.Wood], cost2:[Resources.Wood, Resources.Food]},
    [Building.Town] : {cost1:[Resources.Wood], cost2:[Resources.Wood, Resources.Wood]},
    [Building.Temple] : {cost1:[Resources.Diamond, 2], cost2:[Resources.Diamond, Resources.Diamond, 3]},
}