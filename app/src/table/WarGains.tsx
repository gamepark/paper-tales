import { Card } from '@gamepark/paper-tales/material/Artifact'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { warsWonAgainst, WarStrengths } from '@gamepark/paper-tales/rules/3_War/War'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { css } from '@emotion/react'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getMe, getWarCenter, getWarGainsPosition, getWarPlayers, isSpectator } from '../locators/TableLayout'
import { useUnitName } from '../logs/useUnitName'
import { Receipt, ReceiptLine } from './Receipt'
import { TableAnchor } from './TableAnchor'
import { getWarGains, isWarGainsShown } from './warGainsHelper'
import { beatCss, GAIN_LINE_PACE, GAINS_AT, useWarReplays, useWarsTold } from './warPace'

/**
 * The last beat of the wars, and their summary: what the central kingdom gains, on a receipt at its left, line by line:
 * each war, each card in play that gains something, the buildings, then the total
 */
export const WarGains: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const unitName = useUnitName()
  const told = useWarsTold(context)
  const replays = useWarReplays()
  const center = getWarCenter(context)
  const name = usePlayerName(center)
  if (!isWarGainsShown(context)) return null
  const gains = getWarGains(context, center)
  const strengths = context.rules.remind<WarStrengths | undefined>(Memory.WarStrengths) ?? {}
  const twoPlayers = context.rules.players.length === 2
  const neighbours = getWarPlayers(context).filter((player) => player !== center)
  const lines: ReceiptLine[] = [
    ...neighbours.map((neighbour) => {
      const wins = warsWonAgainst(strengths[center] ?? 0, strengths[neighbour] ?? 0, twoPlayers)
      const losses = warsWonAgainst(strengths[neighbour] ?? 0, strengths[center] ?? 0, twoPlayers)
      return { label: <WarLabel neighbour={neighbour} wins={wins} tie={wins > 0 && losses > 0} />, score: 3 * wins }
    }),
    ...gains.cards
      .filter((card) => card.score || card.gold)
      .map((card) => ({ label: unitName(context.rules.material(MaterialType.Unit).getItem<Card>(card.index).id), score: card.score || undefined, gold: card.gold })),
    ...(gains.buildings ? [{ label: t('gains.buildings', 'Buildings'), score: gains.buildings }] : [])
  ]
  const mine = !isSpectator(context) && center === getMe(context)
  return (
    <TableAnchor key={told ? replays : -1} position={getWarGainsPosition(context)} css={[anchorCss, told && beatCss(GAINS_AT)]}>
      <Receipt
        title={mine ? t('gains.wars.title.you', 'Your wars this turn') : t('gains.wars.title', { defaultValue: 'The wars of {player} this turn', player: name })}
        lines={lines}
        total={{ label: t('gains.total', 'Total'), score: gains.score, gold: gains.gold }}
        lineDelays={told ? (index) => GAINS_AT + (index + 1) * GAIN_LINE_PACE : undefined}
      />
    </TableAnchor>
  )
}

/** A war of the central kingdom against one neighbour, and its outcome */
const WarLabel: FC<{ neighbour: PlayerColor; wins: number; tie: boolean }> = ({ neighbour, wins, tie }) => {
  const { t } = useTranslation()
  const player = usePlayerName(neighbour)
  if (tie) return <>{t('gains.war.tie', { defaultValue: 'Against {player}: tie', player })}</>
  if (wins > 1) return <>{t('gains.war.won.2', { defaultValue: 'Against {player}: 2 wars won', player })}</>
  if (wins) return <>{t('gains.war.won', { defaultValue: 'Against {player}: won', player })}</>
  return <>{t('gains.war.lost', { defaultValue: 'Against {player}: lost', player })}</>
}

const anchorCss = css`
  transform: translateX(-50%);
  font-size: 0.95em;
`
