import { MaterialGame, MaterialItem, MaterialRulesPart } from "@gamepark/rules-api";
import { Resource } from "i18next";
import { LocationType } from "../../material/LocationType";
import { MaterialType } from "../../material/MaterialType";
import { unitCardCaracteristics } from "../../material/UnitCaracteristics";

export class ResourcesHelper extends MaterialRulesPart {

    constructor(game: MaterialGame, readonly player: number) {
      super(game)
    }

    getPlayerBoard(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
    }

    getAgeOnUnit(playerId:number, unit:MaterialItem){
        return this.material(MaterialType.Age).location(LocationType.PlayerUnitBoard).player(playerId).filter(item => item.location.x! === unit.location.x && item.location.y! === unit.location.y)
    }

    getPlayerResources(playerId:number){
        return this.getPlayerBoard(playerId).getItems().flatMap(unit => this.getUnitResource(playerId, unit))
    }

    getUnitResource(playerId:number, unit: MaterialItem):Resource[] {
        const resourceObject = unitCardCaracteristics[unit.id].resources
        if(resourceObject !== undefined){
            if (resourceObject.condition !== undefined){
                if (resourceObject.condition.onLane !== undefined){
                    return unit.location.y === resourceObject.condition.onLane && resourceObject.type
                } else if (resourceObject.condition.perAgeToken !== undefined){
                    return [...Array(this.getAgeOnUnit(playerId, unit).length).keys()].map(resourceObject.type)
                } else if (resourceObject.condition.ifAgeToken !== undefined){
                    return this.getAgeOnUnit(playerId, unit).length > 0 ? resourceObject.type : []
                }
            } else {
                return resourceObject.type
            }
        }
         
        return []
    }
}