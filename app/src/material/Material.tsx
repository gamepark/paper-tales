import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { unitCardDescription } from './UnitCardDescription'
import { goldCoinDescription } from './GoldCoinDescription'
import { ageTokenDescription } from './AgeTokenDescription'
import { buildingCardDescription } from './BuildingCardDescription'
import { frenchBuildingCardDescription } from './FrenchBuildingCardDescription'
import { frenchUnitCardDescription } from './FrenchUnitCardDescription'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.Unit]: unitCardDescription,
  [MaterialType.Gold]: goldCoinDescription,
  [MaterialType.Age]: ageTokenDescription,
  [MaterialType.Building]: buildingCardDescription
}

/** The French edition of the cards, used when the game is played in French (the English edition is the fallback) */
export const materialI18n: Record<string, Partial<Record<MaterialType, MaterialDescription>>> = {
  fr: {
    [MaterialType.Unit]: frenchUnitCardDescription,
    [MaterialType.Building]: frenchBuildingCardDescription
  }
}
