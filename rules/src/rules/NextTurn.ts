import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { LocationType } from "../material/LocationType"
import { MaterialType } from "../material/MaterialType"

import { RuleId } from "./RuleId"


export class NextTurn extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const timeToken = this.material(MaterialType.Time).location(LocationType.Time)
        moves.push(
            timeToken.moveItem({
              type: LocationType.Time,
              x:timeToken.getItem()!.location.x! +1
            })
          ) 
        moves.push(this.startRule(RuleId.Deal))
        return moves
    }


  
  }

