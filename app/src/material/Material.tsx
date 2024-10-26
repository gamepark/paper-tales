import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { unitCardDescription } from './UnitCardDescription'
import { goldCoinDescription } from './GoldCoinDescription'
import { ageTokenDescription } from './AgeTokenDescription'
import { buildingCardDescription } from './BuildingCardDescription'
import { scoreBoardDescription } from './ScoreBoardDescription'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {

    [MaterialType.Unit]: unitCardDescription,
    [MaterialType.Gold]: goldCoinDescription,
    [MaterialType.Age]: ageTokenDescription,
    [MaterialType.Building]: buildingCardDescription,
    [MaterialType.ScoreBoard]: scoreBoardDescription,

}
