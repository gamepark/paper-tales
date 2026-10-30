import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War, WarStrengths } from '@gamepark/paper-tales/rules/3_War/War'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialContext, PlayMoveButton, useMaterialContext, usePlayerName } from '@gamepark/react-game'
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
import { beatCss, STRENGTHS_AT, useWarReplays, useWarsTold } from './warPace'

/**
 * In the neighbours view, under each kingdom: the Monarch's name in their colour and the strength of their front row
 * (plus ranged units, rulebook p.6). The central kingdom is the one displayed, in a larger ribbon. Once the wars are
 * fought, their outcome is told in banners beside (see WarResults). A click on a ribbon opens the kingdom of that Monarch,
 * as the eye of their panel does.
 */
export const WarInfo: FC = () => {
  const context = useMaterialContext()
  if (!isWarView(context)) return null
  const war = new War(context.rules.game)
  // Once the wars are fought, the strengths they were fought with: a building built since changes the kingdom, not the wars
  const fought = areWarsFought(context) ? context.rules.remind<WarStrengths | undefined>(Memory.WarStrengths) : undefined
  const players = getWarPlayers(context)
  const center = players.length === 3 ? players[1] : players[0]
  return (
    <>
      {players.map((player, index) => (
        <WarKingdomInfo key={player} player={player} index={index} count={players.length} power={fought?.[player] ?? war.getPlayerPower(player)} central={player === center} me={player === getMe(context)} />
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

type WarKingdomInfoProps = {
  player: PlayerColor
  index: number
  count: number
  power: number
  central: boolean
  me: boolean
}

const WarKingdomInfo: FC<WarKingdomInfoProps> = ({ player, index, count, power, central, me }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const name = usePlayerName(player)
  const told = useWarsTold(context)
  const replays = useWarReplays()
  const position = getWarRibbonPosition(context, index, count)
  // A neighbour's ribbon centres the war view on them, with their own neighbours; the central one opens their kingdom
  const move = central ? viewMove(context, player) : viewMove(context, getNeighboursView(context, player))
  const title = central
    ? t('panel.view', { defaultValue: 'View the kingdom of {player}', player: name })
    : t('view.player.neighbours', { defaultValue: 'Neighbours of {player}', player: name })
  return (
    <TableAnchor position={position}>
      <PlayMoveButton
        key={told ? replays : -1}
        css={[tagPaperCss, colorStripCss(getColor(player).substring(0, 7)), infoCss, position.beside && besideCss, central && centralCss, ribbonButtonCss, told && strengthsBeatCss]}
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
    </TableAnchor>
  )
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
  transform: translateX(-50%);
  gap: 0.8em;
  font-size: 1.1em;
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
