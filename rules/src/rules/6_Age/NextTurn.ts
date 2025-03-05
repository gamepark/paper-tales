import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { LocationType } from "../../material/LocationType"
import { MaterialType } from "../../material/MaterialType"
import { RuleId } from "../RuleId"

export class NextTurn extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const minTimeMaterial = this.material(MaterialType.Time).location(LocationType.Time).minBy((item) => item.id)
        moves.push(minTimeMaterial.deleteItem())
        moves.push(this.startRule(RuleId.Deal))
        return moves
    }
  
  }

