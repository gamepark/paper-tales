/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { useMaterialContext, usePlayers } from '@gamepark/react-game'
import { FC } from 'react'
import { createPortal } from 'react-dom'
import { getPlayerIndex } from '../position/position.utils'
import { PaperTalesPlayerPanel } from './PaperTalesPlayerPanel'

export const PlayerPanels: FC<any> = () => {
  const players = usePlayers({ sortFromMe: true })
  const root = document.getElementById('root')
  const context = useMaterialContext()
  if (!root) {
    return null
  }

  return createPortal(
    <>
      {players.map((player, index) => (
        <PaperTalesPlayerPanel
          key={player.id}
          player={player}
          index={index}
          color={playerColorCode[player.id as PlayerColor]}
          css={[
            absolute,
            panelPosition(players.length, getPlayerIndex(context, player.id)),
            player.id === PlayerColor.Black && black
          ]}
        />
      ))}
    </>,
    root
  )
}
const absolute = css`
  position: absolute;
  font-size: 0.8em;
  width: 25em;

  > div > div > span {
    font-size: 2.5em;
  }
`

const black = css`
  > div > div > span,
  > div > span,
  h2 {
    background-color: #ffffff50;
  }
`

const panelPosition = (players: number, index: number) => css`
  border: 0;
  ${getPanelPosition(players, index)};
`

const bottomRight = css`
  bottom: 1em;
  right: 1em;
`

const bottomLeft = css`
  bottom: 1em;
  left: 1em;
`

const topRight = css`
  top: 11em;
  right: 1em;
`

const topLeft = css`
  top: 11em;
  left: 1em;
`

const topCenter = css`
  top: 8.5em;
  left: calc(50dvw - 26em);
`

const bottomCenter = css`
  bottom: 1em;
  left: calc(50dvw - 26em);
`

const topCenterLeft = css`
  top: 8.5em;
  left: calc(40dvw - 26em);
`

const topCenterRight = css`
  top: 8.5em;
  left: calc(67dvw - 14em);
`

const bottomCenterLeft = css`
  bottom: 1em;
  left: calc(40dvw - 14em);
`

const bottomCenterRight = css`
  bottom: 1em;
  left: calc(67dvw - 14em);
`

const getPanelPosition = (players: number, index: number) => {
  switch (index) {
    case 0:
      return players < 3 ? topLeft : bottomLeft
    case 1:
      return players < 3 ? topRight : topLeft
    case 2:
      return players < 5 ? topRight : players < 7 ? topCenter : topCenterLeft
    case 3:
      return players < 7 ? topRight : topCenterRight
    case 4:
      return topRight
    case 5:
      return bottomRight
    case 6:
      return players < 7 ? bottomRight : bottomCenterRight
    case 7:
    default:
      return players < 5
        ? bottomRight
        : players < 7
          ? bottomCenter
          : bottomCenterLeft
  }
}

export const playerColorCode: Record<PlayerColor, string> = {
  [PlayerColor.Red]: 'red',
  [PlayerColor.Blue]: 'blue',
  [PlayerColor.Green]: 'green',
  [PlayerColor.Yellow]: 'yellow',
  [PlayerColor.Black]: 'black',
  [PlayerColor.Purple]: 'purple',
  [PlayerColor.White]: 'white'
}
