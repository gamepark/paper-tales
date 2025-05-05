import { getEnumValues } from '@gamepark/rules-api'

export enum Gold {
  Gold1 = 1,
  Gold5 = 5
}

export const golds = getEnumValues(Gold)
