import { css } from '@emotion/react'
import { ochre } from '../theme/tableTheme'

/** A place the chosen card can go to, free or taken: a dashed gold line around it */
export const placeTargetCss = css`
  outline: 0.16em dashed ${ochre};
  outline-offset: 0.05em;
  border-radius: 0.5em;
`
