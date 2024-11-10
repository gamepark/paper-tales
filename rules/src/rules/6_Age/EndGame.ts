import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { isRelicEffect } from "../../material/effects/7_EndGameEffects"
import { Effect } from "../../material/effects/Effect"
import { LocationType } from "../../material/LocationType"
import { MaterialType } from "../../material/MaterialType"
import { unitCardCaracteristics, UnitPattern } from "../../material/UnitCaracteristics"
import { AgeHelper } from "../helpers/AgeHelper"
import { ScoreHelper } from "../helpers/ScoreHelper"

export class EndGame extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []

        const players = this.game.players
        players.forEach(player => {
            let scoreToAdd = 0
            const ageHelper = new AgeHelper(this.game, player)
            const scoreHelper = new ScoreHelper(this.game, player)

            this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).getItems().forEach(item => {
                const unitCaracs:UnitPattern = unitCardCaracteristics[item.id]
                if (unitCaracs.effect !== undefined){
                    const unitEffects:Effect[] = unitCardCaracteristics[item.id].effect
                    unitEffects.forEach(eff => {
                        if (isRelicEffect(eff)){
                            const coeff = ageHelper.getAgeTokenOnUnit(player, item)
                            scoreToAdd += coeff * eff.amount
                        }
                    })
                }

            })

            moves.push(scoreHelper.gainOrLoseScore(player, scoreToAdd))

        })

        return moves
    }
}

