import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Avatar, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { inkOf } from '../utils/color'
import { whoAvatarCss, whoCss, whoNameCss } from './logs.css'

/** The Monarch an event concerns: their avatar ringed with their colour, then their name in their colour */
export const Who: FC<{ player?: PlayerColor }> = ({ player }) => {
  const name = usePlayerName(player)
  if (player === undefined) return <>{name}</>
  const color = inkOf(player)
  return (
    <span css={whoCss}>
      <Avatar playerId={player} css={whoAvatarCss(color)} />
      <span css={whoNameCss(color)}>{name}</span>
    </span>
  )
}
