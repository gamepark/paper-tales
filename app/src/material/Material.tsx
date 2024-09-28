import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { unitCardDescription } from './UnitCardDescription'
import { goldCoinDescription } from './goldCoinDescription'
import { ageTokenDescription } from './ageTokenDescription'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {

    [MaterialType.Unit]: unitCardDescription,
    [MaterialType.Gold]: goldCoinDescription,
    [MaterialType.Age]: ageTokenDescription,

}
