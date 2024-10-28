import { getEnumValues } from '@gamepark/rules-api'

export enum PlayerColor {
  Blue = 1, Red, Green, Yellow, Black, Purple, White, 
}

export const playerColors = getEnumValues(PlayerColor)
