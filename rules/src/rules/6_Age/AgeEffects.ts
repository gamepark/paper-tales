import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { isGainTokenIfDying } from "../../material/effects/6_AgeEffects"
import { WhichUnit } from "../../material/effects/Effect"
import { goldMoney } from "../../material/Gold"
import { LocationType } from "../../material/LocationType"
import { MaterialType } from "../../material/MaterialType"
import { AgeHelper } from "../helpers/AgeHelper"
import { ScoreHelper } from "../helpers/ScoreHelper"
import { RuleId } from "../RuleId"


export class AgeEffects extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        
        players.forEach(player => {
            let goldToGain = 0
            let scoreToGain = 0
            const ageHelper = new AgeHelper(this.game, player)
            const scoreHelper = new ScoreHelper(this.game, player)

            const unitswithAgeEffects = ageHelper.getUnitsWithAgeEffects(player)
            unitswithAgeEffects.getItems().forEach(unit => {
                ageHelper.getUnitAgeEffects(player, unit).forEach(eff => {

                    if(isGainTokenIfDying(eff)){

                        switch(eff.whoDies){
                            case WhichUnit.Myself: 
                                if (ageHelper.isUnitDying(player, unit)){

                                    if (eff.perAgeToken){
                                        switch (eff.tokenGain){
                                            case MaterialType.ScoreToken:
                                                scoreToGain += eff.amount * ageHelper.getAgeTokenOnUnit(player, unit)
                                                break;
                                            case MaterialType.Gold:
                                                goldToGain += eff.amount * ageHelper.getAgeTokenOnUnit(player, unit)
                                                break;
                                        }
                                    } else if (eff.ifAgeToken === undefined || (eff.ifAgeToken && ageHelper.getAgeTokenOnUnit(player, unit) === 1)){
                                        switch (eff.tokenGain){
                                            case MaterialType.ScoreToken:
                                                scoreToGain += eff.amount
                                                break;
                                            case MaterialType.Gold:
                                                goldToGain += eff.amount
                                                break;
                                        }
                                    }

                                }

                                break;
                            case WhichUnit.Others:
                                // No case for now
                                break;
                            case WhichUnit.All:
                                // Other effects are not really meaningfull, but I let the door open to do them.
                                if (eff.perAgeToken){
                                    const ageTokens = ageHelper.getAgeTokensOnDyingUnits(player)
                                    switch (eff.tokenGain){
                                        case MaterialType.ScoreToken:
                                            scoreToGain += eff.amount * ageTokens
                                            break;
                                        case MaterialType.Gold:
                                            goldToGain += eff.amount * ageTokens
                                            break;
                                    }
                                }
                                break;
                        }
                    } 

                })
            })

            console.log("score win par ", player, " : ", scoreToGain)

            scoreToGain !== 0 && moves.push(scoreHelper.gainOrLoseScore(player, scoreToGain))
            goldToGain > 0 && moves.push(...goldMoney.createOrDelete(this.material(MaterialType.Gold), {type:LocationType.PlayerGoldStock, player}, goldToGain))

        })

        moves.push(this.startRule(RuleId.AgeUnitsDie))

        return moves

    }

}