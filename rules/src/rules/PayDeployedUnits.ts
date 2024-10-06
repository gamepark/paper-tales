import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { MaterialType } from "../material/MaterialType"
import { RuleId } from "./RuleId"
import { Memory } from "./Memory"

export class PayDeployedUnits extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        this.game.players.forEach(player => {
            const deployedUnitsIndexes = this.remind(Memory.PlayedCardsDuringDeployment, player)
            const units = this.material(MaterialType.Unit).index((index) => deployedUnitsIndexes.includes(index)).getItems()
            units.forEach(item => { 
                item.id
                //unitCardCaracteristics[item.id!]
            })

        })
        moves.push(this.startRule(RuleId.PayDeployedUnits))
        
        return moves
    }

    


  
  }

