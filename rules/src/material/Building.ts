import { getEnumValues } from '@gamepark/rules-api'

export enum Building {
  // Base game
  Mine = 1,
  Temple,
  Tavern,
  Barracks,
  Town,
  // Beyond the gates
  Abbey,
  Library,
  Crypt,
  BlackMarket,
  BackRoom,
  Port,
  // What forges legends
  Inn,
  Sawmill,
  RoyalPalace
}

export const buildings = getEnumValues(Building)

export const baseGameBuildings = [Building.Mine, Building.Temple, Building.Tavern, Building.Barracks, Building.Town]

/** The buildings every Monarch has when the buildings of Beyond the gates are drawn at random (rulebook p.9) */
export const permanentBuildings = [Building.Mine, Building.Temple, Building.Tavern, Building.Town]

export const beyondTheGatesBuildings = [Building.Abbey, Building.Library, Building.Crypt, Building.BlackMarket, Building.BackRoom, Building.Port]

export const whatForgesLegendsBuildings = [Building.Inn, Building.Sawmill, Building.RoyalPalace]
