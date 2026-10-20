import { css } from '@emotion/react'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { MaterialComponent, PlayMoveButton } from '@gamepark/react-game'
import { MaterialMoveBuilder } from '@gamepark/rules-api'
import { FC } from 'react'
import displayMaterialHelp = MaterialMoveBuilder.displayMaterialHelp

/** The cards of an expansion, small, side by side: a click opens the help of the card */
export const ExpansionCards: FC<{ type: MaterialType; ids: number[] }> = ({ type, ids }) => (
  <div css={galleryCss}>
    {ids.map((id) => (
      <PlayMoveButton key={id} css={cardCss} move={displayMaterialHelp(type, { id })} transient>
        <MaterialComponent type={type} itemId={id} />
      </PlayMoveButton>
    ))}
  </div>
)

const galleryCss = css`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin: 0.4em 0 0.2em;
  /* The cards are drawn in cm of the material: about 4.5em for a unit card */
  font-size: 0.45em;
`

const cardCss = css`
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font-size: 1em;
  filter: drop-shadow(0.15em 0.2em 0 #00000040);
  transition: transform 0.15s;

  &:hover {
    transform: translateY(-0.3em) scale(1.06);
  }
`
