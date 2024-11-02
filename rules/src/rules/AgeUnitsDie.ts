import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { ageMoney } from "../material/Age"
import { LocationType } from "../material/LocationType"
import { MaterialType } from "../material/MaterialType"
import { AgeHelper } from "./helpers/AgeHelper"
import { RuleId } from "./RuleId"

export class AgeUnitsDie extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        
        players.forEach(player => {
            const ageHelper = new AgeHelper(this.game, player)
            const dyingUnits = ageHelper.getPlayerDyingUnits(player)
            moves.push(...dyingUnits.moveItems({type : LocationType.Discard}))

            dyingUnits.getItems().forEach(item => {
                const ageTokensToDiscard = ageHelper.getAgeTokenOnCoord(player, item.location.x!, item.location.y!)
                moves.push(...ageMoney.createOrDelete(ageTokensToDiscard, 
                    {type:LocationType.PlayerUnitBoard, player, x:item.location.x, y:item.location.y},
                    -ageMoney.count(ageTokensToDiscard)))
            })

        })

        moves.push(this.startRule(RuleId.AgeUnitsAge))

        return moves
    }








    getTurn(){
        return this.material(MaterialType.Time).location(LocationType.Time).getItem()?.location.x!
    }

}