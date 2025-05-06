import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'

export const getColor = (color: PlayerColor): string => {
  switch (color) {
    case PlayerColor.Yellow:
      return '#F8D216CC'
    case PlayerColor.Black:
      return '#000000FF'
    case PlayerColor.Blue:
      return '#1A5EAACC'
    case PlayerColor.Red:
      return '#E4032CCC'
    case PlayerColor.Green:
      return '#009958CC'
    case PlayerColor.Purple:
      return '#762583CC'
    case PlayerColor.White:
      return '#F0F0F0CC'
  }

  return ''
}
