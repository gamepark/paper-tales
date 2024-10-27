import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { ageMoney } from "../material/Age"
import { LocationType } from "../material/LocationType"
import { MaterialType } from "../material/MaterialType"
import { RuleId } from "./RuleId"

export class Age extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        players.forEach(player => {
            const dyingUnits = this.getPlayerDyingUnits(player)
            moves.push(...dyingUnits.moveItems({type : LocationType.Discard}))

            dyingUnits.getItems().forEach(item => {
                const ageTokensToDiscard = this.material(MaterialType.Age)
                    .location(loc => loc.type === LocationType.PlayerUnitBoard && loc.x === item.location.x && loc.y === item.location.y)
                    .player(player)
                moves.push(...ageMoney.createOrDelete(ageTokensToDiscard, 
                    {type:LocationType.PlayerUnitBoard, player, x:item.location.x, y:item.location.y},
                    -ageMoney.count(ageTokensToDiscard)))
            })

            this.material(MaterialType.Age).location(LocationType.PlayerUnitBoard).player(player)
            this.getPlayerAgingUnits(player).getItems().forEach(item => {
                moves.push(...ageMoney.createOrDelete(this.material(MaterialType.Age), {
                    type:LocationType.PlayerUnitBoard,
                    player,
                    x:item.location.x!,
                    y:item.location.y!}, 1
                ))
            })
        })
        moves.push(this.getTurn() === 4 ? this.startRule(RuleId.EndGame) : this.startRule(RuleId.NextTurn))

        return moves
    }

    getPlayerDyingUnits(playerId:number){
        return this.getPlayerUnits(playerId).filter(item => this.getAgeTokenOnCoord(playerId, item.location.x!, item.location.y!) > 0)
    }

    getPlayerAgingUnits(playerId:number){
        return this.getPlayerUnits(playerId).filter(item => !this.getPlayerDyingUnits(playerId).getItems().includes(item) ) 
    }

    getPlayerUnits(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
    }

    getAgeTokenOnCoord(playerId:number, x:number, y:number){
        return this.material(MaterialType.Age).location(LocationType.PlayerUnitBoard).player(playerId).filter(item => item.location.x === x && item.location.y === y).getQuantity()
    }

    getTurn(){
        return this.material(MaterialType.Time).location(LocationType.Time).getItem()?.location.x!
    }

}