import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { LocationType } from "../material/LocationType"
import { MaterialType } from "../material/MaterialType"
import { unitCardCaracteristics } from "../material/UnitCaracteristics"
import { Memory } from "./Memory"
import { RuleId } from "./RuleId"

export class War extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        const playerPower = players.map(player => this.getFrontLanePower(player))
        players.forEach((player, index) => {
            const myPower = playerPower[index]
            const leftPower = playerPower[this.getNeighbor(players, index, "left")]
            const rightPower = playerPower[this.getNeighbor(players, index, "right")]

            if (myPower >= leftPower){
                this.playerWinWar(player)
            }
            if (myPower>= rightPower){
                this.playerWinWar(player)
            }
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

    playerWinWar(player:number){
        this.memorize(Memory.PlayerScore,this.remind(Memory.PlayerScore, player) + 3, player) 
    }

    getNeighbor(players:number[], playerIndex:number, side:"left"|"right"){
        if (side==="left"){
            return playerIndex -1 < 0 ? players.length-1 : playerIndex - 1
        } else {
            return playerIndex +1 > players.length-1 ? 0 : playerIndex + 1
        }
    }

}