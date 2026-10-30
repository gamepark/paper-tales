import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesOptions } from '@gamepark/paper-tales/PaperTalesOptions'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { DeployEffects, isChoice } from '@gamepark/paper-tales/rules/2_Deployment/DeployEffects'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialContext } from '@gamepark/react-game'
import { Coordinates, MaterialMoveBuilder, XYCoordinates } from '@gamepark/rules-api'
import { uniq } from 'es-toolkit/compat'
import { buildingCardDescription } from '../material/BuildingCardDescription'
import { unitCardDescription } from '../material/UnitCardDescription'

/**
 * The whole table, in em: the same on a phone in landscape and on a desktop (see docs/table-spec.md).
 *
 * - Left: the players' panels in a column, in seating order (right neighbour, me, left neighbour, then the others).
 * - Center: one player area at full size: mine by default, or the player chosen with the eye of their panel (a transient
 *   changeView). The neighbours view shows instead the kingdoms of the displayed player's 2 neighbours on each side of
 *   theirs: war is only fought between neighbours (rulebook p.6).
 * - Right: the turn counter, the deck, the discard and the reserves.
 *
 * A player area (rulebook p.4): the kingdom (2 slots at the front, 2 at the back, a 5th at the front once a level 2
 * building is in play), a fixed grid of the buildings at its right (greyed out until built), and, in my area only, my
 * hands and my gold below the kingdom.
 */

// Ratio 2.1: between a desktop (16:9 minus the header, about 1.9) and a phone in landscape (2.16 to 2.22)
export const tableBoundaries = { xMin: 0, xMax: 100, yMin: 0, yMax: 47.5 }

// Panels column: room at its left for the line of the turn order that goes back to the first panel, and between the
// panels for its chevrons
export const PANEL_X = 1.3
export const PANEL_WIDTH = 16
export const PANEL_HEIGHT = 5.4
export const PANEL_Y = 0.8
export const PANEL_STEP = 6.4
// My neighbours and I are the 3 first panels, a little apart from the others
const PANELS_GROUP_GAP = 1

// Player area
const AREA_X = PANEL_X + PANEL_WIDTH + 3.3
const AREA_Y = 0.8
const KINGDOM_COLUMN = unitCardDescription.width + 0.5
const KINGDOM_ROW = unitCardDescription.height + 0.5
export const KINGDOM_WIDTH = KINGDOM_COLUMN * 3 - 0.5
export const KINGDOM_HEIGHT = KINGDOM_ROW * 2 - 0.5
const BUILDINGS_X = AREA_X + KINGDOM_WIDTH + 2.4
const BUILDING_COLUMN_GAP = 1
const BUILDING_ROW_GAP = 0.9
const HANDS_Y = AREA_Y + KINGDOM_HEIGHT + 2.8 + unitCardDescription.height / 2
// Hands row under the kingdom: the draft fan at the left, the kept hand at its right (deployment: the whole hand there)
// The fan of 5 to 9 cards spreads to its left: centred far enough from the panels that its first card stays clear of them
export const draftHandCoordinates = { x: AREA_X + 19, y: HANDS_Y }
// With 2 players, only 2 panels at the top: the fan of 9 cards spreads to the left under them, up to the kept cards
export const twoPlayersDraftHandCoordinates = { x: AREA_X + 17.7, y: HANDS_Y }
// During the recruitment, the kept cards pile up towards the discard, clear of the widest fan (9 cards at 2 players)
const KEPT_HAND_X = AREA_X + 59
// The gold of the displayed kingdom: in the empty corner of the kingdom, under its 5th slot (there is no 5th slot at the
// back), between the units and the buildings
export const playerGoldCoordinates = {
  x: AREA_X + KINGDOM_COLUMN * 2 + unitCardDescription.width / 2,
  y: AREA_Y + KINGDOM_ROW + 4
}
// The spectator's ribbon about the cards to draft: centred above the fan they are about (the ribbon is translated by
// half its width). A spectator has no buttons above the cards.
export const handsLabelPosition = { x: draftHandCoordinates.x, y: AREA_Y + KINGDOM_HEIGHT + 0.5 }
// What my gold is spent on (deployment, construction): right under my pile of gold, centred on it (the labels are
// translated by half their width)
export const deployGoldPosition = { x: playerGoldCoordinates.x, y: playerGoldCoordinates.y + 4.2 }
export const buildInfoPosition = deployGoldPosition

// Right column. From the top: the current turn, the views, the deck, the discard, then the reserves next to my gold.
// The turn and the piles have a short ribbon 0.5 em under them, which frames the column.
const SIDE_X = 93.5
export const sideColumnPosition = { x: SIDE_X - 5.5, y: AREA_Y }
export const SIDE_COLUMN_WIDTH = 11
export const COMMON_SCALE = 0.5
// Under the turn: the views, written in words (up to 3 lines when I look at another player)
export const viewsPosition = { x: SIDE_X - 5.5, y: 9.3 }

// The deck, then the discard under it, each with its own ribbon
const PILE_HALF_HEIGHT = (unitCardDescription.height * COMMON_SCALE) / 2
const DECK_Y = 22.2
const DISCARD_Y = 32
export const deckCoordinates = { x: SIDE_X, y: DECK_Y }
export const discardCoordinates = { x: SIDE_X, y: DISCARD_Y }
export const deckLabelPosition = { x: SIDE_X - 5.5, y: DECK_Y + PILE_HALF_HEIGHT + 0.5 }
export const discardLabelPosition = { x: SIDE_X - 5.5, y: DISCARD_Y + PILE_HALF_HEIGHT + 0.5 }
const RESERVES_Y = 40.6
export const goldStockCoordinates = { x: SIDE_X - 2.9, y: RESERVES_Y }
// The rules of the expansions played, at the foot of the column, under the reserves
export const expansionRulesPosition = { x: SIDE_X - 5.5, y: 44 }
export const ageStockCoordinates = { x: SIDE_X + 2.9, y: RESERVES_Y }

// Neighbours view, laid out like the seats around the table: my 2 neighbours at the top (left and right), the central
// player at the bottom, larger. Nothing else is drawn in the area in this view, so it spans up to the side column.
const WAR_RIGHT = 86.5
const WAR_CENTER_X = AREA_X + (WAR_RIGHT - AREA_X) / 2
const NEIGHBOUR_SCALE = 0.63
const CENTER_SCALE = 0.76
const WAR_TOP_Y = AREA_Y
/**
 * A seat of the neighbours view: the kingdom, a column of its built buildings at its right, like in a player area, and
 * with What forges legends a column of its war Artifacts at their right. Local coordinates are scaled.
 */
type WarSeat = { kingdomX: number; buildingsX: number; artifactsX: number; y: number; scale: number }
const WAR_BUILDINGS_GAP = 1
const WAR_ARTIFACTS_GAP = 0.6
const WAR_SEAT_WIDTH = KINGDOM_WIDTH + WAR_BUILDINGS_GAP + buildingCardDescription.width
const WAR_ARTIFACTS_WIDTH = WAR_ARTIFACTS_GAP + unitCardDescription.width
// With 2 players, the two seats side by side, as large as they can be with a margin at each end and a gap between them:
// a kingdom with its 5th slot, its buildings and its artifacts never runs into the other one. With 3, my 2 neighbours at
// the top shrink as much, when their artifacts columns would make them meet.
const TWO_SEATS_MARGIN = 1
const TWO_SEATS_GAP = 2.5
const NEIGHBOURS_GAP = 2.5

type WarLayout = { seatWidth: number; neighbourScale: number; twoScale: number; bottomY: number }
const getWarLayout = (context: MaterialContext): WarLayout => {
  const seatWidth = WAR_SEAT_WIDTH + (hasArtifacts(context) ? WAR_ARTIFACTS_WIDTH : 0)
  const neighbourScale = Math.min(NEIGHBOUR_SCALE, (WAR_RIGHT - AREA_X - NEIGHBOURS_GAP) / (2 * seatWidth))
  const twoScale = Math.min(CENTER_SCALE, (WAR_RIGHT - AREA_X - 2 * TWO_SEATS_MARGIN - TWO_SEATS_GAP) / (2 * seatWidth))
  // The central kingdom right under the neighbours row: their ribbons and the war results (about 2.5 em) plus a clear gap
  // of 1.5 em. Its own ribbon stands at its left, in the room under my left neighbour, so that it takes no height.
  const bottomY = WAR_TOP_Y + KINGDOM_HEIGHT * neighbourScale + 1.4 + 2.6 + 1.5
  return { seatWidth, neighbourScale, twoScale, bottomY }
}

const getWarSeat = (context: MaterialContext, index: number, count: number): WarSeat => {
  const { seatWidth, neighbourScale, twoScale, bottomY } = getWarLayout(context)
  const right = (x: number, scale: number) => ({
    kingdomX: x,
    buildingsX: x + (KINGDOM_WIDTH + WAR_BUILDINGS_GAP) * scale,
    artifactsX: x + (WAR_SEAT_WIDTH + WAR_ARTIFACTS_GAP) * scale,
    scale
  })
  if (count === 2)
    return index === 0
      ? { ...right(AREA_X + TWO_SEATS_MARGIN, twoScale), y: AREA_Y + 2 }
      : { ...right(WAR_RIGHT - seatWidth * twoScale - TWO_SEATS_MARGIN, twoScale), y: AREA_Y + 2 }
  if (index === 0) return { ...right(AREA_X, neighbourScale), y: WAR_TOP_Y }
  if (index === 2) return { ...right(WAR_RIGHT - seatWidth * neighbourScale, neighbourScale), y: WAR_TOP_Y }
  return { ...right(WAR_CENTER_X - (seatWidth * CENTER_SCALE) / 2, CENTER_SCALE), y: bottomY }
}

/** The war seat of a Monarch of the neighbours view */
const getPlayerWarSeat = (context: MaterialContext, player: number | undefined) => {
  const players = getWarPlayers(context)
  return getWarSeat(context, Math.max(0, players.indexOf(player as PlayerColor)), players.length)
}
/**
 * Where the ribbon of a kingdom of the neighbours view stands. With 2 kingdoms, centered under the seat (kingdom and
 * buildings column, so that it does not read as the caption of the buildings). With 3, my 2 neighbours have theirs
 * towards the middle of the view, leaving the outer ends of the row to the war results; the central kingdom has its own
 * at its left against its bottom edge (beside: the anchor is the ribbon's bottom right corner).
 */
const RIBBON_INSET = 5
export const getWarRibbonPosition = (context: MaterialContext, index: number, count: number) => {
  const seat = getWarSeat(context, index, count)
  const y = seat.y + KINGDOM_HEIGHT * seat.scale + 1.4
  if (count === 3 && index === 1) return { x: seat.kingdomX - 1, y: seat.y + KINGDOM_HEIGHT * seat.scale, beside: true }
  if (count === 3 && index === 0) return { x: seat.kingdomX + WAR_SEAT_WIDTH * seat.scale - RIBBON_INSET, y, beside: false }
  if (count === 3) return { x: seat.kingdomX + RIBBON_INSET, y, beside: false }
  return { x: seat.kingdomX + (WAR_SEAT_WIDTH * seat.scale) / 2, y, beside: false }
}

/** With 3 kingdoms, a cut line between my 2 neighbours, from the top of the view down through the row of their ribbons */
export const getWarSeparator = (context: MaterialContext) => {
  const { seatWidth, neighbourScale, bottomY } = getWarLayout(context)
  const leftEnd = AREA_X + seatWidth * neighbourScale
  const rightStart = WAR_RIGHT - seatWidth * neighbourScale
  return { x: (leftEnd + rightStart) / 2, y: WAR_TOP_Y - 0.5, height: bottomY - WAR_TOP_Y }
}

/**
 * With 3 kingdoms, where the ribbon of a neighbour stands, then the duel of their war (see WarDuel): at the outer end of
 * the view on their side, in the empty room beside the central kingdom; with 2, centred under both kingdoms. The anchor
 * is the top centre of the slip.
 */
export const getWarResultPosition = (context: MaterialContext, neighbourIndex: number, count: number): XYCoordinates => {
  if (count === 2) {
    const seat = getWarSeat(context, 0, 2)
    return { x: WAR_CENTER_X, y: seat.y + KINGDOM_HEIGHT * seat.scale + 4.2 }
  }
  // In the row between my neighbours and the central kingdom, at its outer ends: the central kingdom keeps the room at its
  // sides for its buildings and artifacts
  const { seatWidth, neighbourScale } = getWarLayout(context)
  const center = getWarSeat(context, 1, 3)
  const centerRight = center.kingdomX + seatWidth * center.scale
  const x = neighbourIndex === 0 ? (AREA_X + center.kingdomX) / 2 : (centerRight + WAR_RIGHT) / 2
  return { x, y: WAR_TOP_Y + KINGDOM_HEIGHT * neighbourScale + 0.6 }
}

/**
 * With 3 kingdoms, where the ribbon of a neighbour meets the duel of their war (see WarInfo): at the inner end of the room
 * beside the central kingdom on their side. The ribbon stands towards the middle of the view, the duel towards its outer
 * end. Vertically, the middle of the ribbon is the middle of the duel.
 */
export const getNeighbourJunction = (context: MaterialContext, neighbourIndex: number): XYCoordinates => {
  const { seatWidth } = getWarLayout(context)
  const center = getWarSeat(context, 1, 3)
  const x = neighbourIndex === 0 ? center.kingdomX : center.kingdomX + seatWidth * center.scale
  return { x, y: getWarResultPosition(context, neighbourIndex, 3).y + 0.85 }
}

/**
 * Where the gains of the wars of the central kingdom are told (see WarGains): under the war against the left neighbour,
 * in the room at the left of the central kingdom; with 2 kingdoms, under the result of their war. The anchor is the top
 * centre of the receipt.
 */
export const getWarGainsPosition = (context: MaterialContext): XYCoordinates => {
  const count = getWarPlayers(context).length
  const result = getWarResultPosition(context, 0, count)
  return { x: result.x, y: result.y + 6.6 }
}

export const getMe = (context: MaterialContext): PlayerColor => (context.player ?? context.rules.players[0]) as PlayerColor

/** A spectator plays no seat: "me" is then only the first player, and nothing should be told as if they were them */
export const isSpectator = (context: MaterialContext) => context.player === undefined

const getPlayerAt = (context: MaterialContext, from: PlayerColor, offset: number): PlayerColor => {
  const players = context.rules.players as PlayerColor[]
  const index = players.indexOf(from)
  return players[(index + offset + players.length) % players.length]
}

/**
 * The draft passes to the next player on odd rounds, which the rulebook calls "left"
 */
export const getLeftNeighbour = (context: MaterialContext, player = getMe(context)) => getPlayerAt(context, player, 1)

export const getRightNeighbour = (context: MaterialContext, player = getMe(context)) => getPlayerAt(context, player, -1)

export const isNeighbour = (context: MaterialContext, player: number) =>
  player !== getMe(context) && (player === getLeftNeighbour(context) || player === getRightNeighbour(context))

/**
 * The view chosen by a Monarch (a transient changeView) holds for the part of the turn it was chosen in: the turn, and
 * whether the kingdoms were revealed yet. A new turn starts in my area, and the reveal and the wars are shown to everyone
 * on the neighbours view (see warRules), whatever was looked at during the deployment. The part of the turn is stamped
 * on the view number.
 */
const VIEW_STAMP = 1000
const isAfterReveal = (context: MaterialContext) => {
  const rule = context.rules.game.rule?.id as RuleId | undefined
  return rule !== undefined && rule >= RuleId.RevealBoards && rule !== RuleId.EndGame
}
const getViewStamp = (context: MaterialContext) => getRound(context) * 2 + (isAfterReveal(context) ? 1 : 0)

/** The move that displays a view: a player's area, or the neighbours of a player (see getNeighboursView) */
export const viewMove = (context: MaterialContext, view: number) => MaterialMoveBuilder.changeView(getViewStamp(context) * VIEW_STAMP + view)

/** The view chosen for the current part of the turn, undefined when none was */
const getChosenView = (context: MaterialContext): number | undefined => {
  const view = context.rules.game.view
  if (view === undefined || Math.floor(view / VIEW_STAMP) !== getViewStamp(context)) return undefined
  return view % VIEW_STAMP
}

/**
 * Player whose area is displayed: chosen with a transient changeView, me by default
 */
export const getViewedPlayer = (context: MaterialContext): PlayerColor => {
  const view = getChosenView(context) as PlayerColor | undefined
  return view !== undefined && context.rules.players.includes(view) ? view : getMe(context)
}

/**
 * View flag that lays the displayed player's 2 neighbours on each side of them. The kingdoms are revealed, then fight,
 * on that view: the units of the neighbours are seen before the wars they decide.
 */
export const NEIGHBOURS_VIEW = 100
// From the reveal to the summary of the wars, the turn resolves on the neighbours view: the new units, what they cost and
// do (a Golem upgrades a building of the column, Age tokens land on the units), the wars, then their summary until I move
// on. A deployment effect I choose how to apply opens my kingdom; the income is earned in my kingdom, where my gold is.
const warRules = [RuleId.RevealBoards, RuleId.PayDeployedUnits, RuleId.DeployEffects, RuleId.War]

/** A deployment effect of mine waits for my choice: it is made on my kingdom */
const isChoosingDeployEffect = (context: MaterialContext) => {
  if (context.rules.game.rule?.id !== RuleId.DeployEffects || isSpectator(context)) return false
  const me = getMe(context)
  if (!context.rules.isTurnToPlay(me)) return false
  const pending = new DeployEffects(context.rules.game).getCurrentEffect(me)
  return !!pending && isChoice(pending.effect)
}

/** The summary of the wars, until I move on (a spectator reads it until every Monarch has) */
export const isReadingWarSummary = (context: MaterialContext) =>
  context.rules.game.rule?.id === RuleId.WarSummary && (isSpectator(context) || context.rules.isTurnToPlay(getMe(context)))

/**
 * The view of the neighbours of a player: NEIGHBOURS_VIEW for mine, NEIGHBOURS_VIEW + the player for anybody's (a
 * spectator, or a Monarch looking at another kingdom, can look at its neighbours too)
 */
export const getNeighboursView = (context: MaterialContext, player: PlayerColor) =>
  player === getMe(context) && !isSpectator(context) ? NEIGHBOURS_VIEW : NEIGHBOURS_VIEW + player

const isNeighboursView = (context: MaterialContext) => (getChosenView(context) ?? 0) >= NEIGHBOURS_VIEW

/** The wars of this turn are fought and their results can be shown */
export const areWarsFought = (context: MaterialContext) =>
  [RuleId.War, RuleId.WarSummary, RuleId.Income, RuleId.Build].includes(context.rules.game.rule?.id as RuleId)

export const isWarView = (context: MaterialContext) => {
  if (isNeighboursView(context)) return true
  if (getChosenView(context) !== undefined) return false
  return (warRules.includes(context.rules.game.rule?.id as RuleId) && !isChoosingDeployEffect(context)) || isReadingWarSummary(context)
}

/**
 * The player in the middle of the neighbours view: the one whose neighbours were asked for, else the displayed player
 * (the automatic view of the wars)
 */
export const getWarCenter = (context: MaterialContext): PlayerColor => {
  const view = getChosenView(context) ?? 0
  if (view === NEIGHBOURS_VIEW) return getMe(context)
  if (view > NEIGHBOURS_VIEW) return (view - NEIGHBOURS_VIEW) as PlayerColor
  return getViewedPlayer(context)
}

/**
 * Kingdoms displayed in the neighbours view, from left to right, around the displayed player
 */
export const getWarPlayers = (context: MaterialContext): PlayerColor[] => {
  const center = getWarCenter(context)
  const left = getLeftNeighbour(context, center)
  const right = getRightNeighbour(context, center)
  return left === right ? [center, left] : [left, center, right]
}

export const isKingdomDisplayed = (context: MaterialContext, player?: number) =>
  isWarView(context) ? getWarPlayers(context).includes(player as PlayerColor) : player === getViewedPlayer(context)

export const isBuildingsDisplayed = (context: MaterialContext, player?: number) => !isWarView(context) && player === getViewedPlayer(context)

/**
 * My hands and gold are displayed only in my area
 */
/**
 * The area of a player (hands, gold) is displayed with their kingdom: mine, or the one I look at. The hands of the
 * others are face down (rulebook p.5), which still tells how many cards they hold.
 */
export const isAreaDisplayed = (context: MaterialContext, player?: number) => !isWarView(context) && getViewedPlayer(context) === player

export const isMyAreaDisplayed = (context: MaterialContext, player?: number) =>
  player === getMe(context) && !isWarView(context) && getViewedPlayer(context) === player

export const isBuildRule = (context: MaterialContext) => context.rules.game.rule?.id === RuleId.Build

export const isDraftRule = (context: MaterialContext) => [RuleId.GiveDraftToNeighbor, RuleId.Draft, RuleId.Deal].includes(context.rules.game.rule?.id as RuleId)

export const getPlayerPositionDependencies = (context: MaterialContext) => ({
  view: getViewedPlayer(context),
  war: isWarView(context),
  draft: isKeptHandAside(context)
})

/**
 * The kept hand stands at the right of the draft fan during the recruitment, and until the last card of the recruitment
 * has reached the hand: the move of that card then carries the hand to its deployment place, and the framework animates
 * the slide with it
 */
const isKeptHandAside = (context: MaterialContext) =>
  isDraftRule(context) ||
  (context.rules.game.rule?.id === RuleId.PlaceUnitOnBoard &&
    context.rules.material(MaterialType.Unit).location(LocationType.DraftTransit).player(getViewedPlayer(context)).length > 0)

export const getKingdomScale = (context: MaterialContext, player?: number) => {
  if (!isWarView(context)) return 1
  return getPlayerWarSeat(context, player).scale
}

/**
 * Kingdom slots: front row (y = 0) on top, the 5th slot (x = 2, unlocked by a level 2 building) on the right of the
 * front row (rulebook p.8)
 */
export const getKingdomSlotCoordinates = (context: MaterialContext, player: number | undefined, x: number, y: number): XYCoordinates => {
  const localX = x * KINGDOM_COLUMN + unitCardDescription.width / 2
  const localY = y * KINGDOM_ROW + unitCardDescription.height / 2
  if (!isWarView(context)) return { x: AREA_X + localX, y: AREA_Y + localY }
  const seat = getPlayerWarSeat(context, player)
  return { x: seat.kingdomX + localX * seat.scale, y: seat.y + localY * seat.scale }
}

/** The buildings of the game, the same for every Monarch (5, or 7 with the expansions), in the order of the enum */
const getGameBuildings = (context: MaterialContext): Building[] =>
  uniq(context.rules.material(MaterialType.Building).getItems<Building>().map((building) => building.id)).sort((a, b) => a - b)

/**
 * The grid of the buildings at the right of the kingdom: 2 columns for the 5 buildings of the base game, as high as the
 * kingdom; 3 columns of smaller cards for the 7 of the expansions, so that they stay above the hands
 */
const getBuildingGrid = (context: MaterialContext) => (getGameBuildings(context).length > 6 ? { scale: 0.68, columns: 3 } : { scale: 0.85, columns: 2 })

export const getBuildingScale = (context: MaterialContext) => getBuildingGrid(context).scale

/** Under the grid of the buildings, centred on it, where the table is free: the receipt of my income (see IncomeGains) */
export const getIncomeGainsPosition = (context: MaterialContext): XYCoordinates => {
  const { scale, columns } = getBuildingGrid(context)
  const width = buildingCardDescription.width * scale
  const height = buildingCardDescription.height * scale
  const rows = Math.ceil(getGameBuildings(context).length / columns)
  return {
    x: BUILDINGS_X + (columns * width + (columns - 1) * BUILDING_COLUMN_GAP) / 2,
    y: AREA_Y + rows * height + (rows - 1) * BUILDING_ROW_GAP + 1.5
  }
}

/** A hovered building of the grid is drawn at this size, whatever the grid: the zoom makes up for the smaller cards of 7 buildings */
const HOVERED_BUILDING_SIZE = 0.85 * 1.8

export const getBuildingHoverZoom = (context: MaterialContext) => HOVERED_BUILDING_SIZE / getBuildingScale(context)

/**
 * Every building has a fixed slot in the grid, built or not
 */
export const getBuildingSlotCoordinates = (context: MaterialContext, building: Building): Coordinates => {
  const { scale, columns } = getBuildingGrid(context)
  const index = getGameBuildings(context).indexOf(building)
  const width = buildingCardDescription.width * scale
  const height = buildingCardDescription.height * scale
  return {
    x: BUILDINGS_X + width / 2 + (index % columns) * (width + BUILDING_COLUMN_GAP),
    y: AREA_Y + height / 2 + Math.floor(index / columns) * (height + BUILDING_ROW_GAP),
    // Each building at its own height, so that a hovered one is not drawn under its neighbours at the same depth
    z: 0.1 + index * 0.1
  }
}

/** What forges legends is played: its Legendary Artifacts are in the deck */
export const hasArtifacts = (context: MaterialContext) => !!getOptions(context)?.whatForgesLegends

export const getOptions = (context: MaterialContext) => context.rules.game.options as PaperTalesOptions | undefined

/** An expansion is played: its rules can be read */
export const hasExpansion = (context: MaterialContext) => {
  const options = getOptions(context)
  return !!(options?.beyondTheGatesUnits || options?.beyondTheGatesBuildings || options?.whatForgesLegends)
}

/**
 * The Legendary Artifacts of a Monarch, apart from the units (rulebook p.11): in the row of the last building of the grid,
 * in the 2 cells it leaves empty (What forges legends always gives 7 buildings), as high as a building
 */
export const getArtifactsZone = (context: MaterialContext) => {
  const scale = getBuildingScale(context)
  const width = buildingCardDescription.width * scale
  const height = buildingCardDescription.height * scale
  return {
    x: BUILDINGS_X + width + BUILDING_COLUMN_GAP,
    y: AREA_Y + 2 * (height + BUILDING_ROW_GAP),
    width: 2 * width + BUILDING_COLUMN_GAP,
    height,
    /** The scale of an artifact card, as high as the zone */
    scale: height / unitCardDescription.height
  }
}

const ARTIFACTS_GAP = 0.4

/** An artifact in the zone, in the order they were put into play: side by side, overlapping when they are many */
export const getArtifactCoordinates = (context: MaterialContext, index: number, count: number): Coordinates => {
  const zone = getArtifactsZone(context)
  const width = unitCardDescription.width * zone.scale
  const step = count <= 1 ? 0 : Math.min(width + ARTIFACTS_GAP, (zone.width - width) / (count - 1))
  return { x: zone.x + width / 2 + index * step, y: zone.y + zone.height / 2, z: 0.1 + index * 0.1 }
}

/**
 * My kept cards: at the right of the draft fan during the recruitment, in its place otherwise
 */
export const getKeptHandCoordinates = (context: MaterialContext) => ({
  x: isKeptHandAside(context) ? KEPT_HAND_X : context.rules.game.rule?.id === RuleId.PlaceUnitOnBoard ? AREA_X + 26 : draftHandCoordinates.x,
  y: HANDS_Y
})

export const scaleTransform = (scale: number) => (scale === 1 ? [] : [`scale(${scale})`])

/**
 * Absolute position of a React element laid on the table, in em from its top left corner
 */
export const tablePosition = ({ x, y }: XYCoordinates) => ({ left: `${x - tableBoundaries.xMin}em`, top: `${y - tableBoundaries.yMin}em` })

/**
 * Panels order: the seating order, starting from my right neighbour, so that the column reads the round of the table
 * from top to bottom (my right neighbour above me, my left neighbour below me, then the others) and back to the top
 */
export const getPanelsOrder = (context: MaterialContext): PlayerColor[] => {
  const players = context.rules.players
  const me = getMe(context)
  if (players.length === 2) return [me, getLeftNeighbour(context)]
  const order = [getRightNeighbour(context), me, getLeftNeighbour(context)]
  for (let offset = 2; offset <= players.length - 2; offset++) order.push(getPlayerAt(context, me, offset))
  return order
}

export const getPanelPosition = (index: number) => ({ x: PANEL_X, y: PANEL_Y + index * PANEL_STEP + (index >= 3 ? PANELS_GROUP_GAP : 0) })

/** The size of the material of a hidden area on its Monarch's panel, see {@link getPanelTransform} */
export const HIDDEN_HAND_SCALE = 0.3
/** The largest side of an item of a hidden area on its Monarch's panel, in em: a unit card at HIDDEN_HAND_SCALE */
const PANEL_ITEM_SIZE = 14 * HIDDEN_HAND_SCALE
/** The size of a coin or a token on a panel, in em */
const PANEL_DISC_SIZE = 1.2

/**
 * Where the material of a Monarch's area that is not displayed stands: small, on their panel. It is never shown at rest
 * (the locators hide it), only while it moves: what leaves a hidden area comes out of the panel, what goes into it flies
 * into the panel. Undefined when the Monarch has no panel.
 */
export const getPanelTransform = (context: MaterialContext, player: number | undefined, size: number): string[] | undefined => {
  if (player === undefined) return undefined
  const center = getPanelCenter(context, player)
  if (!center) return undefined
  // A card shrinks to a small card on the panel, a coin or a token to a small disc: neither vanishes nor covers the panel
  const scale = Math.min(1, (size > 4 ? PANEL_ITEM_SIZE : PANEL_DISC_SIZE) / size)
  return [`translate3d(${center.x}em, ${center.y}em, ${center.z}em)`, ...(scale < 1 ? [`scale(${scale.toFixed(3)})`] : [])]
}

/** The centre of a Monarch's panel, in table coordinates, just over the panels (laid 10em high, see TableAnchor) */
export const getPanelCenter = (context: MaterialContext, player: number) => {
  const index = getPanelsOrder(context).indexOf(player)
  if (index === -1) return undefined
  const { x, y } = getPanelPosition(index)
  return { x: x + PANEL_WIDTH / 2, y: y + PANEL_HEIGHT / 2, z: 12 }
}

/** Who gives their hand to this Monarch during the recruitment of this round: the inverse of {@link getDraftRecipient} */
export const getDraftGiver = (context: MaterialContext, player = getMe(context)) =>
  getRound(context) % 2 === 1 ? getRightNeighbour(context, player) : getLeftNeighbour(context, player)

/**
 * The draft goes to the left on rounds 1 and 3, to the right on rounds 2 and 4 (rulebook p.5)
 */
export const getRound = (context: MaterialContext) => context.rules.remind<number>(Memory.Time) ?? 1

export const getDraftRecipient = (context: MaterialContext, player = getMe(context)) =>
  getRound(context) % 2 === 1 ? getLeftNeighbour(context, player) : getRightNeighbour(context, player)

/**
 * Neighbours view: the built buildings of a kingdom, at its right, at the same scale as its units, cascaded so that
 * every name banner shows (the hover lifts the card to read it)
 */
// The column takes the height of the kingdom: the cards do not overlap while they fit, then cascade by their name banner
const WAR_BUILDING_GAP = 0.4
const WAR_BUILDING_MIN_STEP = 3.2
export const getWarBuildingCoordinates = (context: MaterialContext, player: number | undefined, index: number): Coordinates => {
  const seat = getPlayerWarSeat(context, player)
  const count = context.rules.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(player).length
  const fullStep = buildingCardDescription.height + WAR_BUILDING_GAP
  const available = KINGDOM_HEIGHT - buildingCardDescription.height
  const step = count <= 1 ? fullStep : Math.max(WAR_BUILDING_MIN_STEP, Math.min(fullStep, available / (count - 1)))
  return {
    x: seat.buildingsX + (buildingCardDescription.width / 2) * seat.scale,
    y: seat.y + (buildingCardDescription.height / 2 + index * step) * seat.scale,
    z: 0.2 + index * 0.1
  }
}

/** Neighbours view: the war Artifacts of a kingdom, in a column at the right of its buildings, cascaded the same way */
export const getWarArtifactCoordinates = (context: MaterialContext, player: number | undefined, index: number, count: number): Coordinates => {
  const seat = getPlayerWarSeat(context, player)
  const { width, height } = unitCardDescription
  const fullStep = height + WAR_BUILDING_GAP
  const step = count <= 1 ? fullStep : Math.max(WAR_BUILDING_MIN_STEP, Math.min(fullStep, (KINGDOM_HEIGHT - height) / (count - 1)))
  return { x: seat.artifactsX + (width / 2) * seat.scale, y: seat.y + (height / 2 + index * step) * seat.scale, z: 0.2 + index * 0.1 }
}

/**
 * Hover: the framework zooms a card around its center, so a card near an edge of the table would go out of it. This
 * shifts the zoomed card towards the inside of the table, from the card's own position.
 */
type HoverShiftOptions = {
  /** Center of the card on the table, in em */
  x: number
  y: number
  /** Size of the card as drawn on the table (its own scale applied), in em */
  width: number
  height: number
  /** Zoom of the hover */
  zoom: number
}

const HOVER_MARGIN = 0.5

export const getHoverShift = ({ x, y, width, height, zoom }: HoverShiftOptions): string[] => {
  const shifts: string[] = []
  const zoomedWidth = width * zoom
  const zoomedHeight = height * zoom
  // How far the zoomed card goes past each edge of the table, and the shift that brings it back, in % of the zoomed card
  const overflow = (past: number, size: number) => (past > 0 ? ((past + HOVER_MARGIN) / size) * 100 : 0)
  const left = overflow(tableBoundaries.xMin - (x - zoomedWidth / 2), zoomedWidth)
  const right = overflow(x + zoomedWidth / 2 - tableBoundaries.xMax, zoomedWidth)
  if (left) shifts.push(`translateX(${left.toFixed(1)}%)`)
  else if (right) shifts.push(`translateX(-${right.toFixed(1)}%)`)
  const top = overflow(tableBoundaries.yMin - (y - zoomedHeight / 2), zoomedHeight)
  const bottom = overflow(y + zoomedHeight / 2 - tableBoundaries.yMax, zoomedHeight)
  if (top) shifts.push(`translateY(${top.toFixed(1)}%)`)
  else if (bottom) shifts.push(`translateY(-${bottom.toFixed(1)}%)`)
  return shifts
}
