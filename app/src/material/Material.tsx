import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { unitCardDescription } from './UnitCardDescription'
import { goldCoinDescription } from './goldCoinDescription'
import { ageTokenDescription } from './ageTokenDescription'
import { buildingCardDescription } from './BuildingCardDescription'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {

    [MaterialType.Unit]: unitCardDescription,
    [MaterialType.Gold]: goldCoinDescription,
    [MaterialType.Age]: ageTokenDescription,
    [MaterialType.Building]: buildingCardDescription,

}
