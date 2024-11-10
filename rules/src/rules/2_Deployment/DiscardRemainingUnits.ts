import { MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from "@gamepark/rules-api"
import { MaterialType } from "../../material/MaterialType";
import { LocationType } from "../../material/LocationType";
import { RuleId } from "../RuleId";
import { Memory } from "../Memory";

export class DiscardRemainingUnits extends SimultaneousRule {

    onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove<number, number, number>[] {
        this.game.players.forEach(player => {
            this.memorize(Memory.PlayedCardsDuringDeployment, [], player)
        })
        return []
    }

    getActivePlayerLegalMoves(playerId: number): MaterialMove[] {

        const moves = []
        const playerHand = this.getPlayerHand(playerId)

        moves.push(...playerHand.moveItems({
            type:LocationType.Discard
        }))

        playerHand.getQuantity() <= 1 && moves.push(this.endPlayerTurn(playerId))
        return moves
    }

    getMovesAfterPlayersDone(): MaterialMove[] {
        return [this.startRule(RuleId.RevealBoards)]
    }

    getPlayerHand(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(playerId)
    }

}