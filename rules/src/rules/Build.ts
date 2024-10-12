import { ItemMove, MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from "@gamepark/rules-api"
import { LocationType } from "../material/LocationType";
import { MaterialType } from "../material/MaterialType";
import { RuleId } from "./RuleId";

export class Build extends SimultaneousRule {

    onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove<number, number, number>[] {
        return [this.startRule(RuleId.Age)]
    }

    getActivePlayerLegalMoves(_playerId: number): MaterialMove[] {

        const moves:MaterialMove[] = []

        return moves
    }

    afterItemMove(_move: ItemMove): MaterialMove<number, number, number>[] {

        const moves:MaterialMove[] = []

        return moves
        
    }

    getMovesAfterPlayersDone(): MaterialMove[] {
        return [this.startRule(RuleId.RevealBoards)]
    }

    getFieldCost(playerId:number){
        return this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId).getQuantity() * 2
    }

}