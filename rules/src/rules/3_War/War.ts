import { Material, MaterialItem, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import sum from 'lodash/sum'
import sumBy from 'lodash/sumBy'
import { isAddWarPower, isCantWar, isChangeWarPower, isGainTokenIfWinWar, isWarFromBacklane } from '../../material/effects/3_WarEffects'
import { AgeLocation, Effect } from '../../material/effects/Effect'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { PlayerColor } from '../../PlayerColor'
import { Income } from '../4_Income/Income'
import { BuildHelper } from '../helpers/BuildHelper'
import { ResourcesHelper } from '../helpers/ResourcesHelper'
import { ScoreHelper } from '../helpers/ScoreHelper'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class War extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players
    const playerPower = players.map((player) => this.getPlayerPower(player))

    players.forEach((player, index) => {
      this.forget(Memory.PlayedCardsDuringDeployment, player)
      //this.logAllPlayerUnitPower(player)
      const buildHelper = new BuildHelper(this.game, player)
      const scoreHelper = new ScoreHelper(this.game, player)
      const myPower = playerPower[index]

      //console.log("Puissance du joueur ",player, " : ", myPower)

      const leftPower = playerPower[this.getNeighbor(players, index, 'left')]
      const rightPower = playerPower[this.getNeighbor(players, index, 'right')]

      let warScoring = 0

      if (players.length === 2) {
        if (myPower > 0 && myPower >= leftPower) {
          warScoring += myPower >= leftPower * 2 ? 6 : 3
          moves.push(...this.getGainGoldIfWinWarMoves(player))
          warScoring += this.getGainScoreIfWinWarAmount(player)
        }
      } else {
        if (myPower >= leftPower) {
          warScoring += 3
          moves.push(...this.getGainGoldIfWinWarMoves(player))
          warScoring += this.getGainScoreIfWinWarAmount(player)
        }
        if (myPower >= rightPower) {
          warScoring += 3
          moves.push(...this.getGainGoldIfWinWarMoves(player))
          warScoring += this.getGainScoreIfWinWarAmount(player)
        }
      }

      //console.log("Score gagné par le joueur ",player, " par les guerres gagnées : ", warScoring)

      // Effets scoring peu importe la victoire
      warScoring += sum(buildHelper.scoreAtWarBuildingEffects.map((effect) => buildHelper.getScoreFromBuilding(player, effect)))

      moves.push(...scoreHelper.gainOrLoseScore(warScoring))
    })

    moves.push(this.startRule(RuleId.Income))
    return moves
  }

  getGainScoreIfWinWarAmount(player: number): number {
    let score = 0
    const units = this.getPlayerBoard(player).getItems<Unit>((item) => unitCardCaracteristics[item.id].effect !== undefined)

    for (const unit of units) {
      const effects: Effect[] = unitCardCaracteristics[unit.id].effect ?? []
      effects.forEach((eff) => {
        if (isGainTokenIfWinWar(eff) && eff.token === MaterialType.ScoreToken) {
          if (eff.perResource !== undefined) {
            const resourcesHelper = new ResourcesHelper(this.game, player)
            const resourceAmount = sumBy(eff.perResource, (r) => resourcesHelper.getResource(r))
            score += eff.amount * resourceAmount
          } else {
            score += eff.amount
          }
        }
      })
    }
    return score
  }

  getGainGoldIfWinWarMoves(player: number): MaterialMove[] {
    const moves: MaterialMove[] = []
    const units = this.getPlayerBoard(player).getItems<Unit>((item) => unitCardCaracteristics[item.id].effect !== undefined)

    for (const unit of units) {
      const effects: Effect[] = unitCardCaracteristics[unit.id].effect ?? []
      effects.forEach((eff) => {
        if (isGainTokenIfWinWar(eff) && eff.token === MaterialType.Gold) {
          let coinToChange = eff.amount
          if (eff.perResource !== undefined) {
            const resourcesHelper = new ResourcesHelper(this.game, player)
            const amount = sumBy(eff.perResource, (r) => resourcesHelper.getResource(r))
            coinToChange = amount * eff.amount
          }

          const goldMoney = this.material(MaterialType.Gold).money(golds)
          moves.push(
            ...goldMoney.addMoney(coinToChange, {
              type: LocationType.PlayerGoldStock,
              player: player
            })
          )
        }
      })
    }

    return moves
  }

  getPlayerBoard(player: number) {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)
  }

  getPlayerFrontLane(player: number) {
    return this.getPlayerBoard(player).filter((item) => this.isAtFrontLane(item))
  }

  isAtFrontLane(unit: MaterialItem) {
    return unit.location.y === 0
  }

  getUnitPower(unit: MaterialItem, unitIndex: number) {
    const player = unit.location.player!
    const unitId = unit.id as Unit | undefined
    if (!unitId) return 0

    const characteristics = unitCardCaracteristics[unitId]

    const effects: Effect[] = characteristics.effect ?? []
    if (effects.length) {
      const cantWarEffect = effects.find(isCantWar)
      const changeWarPowerEffect = effects.find(isChangeWarPower)
      const addWarPowerEffect = effects.find(isAddWarPower)

      // On applique la premiere condition exclusive
      if (cantWarEffect !== undefined) {
        if (cantWarEffect.ifAgeToken) {
          const ageOnUnit = this.getAgeOnUnit(unitIndex)
          if (ageOnUnit > 0) {
            return 0
          }
        }
      }

      // Ensuite, on applique la seconde condition exclusive
      if (changeWarPowerEffect !== undefined) {
        if (changeWarPowerEffect.ifAgeToken) {
          const ageOnUnit = this.getAgeOnUnit(unitIndex)
          return ageOnUnit > 0 ? changeWarPowerEffect.alternativePower : characteristics.power
        } else if (changeWarPowerEffect.ifResource) {
          const resourcesHelper = new ResourcesHelper(this.game, player)
          const playerResources = resourcesHelper.resources
          return changeWarPowerEffect.ifResource.some((resource) => playerResources.some((r) => r === resource))
            ? changeWarPowerEffect.alternativePower
            : characteristics.power
        }
      }

      // Enfin, on calcule le surplus de puissance qu'on peut ajouter. Pas de return ici
      let add = 0
      if (addWarPowerEffect) {
        if (addWarPowerEffect.perAgeToken !== undefined) {
          const ageFactor = addWarPowerEffect.perAgeToken === AgeLocation.OnUnit ? this.getAgeOnUnit(unitIndex) : this.getAgeInPlayerRealm(player)
          add += ageFactor * addWarPowerEffect.powerAdded
        } else if (addWarPowerEffect.perResource) {
          const resourcesHelper = new ResourcesHelper(this.game, player)
          addWarPowerEffect.perResource.forEach((resource) => {
            add += resourcesHelper.getResource(resource) * addWarPowerEffect.powerAdded
          })
        } else if (addWarPowerEffect.perGoldOnIncomePhase) {
          add += new Income(this.game).getPlayerIncome(player) * addWarPowerEffect.powerAdded
        }
      }

      return characteristics.power + add
    }

    return characteristics.power
  }

  getAgeOnUnit(index: number) {
    return this.material(MaterialType.Age).location(LocationType.OnCard).parent(index).getQuantity()
  }

  getAgeInPlayerRealm(player: PlayerColor) {
    return this.material(MaterialType.Age).location(LocationType.OnCard).player(player).getQuantity()
  }

  getPlayerPower(player: number) {
    const buildHelper = new BuildHelper(this.game, player)
    const units = this.getPlayerBoard(player)
    const unitIndexes = units.getIndexes()
    const strength = sumBy(unitIndexes, (index: number) => this.computePower(units.index(index)))

    const buildings = buildHelper.addPowerBuildingEffects
    const buildingStrength = sumBy(buildings, (building) => buildHelper.getPowerAddedFromBuilding(player, building))
    return strength + buildingStrength
  }

  computePower(unit: Material) {
    const item = unit.getItem<Unit | undefined>()!
    if (item.id === undefined) return 0
    if (this.isAtFrontLane(item)) return this.getUnitPower(item, unit.getIndex())
    const effects = unitCardCaracteristics[item.id].effect ?? []
    if (!effects.length || !effects.some((eff) => isWarFromBacklane(eff))) return 0
    return this.getUnitPower(item, unit.getIndex())
  }

  getNeighbor(players: number[], playerIndex: number, side: 'left' | 'right') {
    if (side === 'left') {
      return playerIndex - 1 < 0 ? players.length - 1 : playerIndex - 1
    } else {
      return playerIndex + 1 > players.length - 1 ? 0 : playerIndex + 1
    }
  }
}
