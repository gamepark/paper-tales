import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { MaterialLogProps } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { LegendValueIcon } from '../material/help/book/HelpIcons'
import { Who } from './Who'

/**
 * The Legend points a Monarch scores at the wars: the wars won, and the points with the effects that score then, read
 * as the move of their score marker (the game of the context is the one before the move)
 */
export const WarWonLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const rules = new PaperTalesRules(context.game)
  const player = move.location.player as PlayerColor
  const before = rules.material(MaterialType.ScoreToken).index(move.itemIndex).getItem()!
  const points = (move.location.x ?? 0) - (before.location.x ?? 0)
  const wars = new War(context.game).getWarsWon(player)
  return (
    <Trans
      i18nKey="log.war.won"
      defaults="<who/> wins {count, plural, =0 {no war} one {# war} other {# wars}}: +<pl/>"
      values={{ count: wars }}
      components={{ who: <Who player={player} />, pl: <LegendValueIcon value={points} /> }}
    />
  )
}
