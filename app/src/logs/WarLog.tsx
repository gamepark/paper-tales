import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'

/** The wars begin: the strength of every kingdom, read on the game before they are fought */
export const StrengthsLog: FC<MaterialLogProps> = ({ context }) => {
  const { t } = useTranslation()
  const rules = new PaperTalesRules(context.game)
  const war = new War(context.game)
  return (
    <>
      {t('log.war.strengths', 'Wars, strengths:')}{' '}
      {rules.players.map((player, index) => (
        <Fragment key={player}>
          {index > 0 && ', '}
          <Strength player={player} power={war.getPlayerPower(player)} />
        </Fragment>
      ))}
    </>
  )
}

const Strength: FC<{ player: PlayerColor; power: number }> = ({ player, power }) => {
  const name = usePlayerName(player)
  return (
    <>
      {name} {power}
    </>
  )
}

/**
 * The Legend points a Monarch scores at the wars: the wars won, and the points with the effects that score then, read
 * as the move of their score marker (the game of the context is the one before the move)
 */
export const WarWonLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const { t } = useTranslation()
  const rules = new PaperTalesRules(context.game)
  const player = move.location.player as PlayerColor
  const name = usePlayerName(player)
  const before = rules.material(MaterialType.ScoreToken).index(move.itemIndex).getItem()!
  const points = (move.location.x ?? 0) - (before.location.x ?? 0)
  const wars = new War(context.game).getWarsWon(player)
  return (
    <>
      {t('log.war.won', {
        defaultValue: '{player} wins {count, plural, =0 {no war} one {# war} other {# wars}}: {points, plural, one {+# Legend point} other {+# Legend points}}',
        player: name,
        count: wars,
        points
      })}
    </>
  )
}
