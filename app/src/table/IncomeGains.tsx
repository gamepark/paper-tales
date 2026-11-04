import { css } from '@emotion/react'
import { Card } from '@gamepark/paper-tales/material/Artifact'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { BASE_INCOME, IncomeHelper } from '@gamepark/paper-tales/rules/helpers/IncomeHelper'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { useMaterialContext } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getIncomeGainsPosition, getMe, isMyAreaDisplayed } from '../locators/TableLayout'
import { useUnitName } from '../logs/useUnitName'
import { Receipt, ReceiptLine } from './Receipt'
import { TableAnchor } from './TableAnchor'

/**
 * The income (rulebook p.6), earned in my kingdom where my gold is, once every Monarch has read the summary of the
 * wars: the base gold, each card in play that brings some, the buildings, then the total, line by line
 */
export const IncomeGains: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const unitName = useUnitName()
  const me = getMe(context)
  if (context.rules.game.rule?.id !== RuleId.Income || !isMyAreaDisplayed(context, me)) return null
  const income = new IncomeHelper(context.rules.game)
  const buildings = income.getIncomeFromBuilding(me)
  const lines: ReceiptLine[] = [
    { label: t('gains.income.base', 'Base income'), gold: BASE_INCOME },
    ...income.getCardsIncome(me).map(({ index, amount }) => ({ label: unitName(context.rules.material(MaterialType.Unit).getItem<Card>(index).id), gold: amount })),
    ...(buildings ? [{ label: t('gains.buildings', 'Buildings'), gold: buildings }] : [])
  ]
  return (
    <TableAnchor position={getIncomeGainsPosition(context)} css={anchorCss}>
      <Receipt
        title={t('gains.income.title', 'Your income')}
        lines={lines}
        total={{ label: t('gains.total', 'Total'), gold: BASE_INCOME + income.getPlayerIncome(me) }}
        lineDelays={(index) => 0.2 + index * LINE_PACE}
      />
    </TableAnchor>
  )
}

const LINE_PACE = 0.4

const anchorCss = css`
  transform: translateX(-50%);
  font-size: 0.95em;
`
