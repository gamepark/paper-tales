import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { ageMoney } from "../material/Age"
import { LocationType } from "../material/LocationType"
import { MaterialType } from "../material/MaterialType"
import { AgeHelper } from "./helpers/AgeHelper"
import { RuleId } from "./RuleId"

export class AgeUnitsAge extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players

        // Dying Phase
        players.forEach(player => {
            const ageHelper = new AgeHelper(this.game, player)

            ageHelper.getPlayerAgingUnits(player).getItems().forEach(item => {
                moves.push(...ageMoney.createOrDelete(this.material(MaterialType.Age), {
                    type:LocationType.PlayerUnitBoard,
                    player,
                    x:item.location.x!,
                    y:item.location.y!}, 1
                ))
            })
        })
        moves.push(this.getTurn() === 4 ? this.startRule(RuleId.EndGame) : this.startRule(RuleId.NextTurn))

        return moves
    }

    getTurn(){
        return this.material(MaterialType.Time).location(LocationType.Time).getItem()?.location.x!
    }

}