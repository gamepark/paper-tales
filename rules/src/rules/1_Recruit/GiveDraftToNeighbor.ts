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
          moves.push(...playerRemainingUnits.moveItems({type:LocationType.PlayerDraftHand, player:this.getNextPlayer(player)}))
        })
        moves.push(this.startSimultaneousRule(RuleId.Draft))
      }
      return moves
      
    }

    getNextPlayer(player:number) {
      const players = this.game.players
      const playerIndex = players.findIndex(item => item === player)
      return playerIndex + 1 === players.length ? players[0] : players[playerIndex + 1]
    }
  
  }

