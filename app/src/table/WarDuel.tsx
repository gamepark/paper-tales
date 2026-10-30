import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { warsWonAgainst } from '@gamepark/paper-tales/rules/3_War/War'
import { PlayMoveButton, useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { XYCoordinates } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import shield from '../images/tokens/bouclier_rouge.png'
import { getMe, getNeighboursView, isSpectator, viewMove } from '../locators/TableLayout'
import { labelCss, paperButtonResetCss, rust } from '../theme/tableTheme'
import { inkOf } from '../utils/color'
import { TableAnchor } from './TableAnchor'
import { beatCss } from './warPace'

type WarDuelProps = {
  position: XYCoordinates
  neighbour: PlayerColor
  center: PlayerColor
  neighbourStrength: number
  centerStrength: number
  /** It comes in with its beat of the wars, while they are told */
  arriving: boolean
  /** Laid by its container (beside a ribbon), not anchored on the table by itself */
  inline?: boolean
}

/**
 * Once the war against a neighbour is fought, the ribbon of that neighbour becomes the duel: both strengths as the war
 * was fought, and who won (rulebook p.6: both win on a tie; at 2 players, a double strength wins two wars, p.8). Each
 * strength is written once, under the kingdom it was fought against. A click centres the view on that neighbour, as
 * their ribbon does.
 */
export const WarDuel: FC<WarDuelProps> = ({ position, neighbour, center, neighbourStrength, centerStrength, arriving, inline }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const me = isSpectator(context) ? undefined : getMe(context)
  const neighbourName = usePlayerName(neighbour)
  const centerName = usePlayerName(center)
  const twoPlayers = context.rules.players.length === 2
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

  const duel = (
      <PlayMoveButton
        css={[labelCss, duelCss, !inline && centredCss, buttonCss, arriving && beatCss(0)]}
        move={viewMove(context, getNeighboursView(context, neighbour))}
        transient
        title={t('view.player.neighbours', { defaultValue: 'Neighbours of {player}', player: neighbourName })}
      >
        <span css={scoreCss}>
          <Side player={neighbour} name={nameOf(neighbour, neighbourName)} strength={neighbourStrength} />
          <span css={versusCss}>–</span>
          <Side player={center} name={nameOf(center, centerName)} strength={centerStrength} reversed />
        </span>
        <span css={outcomeCss}>{outcome}</span>
      </PlayMoveButton>
  )
  return inline ? duel : <TableAnchor position={position}>{duel}</TableAnchor>
}

/** A side of the duel: the name and the strength, the strength towards the middle */
const Side: FC<{ player: PlayerColor; name: string; strength: number; reversed?: boolean }> = ({ player, name, strength, reversed }) => {
  const value = (
    <span css={strengthCss}>
      <img src={shield} alt="" />
      {strength}
    </span>
  )
  return (
    <span css={sideCss}>
      {reversed && value}
      <span css={nameCss(player)}>{name}</span>
      {!reversed && value}
    </span>
  )
}

const duelCss = css`
  flex-direction: column;
  gap: 0.15em;
  padding: 0.5em 1.2em 0.4em;
  font-size: 1.15em;
`

const centredCss = css`
  transform: translateX(-50%);
`

/** The duel is a button: it lifts a little under the pointer */
const buttonCss = css`
  ${paperButtonResetCss};
  transition: translate 0.15s;

  &:hover {
    translate: -0.05em -0.08em;
  }
`

const scoreCss = css`
  display: flex;
  align-items: center;
  gap: 0.5em;
`

const sideCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
`

const strengthCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.15em;
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
