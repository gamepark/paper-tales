import { MaterialGame, MaterialRulesPart } from '@gamepark/rules-api'
import { sumBy } from 'es-toolkit/compat'
import { Card } from '../material/Artifact'
import { cardEffects } from '../material/CardCaracteristics'
import { isGainAgeToken, isGainTokenOnDeploy } from '../material/effects/2_DeploymentEffects'
import { isGainTokenIfDying } from '../material/effects/6_AgeEffects'
import { WhichUnit } from '../material/effects/Effect'
import { MaterialType } from '../material/MaterialType'
import { War } from '../rules/3_War/War'
import { Income } from '../rules/4_Income/Income'
import { AgeHelper } from '../rules/helpers/AgeHelper'
import { BuildHelper } from '../rules/helpers/BuildHelper'
import { EndScoreHelper } from '../rules/helpers/EndScoreHelper'
import { KingdomHelper } from '../rules/helpers/KingdomHelper'
import { ResourcesHelper } from '../rules/helpers/ResourcesHelper'
import { ScoreHelper } from '../rules/helpers/ScoreHelper'
import { Memory } from '../rules/Memory'
import { RuleId } from '../rules/RuleId'

/** The game lasts 4 turns (rulebook p.8) */
const LAST_TURN = 4

/** The weights of the evaluation, in Legend points */
const GOLD_VALUE = 0.5
const RESOURCE_VALUE = 0.3
/** What a unit that survives the Age phase brings next turn, for each point of strength */
const SURVIVOR_POWER_VALUE = 0.5
const SURVIVOR_VALUE = 0.5
/** What a building brings for each turn left after this one, for each point it earns at the War and each gold of income */
const BUILDING_WAR_SCORE_VALUE = 0.8
const BUILDING_INCOME_VALUE = 0.4
/** The strength a neighbour is expected to add while their deployment is hidden, and how uncertain their strength is */
const NEIGHBOUR_HIDDEN_GAIN = 3
const WAR_SPREAD = 2.5

const rulesBeforeWar = [
  RuleId.Deal,
  RuleId.Draft,
  RuleId.GiveDraftToNeighbor,
  RuleId.PlaceUnitOnBoard,
  RuleId.RevealBoards,
  RuleId.PayDeployedUnits,
  RuleId.DeployEffects
]
const rulesBeforeIncome = [...rulesBeforeWar, RuleId.War, RuleId.Income]
const rulesBeforeBuild = [...rulesBeforeIncome, RuleId.Build]
/** The Age tokens of the deployment are not on the units yet */
const rulesBeforeDeployEffects: RuleId[] = rulesBeforeWar.filter((ruleId) => ruleId !== RuleId.DeployEffects)
const rulesAfterAgeEffects = [RuleId.AgeEffects, RuleId.AgeUnitsDie, RuleId.AgeUnitsAge, RuleId.NextTurn, RuleId.EndGame]

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))

/** What the bot changes on its copy of the game without playing it: the gold it will pay, the cards it will deploy */
export type Projection = { goldSpent?: number; deployed?: number[] }

/**
 * The value of the kingdom of a Monarch, in Legend points: the points scored, and an estimate of what the kingdom will
 * earn until the end of the game. It reads only what the Monarch sees: the bot evaluates its own view of the game.
 */
export class KingdomEvaluation extends MaterialRulesPart {
  private readonly war: War
  private neighbourPowers?: number[]
  private readonly ageHelper: AgeHelper
  /** The Age tokens each unit will have at the Age phase: the ones it has, and the ones the deployment will add */
  private ageTokens = new Map<number, number>()

  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
    this.war = new War(game)
    this.ageHelper = new AgeHelper(game, player)
  }

  get turn(): number {
    return this.remind<number>(Memory.Time)
  }

  get turnsLeftAfterThis(): number {
    return LAST_TURN - this.turn
  }

  private get ruleId(): RuleId | undefined {
    return this.game.rule?.id
  }

  get beforeWar() {
    return this.ruleId !== undefined && rulesBeforeWar.includes(this.ruleId)
  }

  value({ goldSpent = 0, deployed = this.deployedThisTurn }: Projection = {}): number {
    const ruleId = this.ruleId
    const beforeIncome = ruleId !== undefined && rulesBeforeIncome.includes(ruleId)
    const beforeBuild = ruleId !== undefined && rulesBeforeBuild.includes(ruleId)
    const futureTurns = this.turnsLeftAfterThis

    this.ageTokens = this.projectAgeTokens(deployed)
    let value = new ScoreHelper(this.game, this.player).score + new EndScoreHelper(this.game, this.player).points

    let gold = new BuildHelper(this.game, this.player).gold - goldSpent
    if (this.beforeWar) {
      value += this.warPoints
      const deployGains = this.deployGains(deployed)
      value += deployGains.score
      gold += deployGains.gold
    }
    if (ruleId !== undefined && !rulesAfterAgeEffects.includes(ruleId)) {
      const dyingGains = this.dyingGains
      value += dyingGains.score
      gold += dyingGains.gold
    }
    if (beforeIncome) gold += new Income(this.game).getPlayerIncome(this.player)
    // The gold left at the end only breaks ties
    value += gold * (futureTurns > 0 || beforeBuild ? GOLD_VALUE : 0.01)

    if (beforeBuild || futureTurns > 0) value += new ResourcesHelper(this.game, this.player).resources.length * RESOURCE_VALUE

    if (futureTurns > 0) value += this.survivorsValue + futureTurns * this.buildingsValue
    return value
  }

  /** The cards laid this turn */
  get deployedThisTurn(): number[] {
    return this.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, this.player) ?? []
  }

  /** The Legend points expected at the War phase of this turn */
  get warPoints(): number {
    const power = this.war.getPlayerPower(this.player)
    const twoPlayers = this.game.players.length === 2
    const pointsPerWar = 3 + this.war.getGainScoreIfWinWarAmount(this.player)
    const expectedWars = sumBy(this.getNeighbourPowers(), (other) => {
      const win = sigmoid((power - other + 0.5) / WAR_SPREAD)
      return twoPlayers ? win + sigmoid((power - 2 * other + 0.5) / WAR_SPREAD) : win
    })
    const buildHelper = new BuildHelper(this.game, this.player)
    const buildingsScore = sumBy(buildHelper.scoreAtWarBuildingEffects, (effect) => this.war.getScoreAtWar(effect, this.player))
    return (
      expectedWars * pointsPerWar +
      this.war.getCardsScoreAtWar(this.player) +
      (this.war.doublesBuildingsScore(this.player) ? 2 * buildingsScore : buildingsScore)
    )
  }

  /** The strength of the neighbours, as far as the Monarch can tell: a hidden deployment is expected to add some */
  private getNeighbourPowers(): number[] {
    if (!this.neighbourPowers) {
      const players = this.game.players
      const index = players.indexOf(this.player)
      const sides: ('left' | 'right')[] = players.length === 2 ? ['left'] : ['left', 'right']
      const hidden = this.deploymentHidden ? NEIGHBOUR_HIDDEN_GAIN : 0
      this.neighbourPowers = sides.map((side) => this.war.getPlayerPower(players[this.war.getNeighbor(players, index, side)]) + hidden)
    }
    return this.neighbourPowers
  }

  /** The deployments of the turn are still face down */
  private get deploymentHidden() {
    const ruleId = this.ruleId
    return ruleId === RuleId.Deal || ruleId === RuleId.Draft || ruleId === RuleId.GiveDraftToNeighbor || ruleId === RuleId.PlaceUnitOnBoard
  }

  /** The tokens the cards laid this turn earn when revealed */
  private deployGains(deployed: number[]): { score: number; gold: number } {
    const kingdom = new KingdomHelper(this.game, this.player)
    const gains = { score: 0, gold: 0 }
    for (const index of deployed) {
      const card = this.material(MaterialType.Unit).getItem<Card>(index).id
      for (const effect of cardEffects(card).filter(isGainTokenOnDeploy)) {
        if (!kingdom.meets(effect.condition, index)) continue
        const amount = effect.per ? effect.amount * kingdom.count(effect.per, index) : effect.amount
        if (effect.token === MaterialType.ScoreToken) gains.score += amount
        else gains.gold += amount
      }
    }
    return gains
  }

  /** The Age tokens of the units, with the ones the cards laid this turn will put when revealed (not the chosen ones) */
  private projectAgeTokens(deployed: number[]): Map<number, number> {
    const board = this.war.getPlayerBoard(this.player).getIndexes()
    const tokens = new Map(board.map((index) => [index, this.ageHelper.howManyAgeTokenOnIndex(index)]))
    const ruleId = this.ruleId
    if (ruleId === undefined || !rulesBeforeDeployEffects.includes(ruleId)) return tokens
    for (const source of deployed) {
      for (const effect of cardEffects(this.material(MaterialType.Unit).getItem<Card>(source).id).filter(isGainAgeToken)) {
        for (const index of board) {
          const target =
            effect.whichUnit === WhichUnit.Myself
              ? index === source
              : effect.whichUnit === WhichUnit.Others
                ? index !== source
                : effect.whichUnit === WhichUnit.OthersDeployedThisTurn
                  ? index !== source && deployed.includes(index)
                  : effect.whichUnit === WhichUnit.DeployedThisTurn
                    ? deployed.includes(index)
                    : true
          if (target) tokens.set(index, tokens.get(index)! + effect.amount)
        }
      }
    }
    return tokens
  }

  private isDying(index: number): boolean {
    return this.ageHelper.isUnitDying(this.material(MaterialType.Unit).getItem(index), index, this.ageTokens.get(index) ?? 0)
  }

  /** What the "when it dies" effects of the units give at the Age phase of this turn (see AgeEffects) */
  private get dyingGains(): { score: number; gold: number } {
    const kingdom = new KingdomHelper(this.game, this.player)
    const gains = { score: 0, gold: 0 }
    const board = this.war.getPlayerBoard(this.player).getIndexes()
    const tokensOnDying = sumBy(board, (index) => (this.isDying(index) ? this.ageTokens.get(index)! : 0))
    for (const index of board) {
      for (const effect of cardEffects(this.material(MaterialType.Unit).getItem<Card>(index).id).filter(isGainTokenIfDying)) {
        let amount = 0
        if (effect.whoDies === WhichUnit.All) {
          if (effect.perAgeToken) amount = effect.amount * tokensOnDying
        } else if (effect.whoDies === WhichUnit.Myself && this.isDying(index)) {
          const tokens = this.ageTokens.get(index)!
          if (effect.perAgeToken) amount = effect.amount * tokens
          else if (effect.per) amount = effect.amount * kingdom.count(effect.per, index)
          else if (!(effect.ifAgeToken && !tokens) && !(effect.ifSingleAgeToken && tokens !== 1)) amount = effect.amount
        }
        if (effect.tokenGain === MaterialType.ScoreToken) gains.score += amount
        else gains.gold += amount
      }
    }
    return gains
  }

  /** What the units that survive the Age phase of this turn will bring next turn */
  private get survivorsValue(): number {
    const units = this.war.getPlayerBoard(this.player)
    return sumBy(units.getIndexes(), (index) => {
      const unit = units.index(index)
      if (this.isDying(index)) return 0
      return SURVIVOR_VALUE + this.war.computePower(unit) * SURVIVOR_POWER_VALUE
    })
  }

  /** What the buildings bring each turn: their Legend points at the War, their income */
  private get buildingsValue(): number {
    const buildHelper = new BuildHelper(this.game, this.player)
    const income = new Income(this.game)
    return (
      sumBy(buildHelper.scoreAtWarBuildingEffects, (effect) => this.war.getScoreAtWar(effect, this.player)) * BUILDING_WAR_SCORE_VALUE +
      sumBy(buildHelper.incomeBuildingEffects, (effect) => income.getEffectIncomes(this.player, effect)) * BUILDING_INCOME_VALUE
    )
  }
}
