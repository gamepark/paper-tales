import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Income } from '@gamepark/paper-tales/rules/4_Income/Income'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'

/** The income of every Monarch (rulebook p.6): 2 gold plus the income effects, read on the game before it is paid */
export const IncomeLog: FC<MaterialLogProps> = ({ context }) => {
  const rules = new PaperTalesRules(context.game)
  const income = new Income(context.game)
  return (
    <div>
      <Trans i18nKey="log.income" defaults="Income" />
      <ul css={listCss}>
        {rules.players.map((player) => (
          <IncomeLine key={player} player={player} gold={2 + income.getPlayerIncome(player)} />
        ))}
      </ul>
    </div>
  )
}

const IncomeLine: FC<{ player: PlayerColor; gold: number }> = ({ player, gold }) => {
  const { t } = useTranslation()
  const name = usePlayerName(player)
  return <li>{t('log.income.player', { defaultValue: '{player}: +{count} gold', player: name, count: gold })}</li>
}

const listCss = css`
  margin: 0.2em 0 0;
  padding-left: 1.2em;
`
