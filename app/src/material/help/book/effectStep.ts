import { isDeploymentType } from '@gamepark/paper-tales/material/effects/2_DeploymentEffects'
import { isWarType } from '@gamepark/paper-tales/material/effects/3_WarEffects'
import { isIncomeType } from '@gamepark/paper-tales/material/effects/4_IncomeEffects'
import { isBuildEffect } from '@gamepark/paper-tales/material/effects/5_Build'
import { isAgeEffect } from '@gamepark/paper-tales/material/effects/6_AgeEffects'
import { isRelicEffect } from '@gamepark/paper-tales/material/effects/7_EndGameEffects'
import { Effect } from '@gamepark/paper-tales/material/effects/Effect'

/** The step of the turn (0 to 5, 6 for the end of the game) a printed effect acts at */
export const effectStep = (effect: Effect) => {
  if (isDeploymentType(effect)) return 1
  if (isWarType(effect)) return 2
  if (isIncomeType(effect)) return 3
  if (isBuildEffect(effect)) return 4
  if (isAgeEffect(effect)) return 5
  if (isRelicEffect(effect)) return 6
  return undefined
}
