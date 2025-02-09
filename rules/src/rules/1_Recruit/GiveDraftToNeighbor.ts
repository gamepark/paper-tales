import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { MaterialType } from "../../material/MaterialType"
import { LocationType } from "../../material/LocationType"
import { RuleId } from "../RuleId"

export class GiveDraftToNeighbor extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
      const moves = []
      const remainingUnits = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).getItems().length

      if (remainingUnits === 0){
        moves.push(this.startSimultaneousRule(RuleId.PlaceUnitOnBoard))
      } else {
        const players = this.game.players
        players.forEach(player => {
          
          const playerRemainingUnits = this.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(player)
          moves.push(playerRemainingUnits.moveItemsAtOnce({type:LocationType.PlayerDraftHand, player:this.getNextPlayer(player)}))

        })

        moves.push(this.startSimultaneousRule(RuleId.Draft))
      }
      return moves
      
    }

    getNextPlayer(player:number) {
      const players = this.game.players
      const playerIndex = players.findIndex(item => item === player)
      const round = this.material(MaterialType.Time).getItem()!.location.x!
      if (round % 2 === 1){
        return playerIndex + 1 === players.length ? players[0] : players[playerIndex + 1]
      } else {
        return playerIndex - 1 === -1 ? players[players.length-1] : players[playerIndex - 1]
      }
    }
  
  }

