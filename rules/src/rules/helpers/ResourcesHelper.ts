import { MaterialGame, MaterialItem, MaterialRulesPart } from "@gamepark/rules-api";
import { buildingCardCaracteristics } from "../../material/BuildingCaracteristics";
import { LocationType } from "../../material/LocationType";
import { MaterialType } from "../../material/MaterialType";
import { Resources } from "../../material/Resources";
import { unitCardCaracteristics } from "../../material/UnitCaracteristics";
import { BuildHelper } from "./BuildHelper";

export class ResourcesHelper extends MaterialRulesPart {

    constructor(game: MaterialGame, readonly player: number) {
      super(game)
    }

    getPlayerBoard(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
    }

    getAgeOnUnit(playerId:number, unit:MaterialItem):number{
        const index = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
            .filter(item => item.location.x === unit.location.x && item.location.y === unit.location.y)
            .getIndex()
        return this.material(MaterialType.Age).location(LocationType.OnCard).parent(index).length
    }

    getPlayerResources(playerId:number){
        const buildingResources = this.getPlayerBuildingResources(playerId)
        const unitResources = this.getPlayerBoard(playerId).getItems().flatMap(unit => this.getUnitResource(playerId, unit))
        return [...buildingResources, ...unitResources]
    }

    getPlayerBuildingResources(playerId:number):Resources[]{
        const buildHelper =  new BuildHelper(this.game, playerId)
        const buildingResources = [
            ...buildHelper.getPlayerBuildingPlayedLevel1(playerId).getItems(item => buildingCardCaracteristics[item.id].resources1 !== undefined)
                .flatMap(item => buildingCardCaracteristics[item.id].resources1),
            ...buildHelper.getPlayerBuildingPlayedLevel2(playerId).getItems(item => buildingCardCaracteristics[item.id].resources1 !== undefined)
                .flatMap(item => buildingCardCaracteristics[item.id].resources1),
            ...buildHelper.getPlayerBuildingPlayedLevel2(playerId).getItems(item => buildingCardCaracteristics[item.id].resources2 !== undefined)
                .flatMap(item => buildingCardCaracteristics[item.id].resources2)
        ]

        return buildingResources
    }

    getPlayerOneTypeResource(playerId:number, resource:Resources){
        return this.getPlayerResources(playerId).filter(r => r === resource).length
    }

    getUnitResource(playerId:number, unit: MaterialItem):Resources[] {

        // Si l'Id est inaccessible, on renvoie 0
        if (unit.id === undefined){
            return []
        }

        const resourceObject = unitCardCaracteristics[unit.id].resources

        if(resourceObject !== undefined){
            if (resourceObject.condition !== undefined){
                if (resourceObject.condition.onLane !== undefined){
                    return unit.location.y === resourceObject.condition.onLane && resourceObject.type
                } else if (resourceObject.condition.perAgeToken !== undefined){
                    return [...Array(this.getAgeOnUnit(playerId, unit)).keys()].flatMap(_ => resourceObject.type[0])
                } else if (resourceObject.condition.ifAgeToken !== undefined){
                    return this.getAgeOnUnit(playerId, unit) > 0 ? resourceObject.type : []
                }
            } else {
                return resourceObject.type
            }
        }
         
        return []
    }
}