import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { goldMoney } from "../material/Gold"
import { LocationType } from "../material/LocationType"
import { MaterialType } from "../material/MaterialType"
import { Memory } from "./Memory"
import { RuleId } from "./RuleId"

export class Income extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        players.forEach(player => {
            console.log("score : ",this.remind(Memory.PlayerScore, player))
            moves.push(...goldMoney.createOrDelete(this.material(MaterialType.Gold), {type:LocationType.PlayerGoldStock, player}, 2))
        })
        moves.push(this.startRule(RuleId.Build))

        return moves
    }

}