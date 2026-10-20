import { css } from '@emotion/react'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { MaterialComponent, PlayMoveButton } from '@gamepark/react-game'
import { MaterialMoveBuilder } from '@gamepark/rules-api'
import { FC, MouseEvent, useState } from 'react'
import displayMaterialHelp = MaterialMoveBuilder.displayMaterialHelp

/** How much a hovered card grows */
const ZOOM = 2.6
/** The room left between a grown card and the edge of the page that scrolls, in px */
const MARGIN = 16

/** The cards of an expansion, small, side by side: hovered, a card grows to be read; a click opens its help */
export const ExpansionCards: FC<{ type: MaterialType; ids: number[] }> = ({ type, ids }) => {
  const [hover, setHover] = useState<{ id: number; x: number; y: number }>()
  /**
   * The grown card is moved back into the visible part of the page that scrolls (the first ancestor that scrolls), so
   * that a card on the edge of the page is not cut by it
   */
  const onEnter = (id: number) => (event: MouseEvent<HTMLElement>) => {
    const card = event.currentTarget.getBoundingClientRect()
    let page: HTMLElement | null = event.currentTarget.parentElement
    while (page && !/(auto|scroll)/.test(getComputedStyle(page).overflowY)) page = page.parentElement
    const visible = page?.getBoundingClientRect() ?? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
    const shift = (start: number, end: number, min: number, max: number) => {
      const centre = (start + end) / 2
      const half = ((end - start) * ZOOM) / 2
      if (centre - half < min + MARGIN) return min + MARGIN - (centre - half)
      if (centre + half > max - MARGIN) return max - MARGIN - (centre + half)
      return 0
    }
    setHover({ id, x: shift(card.left, card.right, visible.left, visible.right), y: shift(card.top, card.bottom, visible.top, visible.bottom) })
  }
  return (
    <div css={galleryCss}>
      {ids.map((id) => (
        <PlayMoveButton
          key={id}
          css={cardCss}
          move={displayMaterialHelp(type, { id })}
          transient
          onMouseEnter={onEnter(id)}
          onMouseLeave={() => setHover(undefined)}
        >
          <div css={zoomCss} style={hover?.id === id ? { transform: `translate(${hover.x}px, ${hover.y}px) scale(${ZOOM})` } : undefined}>
            <MaterialComponent type={type} itemId={id} />
          </div>
        </PlayMoveButton>
      ))}
    </div>
  )
}

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
  position: relative;
  filter: drop-shadow(0.15em 0.2em 0 #00000040);

  &:hover {
    z-index: 1;
  }
`

/**
 * Hovered, the card grows enough to be read, above its neighbours, as the items of the table do: at once, and the grown
 * picture lets the pointer through, so that only the place of the card is hovered and the next card can be hovered
 * right away. A click opens its help.
 */
const zoomCss = css`
  pointer-events: none;
  transition: transform 50ms ease-in-out;
`
