import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { LocationType } from "../../material/LocationType"
import { MaterialType } from "../../material/MaterialType"
import { AgeHelper } from "../helpers/AgeHelper"
import { RuleId } from "../RuleId"

export class AgeUnitsDie extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        
        players.forEach(player => {
            const ageHelper = new AgeHelper(this.game, player)
            const dyingUnits = ageHelper.getPlayerDyingUnits(player)
            for (const [index, _item] of dyingUnits.entries){
                const ageTokensToDiscard = ageHelper.getAgeTokenOnIndex(index)
                moves.push(this.material(MaterialType.Age).location(LocationType.OnCard).parent(index).deleteItem(
                    ageTokensToDiscard.getQuantity()
                ))
            }

            moves.push(...dyingUnits.moveItems({type : LocationType.Discard}))

        })

        moves.push(this.startRule(RuleId.AgeUnitsAge))
        return moves
    }








    getTurn(){
        return this.material(MaterialType.Time).location(LocationType.Time).getItem()?.location.x!
    }

}