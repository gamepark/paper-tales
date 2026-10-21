import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War, warsWonAgainst } from '@gamepark/paper-tales/rules/3_War/War'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MaterialGame, MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import shield from '../images/tokens/bouclier_rouge.png'
import { GoldValueIcon, LegendValueIcon } from '../material/help/book/HelpIcons'
import { rust } from '../theme/tableTheme'
import { inkOf } from '../utils/color'
import { goldGainedInPhase, scoreChange } from './logHelpers'
import { whoNameCss } from './logs.css'
import { Who } from './Who'

/** The Legend points of each war won (rulebook p.6) */
const POINTS_PER_WAR = 3

/**
 * The wars of the turn, read on the game before they are fought, as on the banners of the table: one line per pair of
 * neighbours with both strengths and who wins (both on a tie; at 2 players, a double strength wins two wars, p.8)
 */
export const WarDuels: FC<{ game: MaterialGame }> = ({ game }) => {
  const players = new PaperTalesRules(game).players
  const war = new War(game)
  const twoPlayers = players.length === 2
  const duels = twoPlayers ? [[players[0], players[1]]] : players.map((player, index) => [player, players[(index + 1) % players.length]])
  return (
    <>
      {duels.map(([left, right]) => (
        <Duel key={left} left={left} right={right} leftStrength={war.getPlayerPower(left)} rightStrength={war.getPlayerPower(right)} twoPlayers={twoPlayers} />
      ))}
    </>
  )
}

type DuelProps = { left: PlayerColor; right: PlayerColor; leftStrength: number; rightStrength: number; twoPlayers: boolean }

const Duel: FC<DuelProps> = ({ left, right, leftStrength, rightStrength, twoPlayers }) => {
  const { t } = useTranslation()
  const leftName = usePlayerName(left)
  const rightName = usePlayerName(right)
  const leftWins = warsWonAgainst(leftStrength, rightStrength, twoPlayers)
  const rightWins = warsWonAgainst(rightStrength, leftStrength, twoPlayers)
  const winText = (name: string, wins: number) =>
    wins > 1 ? t('war.result.2', { defaultValue: '{player} wins 2 wars', player: name }) : t('war.result', { defaultValue: '{player} wins', player: name })
  const outcome = leftWins && rightWins ? t('war.result.tie', 'Tie: both win') : leftWins ? winText(leftName, leftWins) : winText(rightName, rightWins)
  return (
    <span css={duelCss}>
      <Side player={left} name={leftName} strength={leftStrength} />
      <span css={versusCss}>–</span>
      <Side player={right} name={rightName} strength={rightStrength} />
      <span css={outcomeCss}>{outcome}</span>
    </span>
  )
}

const Side: FC<{ player: PlayerColor; name: string; strength: number }> = ({ player, name, strength }) => (
  <span css={sideCss}>
    <span css={whoNameCss(inkOf(player))}>{name}</span>
    <img css={shieldCss} src={shield} alt="" />
    {strength}
  </span>
)

/**
 * What a Monarch earns at the wars: the wars won, the Legend points with the part of the effects that score then, and
 * the gold of the effects "for each war won" (the coins are not told apart), read on the game before the score marker moves
 */
export const WarWonLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const player = move.location.player as PlayerColor
  const gold = goldGainedInPhase(player, context)
  const wars = new War(context.game).getWarsWon(player)
  const points = scoreChange(move, context.game)
  const byEffects = wars ? points - wars * POINTS_PER_WAR : 0
  const components = {
    who: <Who player={player} />,
    // The sign stays with the scroll when the line wraps
    pl: (
      <span css={nowrapCss}>
        +<LegendValueIcon value={points} />
      </span>
    ),
    g: <GoldValueIcon value={gold} />,
    effects: byEffects ? <Trans i18nKey="log.war.effects" defaults=" (<pl/> from effects)" components={{ pl: <LegendValueIcon value={byEffects} /> }} /> : <></>
  }
  if (gold)
    return (
      <Trans
        i18nKey="log.war.won.gold"
        defaults="<who/> wins {count, plural, =0 {no war} one {# war} other {# wars}}: <pl/><effects/> and <g/>"
        values={{ count: wars }}
        components={components}
      />
    )
  return (
    <Trans
      i18nKey="log.war.won"
      defaults="<who/> wins {count, plural, =0 {no war} one {# war} other {# wars}}: <pl/><effects/>"
      values={{ count: wars }}
      components={components}
    />
  )
}

const nowrapCss = css`
  white-space: nowrap;
`

const duelCss = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4em;
  margin-top: 0.3em;
  font-size: 0.92em;
`

const sideCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
  font-weight: 700;
`

const shieldCss = css`
  height: 1.2em;
`

const versusCss = css`
  opacity: 0.5;
`

const outcomeCss = css`
  margin-left: 0.3em;
  color: ${rust};
  font-weight: 700;
`
