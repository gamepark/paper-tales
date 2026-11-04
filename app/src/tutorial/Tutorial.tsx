import { css } from '@emotion/react'
import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { PaperTalesBot } from '@gamepark/paper-tales/PaperTalesBot'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isEndPlayerTurn, isMoveItemType, isMoveItemTypeAtOnce, isStartRule, MaterialGame, MaterialMove, MaterialRules, MoveKind } from '@gamepark/rules-api'
import { TFunction } from 'i18next'
import { ReactNode } from 'react'
import { Trans } from 'react-i18next'
import { helpIconComponents } from '../material/help/book/helpIconComponents'
import { TutorialPhases } from './TutorialPhases'
import { leftNeighbour, me, opponents, rightNeighbour, scenarioUnits, TutorialSetup } from './TutorialSetup'

type Step = TutorialStep<PlayerColor, MaterialType, LocationType>
type Game = MaterialGame<PlayerColor, MaterialType, LocationType>
type Move = MaterialMove<PlayerColor, MaterialType, LocationType>

const FRONT = 0
const BACK = 1
/** The cards a Monarch has to get rid of during a deployment, to keep a single one: laid or discarded, one move each */
const CARDS_TO_DEPLOY = 4

/**
 * A focus zooms on what its step is about. Its margin, in em of the table, keeps a part of the screen free: the popup goes
 * there, never over what is highlighted. Popup positions are in em from the centre of the screen.
 */
const whole = { scale: 0.1 } // The scale of a focus is clamped by the table: below its minimum, the whole table
const popupWidth = { size: { width: 66 } }
/**
 * A step without a focus resets the zoom of the table. This focus is on nothing: the table stays as it is, and nothing is
 * darkened: for the moves of the opponents, between two popups.
 */
const keepView = () => ({ highlight: undefined })
/** A long text: a little less zoom leaves the room for a wider popup, which takes fewer lines */
const wideWidth = { size: { width: 86 } }

const ON_HAND = { margin: { top: 12, bottom: 3, left: 3, right: 3 } }
/** From a card of the fan of the recruitment to the next one, in em: the room to keep at the left of a card for the ones before it */
const FAN_STEP = 7.5
const ABOVE_HAND = { position: { y: -28 } }
/** A card to choose, with the zone of the kept cards: the zoom is lower, the popup centred in the room above the buttons of the cards */
const ABOVE_CHOICE = { position: { y: -22 } }

const ON_PLACE = { margin: { top: 4.5, bottom: 3, left: 3, right: 32 } }
const BESIDE_PLACE = { position: { x: 45, y: -8 }, ...popupWidth }

const ON_HAND_AND_GOLD = { margin: { top: 4.5, bottom: 3, left: 3, right: 28 } }
const BESIDE_HAND_AND_GOLD = { position: { x: 58, y: -5 }, ...popupWidth }

const ON_KINGDOM_LONG = { margin: { top: 4.5, bottom: 3, left: 3, right: 40 } }
const BESIDE_KINGDOM_LONG = { position: { x: 33 }, ...wideWidth }

/** The Blacksmith, with the receipt of the income in view, under the popup */
const ON_INCOME = { margin: { top: 4.5, bottom: 8, left: 3, right: 30 } }
const BESIDE_INCOME = { position: { x: 29, y: -16 }, ...popupWidth }

const ON_BUILDINGS = { margin: { top: 4.5, bottom: 3, left: 34, right: 3 } }
const BESIDE_BUILDINGS = { position: { x: -42 }, ...popupWidth }
const ON_BUILDINGS_LONG = { margin: { top: 4.5, bottom: 3, left: 44, right: 3 } }
const BESIDE_BUILDINGS_LONG = { position: { x: -36 }, ...wideWidth }

/** In the neighbours view: centred in the free corner at the bottom left, between the edge of the screen and my ribbon */
const BOTTOM_LEFT = { position: { x: -63, y: 19 }, size: { width: 60 } }

const sentenceGapCss = css`
  display: block;
  height: 0.5em;
`

const components = { ...helpIconComponents, strong: <strong />, em: <em />, gap: <span css={sentenceGapCss} /> }

/** The line breaks of a text leave a gap between its sentences; the items of a list ("- ") stay close to what they complete */
const withSentenceGaps = (t: TFunction) => ((...args: Parameters<TFunction>) => String(t(...args)).replace(/\n(?!- )/g, '<gap/>')) as TFunction

const text = (key: string, defaults: string, extra?: ReactNode) => (t: TFunction) => (
  <>
    <Trans i18nKey={`tuto.${key}`} defaults={defaults} components={components} t={withSentenceGaps(t)} />
    {extra}
  </>
)

const startsRule = (rule: RuleId) => (move: Move) => isStartRule(move) && move.id === rule
const movesGold = (move: Move) => move.kind === MoveKind.ItemMove && move.itemType === MaterialType.Gold

/**
 * The scenario of the first turn. Each step of an opponent is one of their moves, chosen by their bot among the moves
 * of the step (see getNextMove); a phase therefore has a known number of moves: a pick, a deployment of 4 cards laid or
 * discarded then its end, the end of the reading of the wars, a building or a pass. The moves that come by themselves
 * wait behind the popup that announces them (interrupt), and are played when it is closed; a popup comes once the rule of
 * its phase has started when it can, for the header to go with it. The player plays freely from the second turn on, the
 * opponents being played by their bot.
 */
export class Tutorial extends MaterialTutorial<PlayerColor, MaterialType, LocationType> {
  version = 1
  options = { players: [{ id: me }, { id: leftNeighbour }, { id: rightNeighbour }] }
  setup = new TutorialSetup()
  players = [{ id: me }, { id: leftNeighbour, name: 'Masato' }, { id: rightNeighbour, name: 'Christine' }]

  /** The opponents play what their bot would play, among the moves their step allows */
  getNextMove(rules: MaterialRules<PlayerColor, MaterialType, LocationType>) {
    const tutorial = rules.game.tutorial
    const player = tutorial && this.steps[tutorial.step]?.move?.player
    if (player === undefined || player === me) return undefined
    return new PaperTalesBot(player).run(rules.game)[0] as Move
  }

  private units(game: Game) {
    return this.material(game, MaterialType.Unit)
  }

  private draftHand(game: Game) {
    return this.units(game).location(LocationType.PlayerDraftHand).player(me)
  }

  private hand(game: Game) {
    return this.units(game).location(LocationType.PlayerUnitHand).player(me)
  }

  private kingdom(game: Game) {
    return this.units(game).location(LocationType.PlayerUnitBoard).player(me)
  }

  private allKingdoms(game: Game) {
    return this.units(game).location(LocationType.PlayerUnitBoard)
  }

  private buildings(game: Game) {
    return this.material(game, MaterialType.Building).player(me)
  }

  private gold(game: Game) {
    return this.material(game, MaterialType.Gold).location(LocationType.PlayerGoldStock).player(me)
  }

  private isFree(game: Game, x: number | undefined, y: number) {
    return !this.kingdom(game).filter((unit) => unit.location.x === x && unit.location.y === y).length
  }

  /** The move of a card towards the kept hand */
  private keeps(move: Move, game: Game, isAllowed: (unit: Unit) => boolean) {
    if (!isMoveItemType(MaterialType.Unit)(move) || move.location.type !== LocationType.PlayerUnitHand) return false
    return isAllowed(this.units(game).getItem<Unit>(move.itemIndex).id)
  }

  /** Where the card I keep goes: to be seen when I choose it, even while no card is kept yet */
  private keptCardsZone() {
    return { locations: [this.location(LocationType.PlayerUnitHand).player(me).location] }
  }

  /** The step where I keep this card: it is the only one I can keep */
  private pick(unit: Unit, popupText: (t: TFunction) => ReactNode): Step {
    return {
      popup: { text: popupText, ...ABOVE_CHOICE },
      focus: (game) => {
        const before = this.draftHand(game).filter<Unit>((card) => card.id !== unit).filter((card) => card.location.x! < this.draftHand(game).id(unit).getItem()!.location.x!).length
        return {
          materials: [this.draftHand(game).id(unit), this.hand(game)],
          ...this.keptCardsZone(),
          margin: { ...ON_HAND.margin, left: ON_HAND.margin.left + before * FAN_STEP }
        }
      },
      move: { filter: (move, game) => this.keeps(move, game, (id) => id === unit) }
    }
  }

  /** The opponents keep the best card for them, among the ones the scenario does not need */
  private opponentsPick(): Step[] {
    return opponents.map((player) => ({
      focus: keepView,
      move: { player, filter: (move, game) => this.keeps(move, game, (id) => !scenarioUnits.includes(id)) }
    }))
  }

  /** The step where I lay this card on a free space of this row */
  private place(unit: Unit, y: number, popupText: (t: TFunction) => ReactNode): Step {
    return {
      popup: { text: popupText, ...BESIDE_PLACE },
      focus: (game) => ({
        materials: [this.hand(game).id(unit)],
        locations: [0, 1].filter((x) => this.isFree(game, x, y)).map((x) => this.location(LocationType.PlayerUnitBoard).player(me).x(x).y(y).location),
        ...ON_PLACE
      }),
      move: {
        filter: (move, game) =>
          isMoveItemType(MaterialType.Unit)(move) &&
          move.location.type === LocationType.PlayerUnitBoard &&
          move.location.y === y &&
          this.isFree(game, move.location.x, y) &&
          this.units(game).getItem<Unit>(move.itemIndex).id === unit
      }
    }
  }

  /** Every opponent lays or discards 4 of their 5 cards, then ends their deployment: the rule of the reveal starts, its cards wait for its text */
  private opponentsDeploy(): Step[] {
    return opponents.flatMap((player) => [
      ...Array.from({ length: CARDS_TO_DEPLOY }, (): Step => ({ focus: keepView, move: { player, filter: isMoveItemType(MaterialType.Unit) } })),
      {
        focus: keepView,
        move: { player, filter: isEndPlayerTurn, interrupt: player === rightNeighbour ? isMoveItemTypeAtOnce(MaterialType.Unit) : undefined }
      }
    ])
  }

  /** Every opponent plays their single move of the phase; the last one leaves what follows behind the next popup */
  private opponentsEndPhase(interrupt: (move: Move) => boolean): Step[] {
    return opponents.map((player) => ({
      focus: keepView,
      move: { player, interrupt: player === rightNeighbour ? interrupt : undefined }
    }))
  }

  steps: Step[] = [
    { popup: { text: text('welcome', 'Welcome to the <strong>Paper Tales</strong> tutorial') } },
    {
      popup: {
        text: text(
          'goal',
          'In Paper Tales, you are a <strong>monarch</strong> and you develop your <strong>kingdom</strong>, while fighting your neighbours.'
        )
      }
    },
    {
      popup: {
        text: text('turns', 'The game lasts <strong>4 turns</strong>, and each turn has <strong>6 phases</strong>:', <TutorialPhases />)
      }
    },

    // 1. Recruitment
    {
      popup: {
        text: text(
          'recruit',
          'Let’s start the <strong>Recruitment</strong> <phase1/> phase of turn 1!\nDuring the Recruitment, all the players will select <strong>5 Unit cards</strong>.'
        ),
        ...ABOVE_CHOICE
      },
      focus: (game) => ({ materials: [this.draftHand(game), this.hand(game)], ...this.keptCardsZone(), ...ON_HAND })
    },
    {
      popup: {
        text: text(
          'draft',
          'It is a <strong>draft</strong>: you select a card you are interested in, and pass the others to your neighbour (to the left at turns 1 and 3, to the right at turns 2 and 4).'
        ),
        ...ABOVE_CHOICE
      },
      focus: (game) => ({ materials: [this.draftHand(game), this.hand(game)], ...this.keptCardsZone(), ...ON_HAND })
    },
    this.pick(Unit.ForestSpirit, text('pick', 'Select this card.')),
    ...this.opponentsPick(),
    {
      popup: {
        text: text('received', 'All the players selected a card at the same time.\nYou received these <strong>4 cards</strong> from your right neighbour.'),
        ...ABOVE_CHOICE
      },
      focus: (game) => ({ materials: [this.draftHand(game), this.hand(game)], ...this.keptCardsZone(), ...ON_HAND })
    },
    this.pick(Unit.Farmer, text('pick', 'Select this card.')),
    ...this.opponentsPick(),
    this.pick(Unit.Hunter, text('pick.next', 'The draft goes on until all the players have selected 5 cards.\nSelect this card.')),
    ...this.opponentsPick(),
    {
      popup: { text: text('pick.free', 'Select the card of your choice.'), ...ABOVE_CHOICE },
      focus: (game) => ({ materials: [this.draftHand(game), this.hand(game)], ...this.keptCardsZone(), ...ON_HAND }),
      move: { filter: (move, game) => this.keeps(move, game, () => true) }
    },
    ...this.opponentsPick(),

    // 2. Deployment
    {
      popup: {
        text: text('deploy', 'You have selected your 5 cards: time for the <strong>Deployment</strong> <phase2/>!'),
        ...ABOVE_HAND
      },
      focus: (game) => ({ materials: [this.hand(game)], ...ON_HAND })
    },
    {
      popup: {
        text: text(
          'deploy.kingdom',
          'During the Deployment, all the players place their Units at the same time, <strong>face down</strong>, in their Kingdom.\nYour Kingdom has <strong>2 rows</strong>:\n- the <strong>Front</strong>: its Units fight during the War;\n- the <strong>Back</strong>: its Units do not fight, but they produce their resources and apply their effects like the others.'
        ),
        ...BESIDE_KINGDOM_LONG
      },
      focus: () => ({
        locations: [0, 1].flatMap((x) => [FRONT, BACK].map((y) => this.location(LocationType.PlayerUnitBoard).player(me).x(x).y(y).location)),
        ...ON_KINGDOM_LONG
      })
    },
    {
      popup: {
        text: text(
          'deploy.cost',
          'Each Unit has a <strong>recruitment cost</strong>, at the top left of the card: you must pay these coins <gold/> to deploy it.\nYou start the game with <g3/>.'
        ),
        ...BESIDE_HAND_AND_GOLD
      },
      focus: (game) => ({
        materials: [this.hand(game), this.gold(game)],
        locations: this.hand(game)
          .getIndexes()
          .map((card) => this.location(LocationType.UnitCost).parent(card).location),
        ...ON_HAND_AND_GOLD
      })
    },
    this.place(Unit.ForestSpirit, FRONT, text('place.spirit', 'Place the <strong>Forest Spirit</strong> at the Front.')),
    this.place(
      Unit.Hunter,
      FRONT,
      text(
        'place.hunter',
        'The Forest Spirit costs <g3/>: that is all your gold.\nFortunately, the other cards you are going to deploy are free!\nPlace the <strong>Hunter</strong> at the Front: he only produces <food/> at the Front.'
      )
    ),
    this.place(
      Unit.Farmer,
      BACK,
      text('place.farmer', 'Place the <strong>Farmer</strong> at the Back: with a Strength of 1, he would be weak in a fight, but he produces <food/> wherever he is.')
    ),
    this.place(Unit.Blacksmith, BACK, text('place.blacksmith', 'Place the <strong>Blacksmith</strong> at the Back: she earns you <g1/> at each Income phase.')),
    {
      popup: {
        text: text('deploy.end', 'You can keep <strong>a single card</strong> in hand for the next turn: the others are discarded.\nEnd your Deployment.'),
        ...ABOVE_HAND
      },
      focus: (game) => ({ materials: [this.hand(game)], ...ON_HAND }),
      move: { filter: isEndPlayerTurn }
    },
    ...this.opponentsDeploy(),
    {
      popup: {
        text: text('reveal', 'All the Kingdoms are revealed at the same time.\nEach player pays the cost of the Units they have just deployed.'),
        ...BOTTOM_LEFT
      },
      focus: (game) => ({ materials: [this.allKingdoms(game)], ...whole }),
      move: { interrupt: startsRule(RuleId.War) }
    },

    // 3. War
    {
      popup: { text: text('war', 'Time for the <strong>War</strong> <phase3/>!'), ...BOTTOM_LEFT },
      focus: (game) => ({ materials: [this.allKingdoms(game)], ...whole })
    },
    {
      popup: {
        text: text(
          'war.strength',
          'You wage war on <strong>each of your 2 neighbours</strong>, the left one and the right one.\nYour <strong>Strength</strong> is the sum of the Strengths of the Units at your <strong>Front</strong>: 3 for the Forest Spirit, and 2 for the Hunter, that is <strong>5</strong>.\nThe Units at the Back do not fight (with some exceptions, like the Archer).'
        ),
        ...BESIDE_KINGDOM_LONG
      },
      focus: (game) => ({ materials: [this.kingdom(game).filter((unit) => unit.location.y === FRONT)], ...ON_KINGDOM_LONG })
    },
    {
      popup: {
        text: text(
          'war.win',
          'For each neighbour whose Strength is <strong>lower than or equal to</strong> yours, you win the war and gain <strong>3 Legend points</strong> <pl3/>.'
        ),
        ...BOTTOM_LEFT
      },
      focus: (game) => ({ materials: [this.allKingdoms(game).filter((unit) => unit.location.y === FRONT)], ...whole }),
      move: {}
    },
    { move: { filter: isEndPlayerTurn } },
    ...this.opponentsEndPhase(movesGold),

    // 4. Income
    {
      popup: { text: text('income', 'Time for the <strong>Income</strong> <phase4/>!'), ...BESIDE_INCOME },
      focus: (game) => ({ materials: [this.kingdom(game).id(Unit.Blacksmith), this.gold(game)], ...ON_INCOME })
    },
    {
      popup: {
        text: text('income.gain', 'Each player gains <g2/>, plus the gold earned by their cards and buildings.\nWith your Blacksmith, you therefore gain <g3/> in all.'),
        ...BESIDE_INCOME
      },
      focus: (game) => ({ materials: [this.kingdom(game).id(Unit.Blacksmith), this.gold(game)], ...ON_INCOME }),
      move: {}
    },

    // 5. Construction
    {
      popup: { text: text('build', 'Let’s move on to the <strong>Construction</strong> <phase5/>.'), ...BESIDE_KINGDOM_LONG },
      focus: (game) => ({ materials: [this.kingdom(game).id<Unit>((id) => id !== Unit.Blacksmith)], ...ON_KINGDOM_LONG })
    },
    {
      popup: {
        text: text(
          'build.resources',
          'To build, you need <strong>resources</strong>: <wood/> Wood, <food/> Food and <crystal/> Crystal.\nThey are produced by your Units and your Buildings, and they are not spent: a building only requires your Kingdom to produce the resources shown on its cost.\nYour Kingdom produces <wood/> <wood/> <wood/> with the Forest Spirit, <food/> with the Farmer and <food/> with the Hunter.'
        ),
        ...BESIDE_KINGDOM_LONG
      },
      focus: (game) => ({ materials: [this.kingdom(game).id<Unit>((id) => id !== Unit.Blacksmith)], ...ON_KINGDOM_LONG })
    },
    {
      popup: {
        text: text(
          'build.levels',
          'Each Building has 2 levels, and a cost for each level.\nA Building <b1/> earns 1 Legend point at the end of the game; a Building <b2/> earns <strong>3</strong> and gives a more powerful effect.\nA level 2 Building also opens a <strong>5th space</strong> at the Front of your Kingdom.'
        ),
        ...BESIDE_BUILDINGS_LONG
      },
      focus: (game) => ({ materials: [this.buildings(game)], ...ON_BUILDINGS_LONG })
    },
    {
      popup: {
        text: text(
          'build.ways',
          'There are 2 ways to get a Building <b2/>:\n- build it at <b1/>, then <strong>upgrade</strong> it later: you then only need the level 2 cost;\n- build it <strong>directly at level 2</strong>: you then need the <strong>sum of the level 1 and level 2 costs</strong>.'
        ),
        ...BESIDE_BUILDINGS_LONG
      },
      focus: (game) => ({ materials: [this.buildings(game)], ...ON_BUILDINGS_LONG })
    },
    {
      popup: {
        text: text(
          'build.choose',
          'Build directly the level 2 Building of your choice: with <wood/> <wood/> <wood/> <food/> <food/>, you can build the Tavern, the Barracks or the Town.\n<em>Click the buildings to learn their effects.</em>'
        ),
        ...BESIDE_BUILDINGS
      },
      focus: (game) => ({
        materials: [this.buildings(game).id<Building>((id) => [Building.Tavern, Building.Barracks, Building.Town].includes(id))],
        ...ON_BUILDINGS
      }),
      move: {
        filter: (move) => isMoveItemType(MaterialType.Building)(move) && move.location.type === LocationType.PlayerBuildingBoard && move.location.rotation === true
      }
    },
    {
      popup: {
        text: text(
          'build.land',
          'Your first Building is free, but each new Building also costs the <strong>land cost</strong>: <g2/> per Building already built.\nUpgrading a Building already built costs no land.'
        ),
        ...BESIDE_BUILDINGS
      },
      focus: (game) => ({ materials: [this.buildings(game)], ...ON_BUILDINGS })
    },
    ...this.opponentsEndPhase(startsRule(RuleId.AgeUnitsDie)),

    // 6. Age
    {
      popup: { text: text('age', 'The turn ends with the <strong>Age</strong> <phase6/> phase.'), ...BESIDE_KINGDOM_LONG },
      focus: (game) => ({ materials: [this.kingdom(game)], ...ON_KINGDOM_LONG })
    },
    {
      popup: {
        text: text(
          'age.tokens',
          'Units grow old:\n- first, each Unit that already has an Age token <age/> <strong>dies</strong> and is discarded;\n- then, each surviving Unit receives an Age token <ageplus/>.\nYour Units were deployed this turn: they all receive a token <age/>, and will die at the end of next turn.\nSome Units are exceptions, or take advantage of their Age tokens: read their effects carefully!'
        ),
        ...BESIDE_KINGDOM_LONG
      },
      focus: (game) => ({ materials: [this.kingdom(game)], ...ON_KINGDOM_LONG }),
      move: { interrupt: startsRule(RuleId.NextTurn) }
    },
    {
      popup: {
        text: text('help', 'Did you know?\nYou can <strong>click a card</strong>, a Building or any element of the game to display its help and the rules that apply to it.'),
        ...BESIDE_KINGDOM_LONG
      },
      focus: (game) => ({ materials: [this.kingdom(game)], ...ON_KINGDOM_LONG })
    },
    {
      popup: {
        text: text('end', 'Turn 1 is over!\nYou now know the 6 phases of a turn.\nYour turn to play: the choices are yours for the rest of the game.\nGood luck, Monarch!'),
        ...BESIDE_KINGDOM_LONG
      },
      focus: (game) => ({ materials: [this.kingdom(game)], ...ON_KINGDOM_LONG }),
      move: {}
    }
  ]
}
