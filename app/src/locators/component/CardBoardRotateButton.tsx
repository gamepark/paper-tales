/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { faRotateRight } from '@fortawesome/free-solid-svg-icons/faRotateRight'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { pointerCursorCss, useAnimation, useLegalMove, usePlay, useRules } from '@gamepark/react-game'
import { isMoveItemType, Location, MaterialMove } from '@gamepark/rules-api'
import { FC } from 'react'

export const CardBoardRotateButton: FC<{ location: Location }> = ({ location }) => {
  const play = usePlay()
  const rules = useRules<PaperTalesRules>()!
  const cardIndex = rules.material(MaterialType.Building).index(location.parent)
  const rotation = cardIndex.getItem()!.location.rotation
  const flip = () => play(cardIndex.rotateItem(!rotation), { local: true })
  const animation = useAnimation<MaterialMove, PlayerColor>(
    (animation) => isMoveItemType(MaterialType.Building)(animation.move) && animation.move.itemIndex === location.parent
  )
  const canRotate = useLegalMove<MaterialMove>(
    (move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === cardIndex.getIndex() && move.location.rotation === true
  )

  if (animation || !canRotate) return null
  return (
    <>
      <div css={[button]} onClick={flip}>
        <FontAwesomeIcon
          icon={faRotateRight}
          css={[
            pointerCursorCss,
            css`
              font-size: 1.2em;
            `
          ]}
        />
      </div>
    </>
  )
}

const button = css`
  transition: transform 0.2s;
  height: 100%;
  width: 100%;
  cursor: pointer !important;
  &:active {
    filter: unset;
  }
  background-color: white;
  display: flex;
  color: black;
  align-items: center;
  justify-content: center;
  border-radius: 5em;
  filter: drop-shadow(0.05em 0.05em 0.05em black);
`
