import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { MaterialType } from "../material/MaterialType"
import { RuleId } from "./RuleId"
import { Memory } from "./Memory"
import { unitCardCaracteristics } from "../material/UnitCaracteristics"
import { goldMoney } from "../material/Gold" 
import { LocationType } from "../material/LocationType"

export class PayDeployedUnits extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        this.game.players.forEach(player => {
            const deployedUnitsIndexes = this.remind(Memory.PlayedCardsDuringDeployment, player)
            const units = this.material(MaterialType.Unit).index((index) => deployedUnitsIndexes.includes(index)).getItems()
            units.forEach(item => { 
                moves.push(...goldMoney.createOrDelete(this.material(MaterialType.Gold), {type:LocationType.PlayerGoldStock, player}, -unitCardCaracteristics[item.id].cost))
            })

        })




        moves.push(this.startSimultaneousRule(RuleId.DeployEffects))
        
        return moves
    }

    


  
  }

