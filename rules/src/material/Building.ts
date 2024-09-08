import { getEnumValues } from '@gamepark/rules-api'

export enum Building {
    Mine = 1,
    Temple,
    Tavern,
    Barracks,
    Town,
}

export const buildings = getEnumValues(Building)