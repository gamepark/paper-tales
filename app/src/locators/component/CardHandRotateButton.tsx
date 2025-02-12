/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { faRotateRight } from '@fortawesome/free-solid-svg-icons/faRotateRight'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { pointerCursorCss, useAnimation, useLegalMove, usePlay, useRules } from '@gamepark/react-game'
import { isMoveItemType, Location } from '@gamepark/rules-api'
import { FC, useCallback } from 'react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'


export const CardHandRotateButton: FC<{ location: Location }> = ({ location }) => {
  const play = usePlay()
  const rules = useRules<PaperTalesRules>()!
  const cardIndex = rules.material(MaterialType.Building).location(LocationType.PlayerBuildingHand).index(location.parent!)
  const rotation = cardIndex.getItem()!.location.rotation
  const flip = useCallback((event) => {
    event.preventDefault()
    play(cardIndex.rotateItem(!rotation), { local: true })
  }, [rotation])
  const animation = useAnimation((animation) =>
    isMoveItemType(MaterialType.Building)(animation.move) && animation.move.itemIndex === location.parent)
  const canRotate = useLegalMove((move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === cardIndex.getIndex() && move.location.rotation === true )
  if (animation || !canRotate) return null
  return (
    <>
      <div css={[button]} onClick={flip}>
        <FontAwesomeIcon icon={faRotateRight} css={[pointerCursorCss, css`font-size: 1.2em`]}/>
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