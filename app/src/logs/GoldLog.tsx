import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { BASE_INCOME, Income } from '@gamepark/paper-tales/rules/4_Income/Income'
import { MaterialLogProps } from '@gamepark/react-game'
import { CreateItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { GoldValueIcon } from '../material/help/book/HelpIcons'
import { Who } from './Who'

const Received: FC<{ player: PlayerColor; count: number }> = ({ player, count }) => (
  <Trans i18nKey="log.gold" defaults="<who/> receives <g/>" components={{ who: <Who player={player} />, g: <GoldValueIcon value={count} /> }} />
)

/** Gold a Monarch receives from an effect (a war won with a Rogue, a Monkey dying…): the coins created */
export const GoldLog: FC<MaterialLogProps<CreateItem>> = ({ move }) => (
  <Received player={move.item.location.player as PlayerColor} count={(move.item.quantity ?? 1) * (move.item.id as number)} />
)

/** The income of a Monarch (rulebook p.6): 2 gold plus the income effects, read on the game before it is paid */
export const IncomeLog: FC<MaterialLogProps<CreateItem>> = ({ move, context }) => {
  const player = move.item.location.player as PlayerColor
  return <Received player={player} count={BASE_INCOME + new Income(context.game).getPlayerIncome(player)} />
}
