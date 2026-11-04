import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayMoveButton, useLegalMoves, useMaterialContext } from '@gamepark/react-game'
import { MaterialMove } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getKingdomSlotCoordinates, getMe, isMyAreaDisplayed } from '../locators/TableLayout'
import { getPlaceMoves, getSelectedUnit } from '../material/actions/PlaceActions'
import { tableButtonCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

/**
 * While a card is chosen to be placed, the button on each free place of my kingdom that can receive it. On a place taken,
 * the button is on the unit that stands there (see UnitCardDescription).
 */
export const PlaceHereButtons: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const legalMoves = useLegalMoves<MaterialMove>()
  const selected = getSelectedUnit(context)
  const me = getMe(context)
  if (selected === undefined || !isMyAreaDisplayed(context, me)) return null
  const kingdom = context.rules.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(me)
  const free = getPlaceMoves(legalMoves, selected).filter(({ location }) => !kingdom.filter((unit) => unit.location.x === location.x && unit.location.y === location.y).length)
  return (
    <>
      {free.map((move) => (
        <TableAnchor key={`${move.location.x}_${move.location.y}`} position={getKingdomSlotCoordinates(context, me, move.location.x!, move.location.y!)} css={centredCss}>
          <PlayMoveButton css={tableButtonCss} move={move}>
            {t('move.place.here', 'Place here')}
          </PlayMoveButton>
        </TableAnchor>
      ))}
    </>
  )
}

const centredCss = css`
  transform: translate(-50%, -50%);
`
