import { getEnumValues } from '@gamepark/rules-api'

export enum Age {
    Age1 = 1
}

export const buildings = getEnumValues(Age)