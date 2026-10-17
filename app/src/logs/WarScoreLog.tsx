import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * The legend points a player scores at the wars: the wars won and the effects that score then, read as the move of
 * their score marker (the game of the context is the one before the move)
 */
export const WarScoreLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const { t } = useTranslation()
  const rules = new PaperTalesRules(context.game)
  const before = rules.material(MaterialType.ScoreToken).index(move.itemIndex).getItem()!
  const name = usePlayerName(move.location.player)
  const amount = (move.location.x ?? 0) - (before.location.x ?? 0)
  return <>{t('log.war.score', { defaultValue: '{player} scores {count, plural, one {# legend point} other {# legend points}}', player: name, count: amount })}</>
}
