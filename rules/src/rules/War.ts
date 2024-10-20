import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { LocationType } from "../material/LocationType"
import { MaterialType } from "../material/MaterialType"
import { unitCardCaracteristics } from "../material/UnitCaracteristics"
import { ScoreHelper } from "./helpers/ScoreHelper"
import { RuleId } from "./RuleId"

export class War extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        const playerPower = players.map(player => this.getFrontLanePower(player))
        
        players.forEach((player, index) => {

            const scoreHelper =  new ScoreHelper(this.game, player)
            const myPower = playerPower[index]
            const leftPower = playerPower[this.getNeighbor(players, index, "left")]
            const rightPower = playerPower[this.getNeighbor(players, index, "right")]

            let warScoring = 0
            
            if (players.length === 2){
                if (myPower >= leftPower){
                    warScoring = myPower >= leftPower*2 ? 6 : 3
                } 
            } else {
                if (myPower >= leftPower){
                    warScoring+=3
                }
                if (myPower>= rightPower){
                    warScoring+=3
                }
            }

            warScoring !==0 && moves.push(scoreHelper.gainOrLoseScore(player, warScoring))

        })

        moves.push(this.startRule(RuleId.Income))
        return moves
    }

    getPlayerFrontLane(player:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).filter(item => item.location.y === 0)
    }

    getUnitPower(unitId:number){
        return unitCardCaracteristics[unitId].power
    }

    getFrontLanePower(player:number){
        return this.getPlayerFrontLane(player).getItems().reduce((acc, cur) => acc + this.getUnitPower(cur.id), 0)
    }

    getNeighbor(players:number[], playerIndex:number, side:"left"|"right"){
        if (side==="left"){
            return playerIndex -1 < 0 ? players.length-1 : playerIndex - 1
        } else {
            return playerIndex +1 > players.length-1 ? 0 : playerIndex + 1
        }
    }

}