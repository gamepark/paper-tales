import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { MaterialLogProps } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { GoldValueIcon, LegendValueIcon } from '../material/help/book/HelpIcons'
import { goldGainedInPhase, scoreChange } from './logHelpers'
import { Who } from './Who'

/**
 * What a Monarch earns at the wars: the wars won, the Legend points with the effects that score then, and the gold of
 * the effects "for each war won" (the coins are not told apart), read on the game before the score marker moves
 */
export const WarWonLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const player = move.location.player as PlayerColor
  const gold = goldGainedInPhase(player, context)
  const values = { count: new War(context.game).getWarsWon(player) }
  const components = { who: <Who player={player} />, pl: <LegendValueIcon value={scoreChange(move, context.game)} />, g: <GoldValueIcon value={gold} /> }
  if (gold)
    return (
      <Trans
        i18nKey="log.war.won.gold"
        defaults="<who/> wins {count, plural, =0 {no war} one {# war} other {# wars}}: +<pl/> and <g/>"
        values={values}
        components={components}
      />
    )
  return (
    <Trans i18nKey="log.war.won" defaults="<who/> wins {count, plural, =0 {no war} one {# war} other {# wars}}: +<pl/>" values={values} components={components} />
  )
}
