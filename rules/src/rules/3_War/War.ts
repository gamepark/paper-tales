import { Material, MaterialItem, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { sum, sumBy } from 'es-toolkit/compat'
import { AddWarPower, isAddWarPower, isCantWar, isChangeWarPower, isGainTokenIfWinWar, isWarFromBacklane } from '../../material/effects/3_WarEffects'
import { AgeLocation, Effect } from '../../material/effects/Effect'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { PlayerColor } from '../../PlayerColor'
import { BASE_INCOME, Income } from '../4_Income/Income'
import { BuildHelper } from '../helpers/BuildHelper'
import { ResourcesHelper } from '../helpers/ResourcesHelper'
import { ScoreHelper } from '../helpers/ScoreHelper'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { AgeTokens } from '../helpers/AgeTokens'

/**
 * The wars won against one neighbour (rulebook p.6): one when the strength is not below the neighbour's, so that both
 * win on a tie. At 2 players (p.8), a strength at least double wins two.
 */
export const warsWonAgainst = (power: number, otherPower: number, twoPlayers: boolean): number => {
  if (power < otherPower) return 0
  return twoPlayers && power >= otherPower * 2 ? 2 : 1
}

export type WarStrengths = Partial<Record<number, number>>

export class War extends MaterialRulesPart {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players
    // Read from the revealed kingdoms only: the same on every client
    this.memorize(Memory.WarStrengths, Object.fromEntries(players.map((player) => [player, this.getPlayerPower(player)])))

    players.forEach((player) => {
      this.forget(Memory.PlayedCardsDuringDeployment, player)
      const buildHelper = new BuildHelper(this.game, player)
      const scoreHelper = new ScoreHelper(this.game, player)
      const warsWon = this.getWarsWon(player)

      let warScoring = 3 * warsWon

      // At 2 players, a double strength wins 2 wars (rulebook p.8): the effects "for each war won" apply twice
      const effectsApplied = warsWon
      for (let i = 0; i < effectsApplied; i++) {
        moves.push(...this.getGainGoldIfWinWarMoves(player))
        warScoring += this.getGainScoreIfWinWarAmount(player)
      }

      // Effets scoring peu importe la victoire
      warScoring += sum(buildHelper.scoreAtWarBuildingEffects.map((effect) => buildHelper.getScoreFromBuilding(player, effect)))

      moves.push(...scoreHelper.gainOrLoseScore(warScoring))
    })

    moves.push(this.startRule(RuleId.Income))
    return moves
  }

  /**
   * The wars a player wins (rulebook p.6): one against each neighbour of a strength not above theirs. At 2 players
   * (p.8), a strength not below the other's wins one war, at least double wins two. As written: no minimum strength,
   * so two kingdoms of strength 0 both win.
   */
  getWarsWon(player: number): number {
    const players = this.game.players
    const index = players.indexOf(player)
    const power = this.getPlayerPower(player)
    const leftPower = this.getPlayerPower(players[this.getNeighbor(players, index, 'left')])
    if (players.length === 2) return warsWonAgainst(power, leftPower, true)
    const rightPower = this.getPlayerPower(players[this.getNeighbor(players, index, 'right')])
    return warsWonAgainst(power, leftPower, false) + warsWonAgainst(power, rightPower, false)
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
      if (cantWarEffect !== undefined && (!cantWarEffect.ifAgeToken || this.getAgeOnUnit(unitIndex) > 0)) return 0

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
      return characteristics.power + (addWarPowerEffect ? this.getAddedPower(addWarPowerEffect, player, unitIndex) : 0)
    }

    return characteristics.power
  }

  /** The strength an AddWarPower effect adds, the same for a unit and for a building (no Age token on a building) */
  getAddedPower(effect: AddWarPower, player: number, unitIndex?: number): number {
    if (effect.perAgeToken !== undefined) {
      const ageTokens = effect.perAgeToken === AgeLocation.OnUnit ? (unitIndex !== undefined ? this.getAgeOnUnit(unitIndex) : 0) : this.getAgeInPlayerRealm(player)
      return ageTokens * effect.powerAdded
    }
    if (effect.perResource) {
      const resourcesHelper = new ResourcesHelper(this.game, player)
      return sumBy(effect.perResource, (resource) => resourcesHelper.getResource(resource)) * effect.powerAdded
    }
    if (effect.perGoldOnIncomePhase) {
      // All the gold earned at the income phase: the base gold of every Monarch, plus the income effects (the Ogre)
      return (BASE_INCOME + new Income(this.game).getPlayerIncome(player)) * effect.powerAdded
    }
    return effect.powerAdded
  }

  getAgeOnUnit(index: number) {
    return new AgeTokens(this).count(index)
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
    const buildingStrength = sumBy(buildings, (building) => this.getAddedPower(building, player))
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
