import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War, WarStrengths } from '@gamepark/paper-tales/rules/3_War/War'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialContext, PlayMoveButton, useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { XYCoordinates } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import shield from '../images/tokens/bouclier_rouge.png'
import {
  areWarsFought,
  getKingdomScale,
  getKingdomSlotCoordinates,
  getMe,
  getNeighboursView,
  getWarPlayers,
  getNeighbourJunction,
  getWarRibbonPosition,
  isWarView,
  viewMove,
  getWarSeparator
} from '../locators/TableLayout'
import { unitCardDescription } from '../material/UnitCardDescription'
import { fightsFromBackRow } from '../material/fightsFromBackRow'
import { colorStripCss, ochre, paper, paperBackgroundCss, paperButtonResetCss, rust, tagPaperCss } from '../theme/tableTheme'
import { getColor } from '../utils/color'
import { Sash } from './Sash'
import { TableAnchor } from './TableAnchor'
import { WarDuel } from './WarDuel'
import { beatCss, STRENGTHS_AT, useWarBeat, useWarReplays, useWarsTold, WarBeat } from './warPace'

/**
 * In the neighbours view, under each kingdom: the Monarch's name in their colour and the strength of their front row
 * (plus ranged units, rulebook p.6). The central kingdom is the one displayed, in a larger ribbon; my neighbours have
 * theirs at the outer ends of the view, and each one becomes the duel once their war is fought (see WarDuel). A click on
 * a ribbon opens the kingdom of that Monarch, as the eye of their panel does.
 */
export const WarInfo: FC = () => {
  const context = useMaterialContext()
  if (!isWarView(context)) return null
  const war = new War(context.rules.game)
  // Once the wars are fought, the strengths they were fought with: a building built since changes the kingdom, not the wars
  const fought = areWarsFought(context) ? context.rules.remind<WarStrengths | undefined>(Memory.WarStrengths) : undefined
  const players = getWarPlayers(context)
  const center = players.length === 3 ? players[1] : players[0]
  const powerOf = (player: PlayerColor) => fought?.[player] ?? war.getPlayerPower(player)
  const neighbours = players.filter((player) => player !== center)
  return (
    <>
      <WarKingdomInfo
        player={center}
        position={getWarRibbonPosition(context, players.indexOf(center), players.length)}
        power={powerOf(center)}
        central
        me={center === getMe(context)}
      />
      {neighbours.map((player, order) => (
        <NeighbourSeat
          key={player}
          player={player}
          order={order}
          center={center}
          index={players.indexOf(player)}
          count={players.length}
          power={powerOf(player)}
          centerPower={powerOf(center)}
          fought={!!fought}
        />
      ))}
      {players.map((player) => (
        <BackRowStamp key={player} player={player} />
      ))}
      {players.length === 3 && <NeighboursSeparator />}
    </>
  )
}

/**
 * The back row of a kingdom does not fight (rulebook p.6): a "Not fighting" band across its spaces, but the ones of the
 * units that fight from there (the ranged units)
 */
const BackRowStamp: FC<{ player: PlayerColor }> = ({ player }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const backRow = context.rules.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).location((location) => location.y === 1)
  const columns = [0, 1].filter((x) => !backRow.filter((item) => item.location.x === x).getItems().some(fightsFromBackRow))
  if (!columns.length) return null
  const scale = getKingdomScale(context, player)
  const width = unitCardDescription.width * scale
  const height = unitCardDescription.height * scale
  const slots = columns.map((x) => getKingdomSlotCoordinates(context, player, x, 1))
  const left = Math.min(...slots.map((slot) => slot.x)) - width / 2
  const right = Math.max(...slots.map((slot) => slot.x)) + width / 2
  const rect = { x: left, y: slots[0].y - height / 2, width: right - left, height }
  return <Sash rect={rect} label={t('war.back-row', 'Not fighting')} scale={scale * 1.15} angle={-6} />
}

/** A cut line between my 2 neighbours at the top: each half of the view holds one of them, its ribbon and its war */
const NeighboursSeparator: FC = () => {
  const context = useMaterialContext()
  const { x, y, height } = getWarSeparator(context)
  return <TableAnchor position={{ x, y }} css={separatorCss} style={{ height: `${height}em` }} />
}

const separatorCss = css`
  border-left: 0.15em dashed ${paper}66;
`

type NeighbourSeatProps = {
  player: PlayerColor
  /** The first neighbour, whose war is told first, or the second one */
  order: number
  center: PlayerColor
  /** The place of the neighbour in the view, and the number of kingdoms in it */
  index: number
  count: number
  power: number
  centerPower: number
  fought: boolean
}

/**
 * A neighbour of the central kingdom: their ribbon, and the duel of their war once it is fought. While the wars are told,
 * the duel comes in at the beat of that war (see warPace): the seat starts again with the wars.
 */
const NeighbourSeat: FC<NeighbourSeatProps> = (props) => {
  const context = useMaterialContext()
  const told = useWarsTold(context)
  const replays = useWarReplays()
  return <NeighbourSeatBeats key={told ? replays : -1} told={told} {...props} />
}

const NeighbourSeatBeats: FC<NeighbourSeatProps & { told: boolean }> = ({ player, order, center, index, count, power, centerPower, fought, told }) => {
  const context = useMaterialContext()
  const beat = useWarBeat()
  const shown = fought && (!told || beat >= (order === 0 ? WarBeat.FirstWar : WarBeat.SecondWar))
  const position = getWarRibbonPosition(context, index, count)
  // With 2 kingdoms, under the neighbour's kingdom, the duel takes the place of the ribbon
  if (count === 2) {
    return shown ? (
      <WarDuel position={position} neighbour={player} center={center} neighbourStrength={power} centerStrength={centerPower} arriving={told} />
    ) : (
      <WarKingdomInfo player={player} position={position} power={power} central={false} me={false} />
    )
  }
  // With 3, the ribbon stays towards the middle of the view, the duel comes beside it, towards the outer end
  const left = index === 0
  return (
    <TableAnchor position={getNeighbourJunction(context, index)} css={[seatCss, !left && rightSeatCss]}>
      <WarKingdomInfo player={player} position={position} power={power} central={false} me={false} inline />
      {shown && (
        <span css={[duelPlaceCss, left ? duelLeftCss : duelRightCss]}>
          <WarDuel position={position} neighbour={player} center={center} neighbourStrength={power} centerStrength={centerPower} arriving={told} inline />
        </span>
      )}
    </TableAnchor>
  )
}

/** The ribbon, from the junction towards the middle of the view: the left neighbour's starts there, the right one's ends there */
const seatCss = css`
  position: relative;
`

const rightSeatCss = css`
  transform: translateX(-100%);
`

/** The duel beside the ribbon, towards the outer end, their middles on one line */
const duelPlaceCss = css`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
`

const duelLeftCss = css`
  right: calc(100% + 0.5em);
`

const duelRightCss = css`
  left: calc(100% + 0.5em);
`

type WarKingdomInfoProps = {
  player: PlayerColor
  position: XYCoordinates & { beside?: boolean }
  power: number
  central: boolean
  me: boolean
  /** Laid by its container (beside the duel), not anchored on the table by itself */
  inline?: boolean
}

const WarKingdomInfo: FC<WarKingdomInfoProps> = ({ player, position, power, central, me, inline }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const name = usePlayerName(player)
  const told = useWarsTold(context)
  const replays = useWarReplays()
  // A neighbour's ribbon centres the war view on them, with their own neighbours; the central one opens their kingdom
  const move = central ? viewMove(context, player) : viewMove(context, getNeighboursView(context, player))
  const title = central
    ? t('panel.view', { defaultValue: 'View the kingdom of {player}', player: name })
    : t('view.player.neighbours', { defaultValue: 'Neighbours of {player}', player: name })
  const ribbon = (
      <PlayMoveButton
        key={told ? replays : -1}
        css={[tagPaperCss, colorStripCss(getColor(player).substring(0, 7)), infoCss, !inline && centredCss, position.beside && besideCss, central && centralCss, ribbonButtonCss, told && strengthsBeatCss]}
        move={move}
        transient
        title={title}
      >
        <span>{me ? t('war.you', 'You') : name}</span>
        {!isRevealing(context) && (
          <span css={[powerCss, told && beatCss(STRENGTHS_AT)]}>
            <img src={shield} alt="" />
            {power}
          </span>
        )}
      </PlayMoveButton>
  )
  return inline ? ribbon : <TableAnchor position={position}>{ribbon}</TableAnchor>
}

/**
 * From the reveal to the wars, the kingdoms change (the new units, their deployment effects): their strengths are told
 * once the wars start, as their first beat
 */
const isRevealing = (context: MaterialContext) =>
  [RuleId.RevealBoards, RuleId.PayDeployedUnits, RuleId.DeployEffects].includes(context.rules.game.rule?.id as RuleId)

/** The first beat of the wars: the ribbons light up while their strengths come in, before the first war is told */
const glow = `0 0 0 0.2em ${ochre}, 0 0 1em 0.3em ${ochre}aa`
const strengthsGlow = keyframes`
  0% { box-shadow: none; scale: 1; }
  20% { box-shadow: ${glow}; scale: 1.08; }
  40% { scale: 1; }
  60% { scale: 1.08; }
  80% { box-shadow: ${glow}; scale: 1; }
  100% { box-shadow: none; scale: 1; }
`
const strengthsBeatCss = css`
  animation: ${strengthsGlow} 1.4s ease-in-out ${STRENGTHS_AT}s both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

/** The ribbon is a button: it lifts a little under the pointer */
const ribbonButtonCss = css`
  ${paperButtonResetCss};
  transition: translate 0.15s;

  &:hover {
    translate: -0.05em -0.08em;
  }
`

const infoCss = css`
  gap: 0.8em;
  font-size: 1.1em;
`

const centredCss = css`
  transform: translateX(-50%);
`

// Beside the kingdom: anchored by its bottom right corner
const besideCss = css`
  transform: translate(-100%, -100%);
`

// The kingdom at the centre of the view, larger and on rust paper
const centralCss = css`
  font-size: 1.35em;
  ${paperBackgroundCss(rust, paper)};
`

const powerCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.25em;

  img {
    height: 1.3em;
  }
`
