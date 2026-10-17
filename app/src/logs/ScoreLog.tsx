import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { MaterialLogProps } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { LegendValueIcon } from '../material/help/book/HelpIcons'
import { Who } from './Who'

/** Legend points gained or lost outside the wars (a card revealed, the Age), read as the move of the score marker */
export const ScoreLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const player = move.location.player as PlayerColor
  const before = new PaperTalesRules(context.game).material(MaterialType.ScoreToken).index(move.itemIndex).getItem()!
  const points = (move.location.x ?? 0) - (before.location.x ?? 0)
  const components = { who: <Who player={player} />, pl: <LegendValueIcon value={Math.abs(points)} /> }
  if (points < 0) return <Trans i18nKey="log.score.loss" defaults="<who/> loses <pl/>" components={components} />
  return <Trans i18nKey="log.score.gain" defaults="<who/> gains <pl/>" components={components} />
}
