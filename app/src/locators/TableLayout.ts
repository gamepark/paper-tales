import { Building, buildings } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialContext } from '@gamepark/react-game'
import { Coordinates, XYCoordinates } from '@gamepark/rules-api'
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
 * building is in play), a fixed grid of the 5 buildings at its right (greyed out until built), and, in my area only, my
 * hands and my gold below the kingdom.
 */

// Ratio 2.1: between a desktop (16:9 minus the header, about 1.9) and a phone in landscape (2.16 to 2.22)
export const tableBoundaries = { xMin: 0, xMax: 100, yMin: 0, yMax: 47.5 }

// Panels column: the eye tab sticks out at the right of each panel
export const PANEL_X = 0.8
export const PANEL_WIDTH = 16
export const PANEL_HEIGHT = 5.4
export const PANEL_Y = 0.8
export const PANEL_STEP = 5.9
// My neighbours and I are the 3 first panels, a little apart from the others
const PANELS_GROUP_GAP = 1

// Player area
const AREA_X = PANEL_X + PANEL_WIDTH + 3.8
const AREA_Y = 0.8
const KINGDOM_COLUMN = unitCardDescription.width + 0.5
const KINGDOM_ROW = unitCardDescription.height + 0.5
export const KINGDOM_WIDTH = KINGDOM_COLUMN * 3 - 0.5
export const KINGDOM_HEIGHT = KINGDOM_ROW * 2 - 0.5
export const BUILDING_SCALE = 0.85
const BUILDINGS_X = AREA_X + KINGDOM_WIDTH + 2.4
const BUILDING_COLUMN = buildingCardDescription.width * BUILDING_SCALE + 1
const BUILDING_ROW = buildingCardDescription.height * BUILDING_SCALE + 0.9
export const AREA_RIGHT = BUILDINGS_X + BUILDING_COLUMN * 2 - 1
const HANDS_Y = AREA_Y + KINGDOM_HEIGHT + 2.8 + unitCardDescription.height / 2
// Hands row under the kingdom: the draft fan at the left, the kept hand at its right (deployment: the whole hand there)
// The fan of 5 to 9 cards spreads to its left: centred far enough from the panels that its first card stays clear of them
export const draftHandCoordinates = { x: AREA_X + 19, y: HANDS_Y }
// With 2 players, only 2 panels at the top: the fan of 9 cards spreads to the left under them, up to the kept cards
export const twoPlayersDraftHandCoordinates = { x: AREA_X + 17.7, y: HANDS_Y }
// During the recruitment, the kept cards pile up towards the discard, clear of the widest fan (9 cards at 2 players)
const KEPT_HAND_X = AREA_X + 59
export const playerGoldCoordinates = { x: 93.5, y: 44.8 }
// Centered above the draft fan (the ribbon is translated by half its width)
export const handsLabelPosition = { x: draftHandCoordinates.x, y: AREA_Y + KINGDOM_HEIGHT + 0.5 }
export const deployGoldPosition = { x: BUILDINGS_X, y: AREA_Y + BUILDING_ROW * 3 }
export const buildInfoPosition = { x: BUILDINGS_X, y: AREA_Y + BUILDING_ROW * 3 }

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
export const ageStockCoordinates = { x: SIDE_X + 2.9, y: RESERVES_Y }

// Neighbours view, laid out like the seats around the table: my 2 neighbours at the top (left and right), the central
// player at the bottom, larger. Nothing else is drawn in the area in this view, so it spans up to the side column.
const WAR_RIGHT = 86.5
const WAR_CENTER_X = AREA_X + (WAR_RIGHT - AREA_X) / 2
const NEIGHBOUR_SCALE = 0.63
const CENTER_SCALE = 0.76
const WAR_TOP_Y = AREA_Y
// The central kingdom right under the neighbours row: their ribbons (about 2.5 em) plus a clear gap of 1.5 em.
// Its own ribbon stands at its left, in the room under my left neighbour, so that it takes no height.
const WAR_BOTTOM_Y = WAR_TOP_Y + KINGDOM_HEIGHT * NEIGHBOUR_SCALE + 1.4 + 2.6 + 1.5
/**
 * A seat of the neighbours view: the kingdom, and a column of its built buildings at its right, like in a player area.
 * Local coordinates are scaled.
 */
type WarSeat = { kingdomX: number; buildingsX: number; y: number; scale: number }
const WAR_BUILDINGS_GAP = 1
const WAR_SEAT_WIDTH = KINGDOM_WIDTH + WAR_BUILDINGS_GAP + buildingCardDescription.width
const getWarSeat = (index: number, count: number): WarSeat => {
  const right = (x: number, scale: number) => ({ kingdomX: x, buildingsX: x + (KINGDOM_WIDTH + WAR_BUILDINGS_GAP) * scale, scale })
  if (count === 2)
    return index === 0
      ? { ...right(AREA_X + 1, CENTER_SCALE), y: AREA_Y + 2 }
      : { ...right(WAR_RIGHT - WAR_SEAT_WIDTH * CENTER_SCALE - 1, CENTER_SCALE), y: AREA_Y + 2 }
  if (index === 0) return { ...right(AREA_X, NEIGHBOUR_SCALE), y: WAR_TOP_Y }
  if (index === 2) return { ...right(WAR_RIGHT - WAR_SEAT_WIDTH * NEIGHBOUR_SCALE, NEIGHBOUR_SCALE), y: WAR_TOP_Y }
  return { ...right(WAR_CENTER_X - (WAR_SEAT_WIDTH * CENTER_SCALE) / 2, CENTER_SCALE), y: WAR_BOTTOM_Y }
}
/**
 * Where the ribbon of a kingdom of the neighbours view stands: centered under the seat (kingdom and buildings column,
 * so that it does not read as the caption of the buildings), or for the central kingdom of 3, at its left against its
 * bottom edge (beside: the anchor is the ribbon's bottom right corner).
 */
export const getWarRibbonPosition = (index: number, count: number) => {
  const seat = getWarSeat(index, count)
  if (count === 3 && index === 1) return { x: seat.kingdomX - 1, y: seat.y + KINGDOM_HEIGHT * seat.scale, beside: true }
  return { x: seat.kingdomX + (WAR_SEAT_WIDTH * seat.scale) / 2, y: seat.y + KINGDOM_HEIGHT * seat.scale + 1.4, beside: false }
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
 * Player whose area is displayed: chosen with a transient changeView, me by default
 */
export const getViewedPlayer = (context: MaterialContext): PlayerColor => {
  const view = context.rules.game.view as PlayerColor | undefined
  return view !== undefined && context.rules.players.includes(view) ? view : getMe(context)
}

/**
 * View flag that lays the displayed player's 2 neighbours on each side of them. War resolves at once (War.onRuleStart),
 * so the view is also displayed automatically from the reveal to the war, long enough to see the new units.
 */
export const NEIGHBOURS_VIEW = 100
// ChooseWherePlacingAgeToken is left out: the Monarch who chooses needs their own kingdom in front of them
// From the reveal to the income, all automatic: the neighbours view stays, so that the outcome of the wars can be read
const warRules = [RuleId.RevealBoards, RuleId.PayDeployedUnits, RuleId.DeployEffects, RuleId.War, RuleId.Income]

/**
 * The view of the neighbours of a player: NEIGHBOURS_VIEW for mine, NEIGHBOURS_VIEW + the player for anybody's (a
 * spectator, or a Monarch looking at another kingdom, can look at its neighbours too)
 */
export const getNeighboursView = (context: MaterialContext, player: PlayerColor) =>
  player === getMe(context) && !isSpectator(context) ? NEIGHBOURS_VIEW : NEIGHBOURS_VIEW + player

const isNeighboursView = (context: MaterialContext) => (context.rules.game.view ?? 0) >= NEIGHBOURS_VIEW

export const isWarView = (context: MaterialContext) => isNeighboursView(context) || warRules.includes(context.rules.game.rule?.id as RuleId)

/**
 * The player in the middle of the neighbours view: the one whose neighbours were asked for, else the displayed player
 * (the automatic view of the wars)
 */
export const getWarCenter = (context: MaterialContext): PlayerColor => {
  const view = context.rules.game.view ?? 0
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
  draft: isDraftRule(context)
})

export const getKingdomScale = (context: MaterialContext, player?: number) => {
  if (!isWarView(context)) return 1
  const players = getWarPlayers(context)
  return getWarSeat(Math.max(0, players.indexOf(player as PlayerColor)), players.length).scale
}

/**
 * Kingdom slots: front row (y = 0) on top, the 5th slot (x = 2, unlocked by a level 2 building) on the right of the
 * front row (rulebook p.8)
 */
export const getKingdomSlotCoordinates = (context: MaterialContext, player: number | undefined, x: number, y: number): XYCoordinates => {
  const localX = x * KINGDOM_COLUMN + unitCardDescription.width / 2
  const localY = y * KINGDOM_ROW + unitCardDescription.height / 2
  if (!isWarView(context)) return { x: AREA_X + localX, y: AREA_Y + localY }
  const players = getWarPlayers(context)
  const seat = getWarSeat(Math.max(0, players.indexOf(player as PlayerColor)), players.length)
  return { x: seat.kingdomX + localX * seat.scale, y: seat.y + localY * seat.scale }
}

/**
 * Every building has a fixed slot in a grid of 2 columns, built or not
 */
export const getBuildingSlotCoordinates = (building: Building): Coordinates => {
  const index = buildings.indexOf(building)
  return {
    x: BUILDINGS_X + (buildingCardDescription.width * BUILDING_SCALE) / 2 + (index % 2) * BUILDING_COLUMN,
    y: AREA_Y + (buildingCardDescription.height * BUILDING_SCALE) / 2 + Math.floor(index / 2) * BUILDING_ROW,
    // Each building at its own height, so that a hovered one is not drawn under its neighbours at the same depth
    z: 0.1 + index * 0.1
  }
}

/**
 * My kept cards: at the right of the draft fan during the recruitment, in its place otherwise
 */
export const getKeptHandCoordinates = (context: MaterialContext) => ({
  x: isDraftRule(context) ? KEPT_HAND_X : context.rules.game.rule?.id === RuleId.PlaceUnitOnBoard ? AREA_X + 26 : draftHandCoordinates.x,
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
  const players = getWarPlayers(context)
  const seat = getWarSeat(Math.max(0, players.indexOf(player as PlayerColor)), players.length)
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
