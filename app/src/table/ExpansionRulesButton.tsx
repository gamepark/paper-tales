import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { PlayMoveButton, useMaterialContext } from '@gamepark/react-game'
import { MaterialMoveBuilder } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { expansionRulesPosition, hasExpansion, SIDE_COLUMN_WIDTH } from '../locators/TableLayout'
import { RulesBookIcon } from '../material/icons/PaperIcons'
import { tableButtonCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'
import displayLocationHelp = MaterialMoveBuilder.displayLocationHelp

/** At the foot of the right column when an expansion is played: opens its rules, like the help of any item of the table */
export const ExpansionRulesButton: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  if (!hasExpansion(context)) return null
  return (
    <TableAnchor position={expansionRulesPosition} css={columnCss}>
      <PlayMoveButton css={[tableButtonCss, buttonCss]} move={displayLocationHelp({ type: LocationType.ExpansionRules })} transient>
        <RulesBookIcon />
        {t('expansions.button', 'Expansions')}
      </PlayMoveButton>
    </TableAnchor>
  )
}

const columnCss = css`
  width: ${SIDE_COLUMN_WIDTH}em;
  display: flex;
  justify-content: center;
`

const buttonCss = css`
  min-height: 2.4em;

  svg {
    width: 1.45em;
    height: 1.45em;
  }
`
