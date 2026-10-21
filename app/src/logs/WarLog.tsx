import { css } from '@emotion/react'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War, warsWonAgainst, WarStrengths } from '@gamepark/paper-tales/rules/3_War/War'
import { CustomMoveType } from '@gamepark/paper-tales/rules/CustomMoveType'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { Avatar, MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { CustomMove, isCustomMoveType, isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { GoldValueIcon, LegendValueIcon, StrengthIcon } from '../material/help/book/HelpIcons'
import { rust } from '../theme/tableTheme'
import { inkOf } from '../utils/color'
import { goldGainedIn, LogContext, nextMovesUntil, scoreChange } from './logHelpers'
import { whoAvatarCss, whoNameCss } from './logs.css'

/** The Legend points of each war won (rulebook p.6) */
const POINTS_PER_WAR = 3

/**
 * The wars of a Monarch, on their own slip, read on the game before they earn anything: their strength, their war
 * against each neighbour (won on a tie; at 2 players, a double strength wins two wars, p.8) with the neighbour's
 * strength, and what they earn, the Legend points with the part of the effects that score at the wars, and the gold
 * of the effects "for each war won". The strengths are the ones memorized when the wars were fought.
 */
export const WarOutcomeLog: FC<MaterialLogProps<CustomMove<PlayerColor>>> = ({ move, context }) => {
  const { t } = useTranslation()
  const player = move.data
  const name = usePlayerName(player)
  const rules = new PaperTalesRules(context.game)
  const strengths = rules.remind<WarStrengths>(Memory.WarStrengths)
  const strengthOf = (monarch: PlayerColor) => strengths[monarch] ?? 0
  const players = rules.players
  const index = players.indexOf(player)
  const war = new War(context.game)
  const twoPlayers = players.length === 2
  const neighbours = twoPlayers ? [players[1 - index]] : [players[war.getNeighbor(players, index, 'left')], players[war.getNeighbor(players, index, 'right')]]
  const wars = war.getWarsWon(player)
  const earned = earnings(player, context)
  const byEffects = earned.points - wars * POINTS_PER_WAR
  const color = inkOf(player)
  return (
    <span css={slipCss}>
      <Avatar playerId={player} css={[whoAvatarCss(color), avatarCss]} />
      <span css={topCss}>
        <span css={whoNameCss(color)}>{name}</span>
        <StrengthIcon value={strengthOf(player)} />
      </span>
      <span css={gainCss}>
        {earned.points !== 0 && (
          <span css={pointsCss}>
            {earned.points > 0 ? '+' : '−'}
            <LegendValueIcon value={Math.abs(earned.points)} />
          </span>
        )}
        {earned.gold > 0 && <GoldValueIcon value={earned.gold} />}
        {!earned.points && !earned.gold && <span css={nothingCss}>{t('log.war.nothing', 'nothing')}</span>}
      </span>
      <span css={warsCss}>
        {neighbours.map((neighbour) => (
          <Fight key={neighbour} neighbour={neighbour} strength={strengthOf(neighbour)} won={warsWonAgainst(strengthOf(player), strengthOf(neighbour), twoPlayers)} />
        ))}
        {byEffects !== 0 && (
          <span css={fightCss}>
            <Trans i18nKey="log.war.effects" defaults="<pl/> from effects" components={{ pl: <LegendValueIcon value={byEffects} /> }} />
          </span>
        )}
      </span>
    </span>
  )
}

/** A war against a neighbour: won or lost, with the neighbour and their strength; at 2 players, two wars won are told */
const Fight: FC<{ neighbour: PlayerColor; strength: number; won: number }> = ({ neighbour, strength, won }) => {
  const { t } = useTranslation()
  const name = usePlayerName(neighbour)
  return (
    <span css={[fightCss, !won && lostCss]} title={won ? t('war.won', 'War won') : t('war.lost', 'War lost')}>
      <span css={[markCss, won ? wonMarkCss : lostMarkCss]}>{won ? '✓' : '✗'}</span>
      <span css={whoNameCss(inkOf(neighbour))}>{name}</span>
      <StrengthIcon value={strength} />
      {won > 1 && <span>×{won}</span>}
    </span>
  )
}

/** What a Monarch earns at the wars: the moves after their outcome, until the outcome of the next Monarch */
const earnings = (player: PlayerColor, context: LogContext) => {
  const moves = nextMovesUntil(context, isCustomMoveType(CustomMoveType.WarOutcome))
  const score = moves.find((move: MaterialMove) => isMoveItemType(MaterialType.ScoreToken)(move) && move.location.player === player)
  return {
    points: score && isMoveItemType(MaterialType.ScoreToken)(score) ? scoreChange(score, context.game) : 0,
    gold: goldGainedIn(moves, player)
  }
}

/** The avatar on two lines, the name and the strength above the wars, what is earned at the right */
const slipCss = css`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 0.5em;
  row-gap: 0.1em;
  width: 100%;
`

const avatarCss = css`
  grid-row: span 2;
`

const topCss = css`
  display: flex;
  align-items: center;
  gap: 0.35em;
`

const gainCss = css`
  grid-row: span 2;
  display: flex;
  align-items: center;
  gap: 0.2em;
`

const pointsCss = css`
  display: inline-flex;
  align-items: center;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  color: ${rust};
`

const nothingCss = css`
  font-style: italic;
  font-size: 0.85em;
  color: #a0948a;
`

const warsCss = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25em 0.8em;
  font-size: 0.8em;
  color: #6b6058;
`

const fightCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
`

const lostCss = css`
  opacity: 0.75;
`

const markCss = css`
  width: 1em;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  text-align: center;
`

const wonMarkCss = css`
  color: #2f7a43;
`

const lostMarkCss = css`
  color: #a0948a;
`
