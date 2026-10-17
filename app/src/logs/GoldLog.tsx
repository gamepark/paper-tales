import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { BASE_INCOME, Income } from '@gamepark/paper-tales/rules/4_Income/Income'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { CreateItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

/** Gold a Monarch receives from an effect (a war won with a Rogue, a Monkey dying…): the coins created */
export const GoldLog: FC<MaterialLogProps<CreateItem>> = ({ move }) => {
  const { t } = useTranslation()
  const name = usePlayerName(move.item.location.player)
  const count = (move.item.quantity ?? 1) * (move.item.id as number)
  return <>{t('log.gold', { defaultValue: '{player} receives {count} gold', player: name, count })}</>
}

/** The income of a Monarch (rulebook p.6): 2 gold plus the income effects, read on the game before it is paid */
export const IncomeLog: FC<MaterialLogProps<CreateItem>> = ({ move, context }) => {
  const { t } = useTranslation()
  const player = move.item.location.player as PlayerColor
  const name = usePlayerName(player)
  const count = BASE_INCOME + new Income(context.game).getPlayerIncome(player)
  return <>{t('log.gold', { defaultValue: '{player} receives {count} gold', player: name, count })}</>
}
