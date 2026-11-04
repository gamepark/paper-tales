import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { PlayMoveButton, useMaterialContext } from '@gamepark/react-game'
import { MaterialMoveBuilder } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { gameRulesPosition, hasGameRules, SIDE_COLUMN_WIDTH } from '../locators/TableLayout'
import { RulesBookIcon } from '../material/icons/PaperIcons'
import { tableButtonCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'
import displayLocationHelp = MaterialMoveBuilder.displayLocationHelp

/** At the foot of the right column when the game has rules of its own: opens them, like the help of any item of the table */
export const GameRulesButton: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  if (!hasGameRules(context)) return null
  return (
    <TableAnchor position={gameRulesPosition} css={columnCss}>
      <PlayMoveButton css={[tableButtonCss, buttonCss]} move={displayLocationHelp({ type: LocationType.GameRules })} transient>
        <RulesBookIcon />
        {t('game-rules.button', 'Rules of this game')}
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
  /* Its words take the whole width of the column */
  padding: 0.3em 0.5em 0.2em;
  font-size: 0.95em;

  svg {
    width: 1.45em;
    height: 1.45em;
  }
`
