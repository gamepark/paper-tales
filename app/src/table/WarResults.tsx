import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { warsWonAgainst, WarStrengths } from '@gamepark/paper-tales/rules/3_War/War'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import shield from '../images/tokens/bouclier_rouge.png'
import { areWarsFought, getMe, getWarPlayers, getWarResultPosition, isSpectator, isWarView } from '../locators/TableLayout'
import { labelCss, rust } from '../theme/tableTheme'
import { inkOf } from '../utils/color'
import { TableAnchor } from './TableAnchor'

/**
 * Once the wars are fought, in the neighbours view: one banner per war of the central kingdom, against each of its
 * neighbours, with both strengths when the wars were fought and who won (rulebook p.6: both win on a tie; at 2 players,
 * a double strength wins two wars, p.8)
 */
export const WarResults: FC = () => {
  const context = useMaterialContext()
  if (!isWarView(context) || !areWarsFought(context)) return null
  const strengths = context.rules.remind<WarStrengths | undefined>(Memory.WarStrengths)
  if (!strengths) return null
  const players = getWarPlayers(context)
  const twoPlayers = context.rules.players.length === 2
  const center = players.length === 3 ? players[1] : players[0]
  const neighbours = players.length === 3 ? [0, 2] : [1]
  return (
    <>
      {neighbours.map((index) => (
        <WarResult
          key={index}
          position={getWarResultPosition(index, players.length)}
          neighbour={players[index]}
          center={center}
          neighbourStrength={strengths[players[index]] ?? 0}
          centerStrength={strengths[center] ?? 0}
          twoPlayers={twoPlayers}
        />
      ))}
    </>
  )
}

type WarResultProps = {
  position: { x: number; y: number }
  neighbour: PlayerColor
  center: PlayerColor
  neighbourStrength: number
  centerStrength: number
  twoPlayers: boolean
}

const WarResult: FC<WarResultProps> = ({ position, neighbour, center, neighbourStrength, centerStrength, twoPlayers }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const me = isSpectator(context) ? undefined : getMe(context)
  const neighbourName = usePlayerName(neighbour)
  const centerName = usePlayerName(center)
  const nameOf = (player: PlayerColor, name: string) => (player === me ? t('war.you', 'You') : name)
  const centerWins = warsWonAgainst(centerStrength, neighbourStrength, twoPlayers)
  const neighbourWins = warsWonAgainst(neighbourStrength, centerStrength, twoPlayers)

  const winText = (player: PlayerColor, name: string, wins: number) => {
    if (player === me) return wins > 1 ? t('war.result.you.2', 'You win 2 wars') : t('war.result.you', 'You win')
    return wins > 1 ? t('war.result.2', { defaultValue: '{player} wins 2 wars', player: name }) : t('war.result', { defaultValue: '{player} wins', player: name })
  }
  const outcome =
    centerWins && neighbourWins
      ? t('war.result.tie', 'Tie: both win')
      : centerWins
        ? winText(center, centerName, centerWins)
        : winText(neighbour, neighbourName, neighbourWins)

  return (
    <TableAnchor position={position} css={[labelCss, bannerCss]}>
      <span css={duelCss}>
        <Side player={neighbour} name={nameOf(neighbour, neighbourName)} strength={neighbourStrength} />
        <span css={versusCss}>–</span>
        <Side player={center} name={nameOf(center, centerName)} strength={centerStrength} />
      </span>
      <span css={outcomeCss}>{outcome}</span>
    </TableAnchor>
  )
}

const Side: FC<{ player: PlayerColor; name: string; strength: number }> = ({ player, name, strength }) => (
  <span css={sideCss}>
    <span css={nameCss(player)}>{name}</span>
    <img src={shield} alt="" />
    {strength}
  </span>
)

const bannerCss = css`
  flex-direction: column;
  gap: 0.15em;
  padding: 0.5em 1.2em 0.4em;
  font-size: 1.15em;
  transform: translateX(-50%);
`

const duelCss = css`
  display: flex;
  align-items: center;
  gap: 0.5em;
`

const sideCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
`

const nameCss = (player: PlayerColor) => css`
  color: ${inkOf(player)};
`

const versusCss = css`
  opacity: 0.5;
`

const outcomeCss = css`
  color: ${rust};
  font-size: 1.1em;
`
