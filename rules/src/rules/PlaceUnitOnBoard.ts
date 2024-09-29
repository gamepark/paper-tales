import { MaterialMove, SimultaneousRule } from "@gamepark/rules-api"

export class PlaceUnitOnBoard extends SimultaneousRule {

    getActivePlayerLegalMoves(_playerId: number): MaterialMove[] {
        throw new Error("Method not implemented.");
    }
    getMovesAfterPlayersDone(): MaterialMove[] {
        throw new Error("Method not implemented.");
    }

}