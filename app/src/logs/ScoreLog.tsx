import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

/** Legend points gained or lost outside the wars (a card revealed, the Age), read as the move of the score marker */
export const ScoreLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const { t } = useTranslation()
  const name = usePlayerName(move.location.player)
  const before = new PaperTalesRules(context.game).material(MaterialType.ScoreToken).index(move.itemIndex).getItem()!
  const points = (move.location.x ?? 0) - (before.location.x ?? 0)
  if (points < 0)
    return (
      <>{t('log.score.loss', { defaultValue: '{player} loses {count, plural, one {# Legend point} other {# Legend points}}', player: name, count: -points })}</>
    )
  return (
    <>{t('log.score.gain', { defaultValue: '{player} gains {count, plural, one {# Legend point} other {# Legend points}}', player: name, count: points })}</>
  )
}
