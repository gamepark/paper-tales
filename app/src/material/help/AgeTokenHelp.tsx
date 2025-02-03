/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialHelpProps, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export const AgeTokenHelp: FC<MaterialHelpProps> = (props) => {
  const rules = useRules<PaperTalesRules>()!
  const { item } = props
  const { t } = useTranslation()
  const onUnit = item.location?.parent 
  const howManyTokensOnUnit = onUnit ? rules.material(MaterialType.Age).location(LocationType.OnCard).parent(onUnit).getQuantity() : -1
  console.log("help age : ",onUnit, howManyTokensOnUnit)
  return (
    <>
      <h2 css={titleCss}>{t('age.help.title')}</h2>
      <p>
        <Trans defaults="age.help.text" values={{ place: item.location!.id }}>
          <strong/>
        </Trans>
      </p>
      {howManyTokensOnUnit > 0 && (
        <p>
          <Trans defaults={'age.on.unit.count'} 
                 values={{ageCount: howManyTokensOnUnit}}/>
        </p>
      )}
    </>
  )
}

const titleCss = css`
  margin-bottom: 0.5em !important;
`