import { css } from '@emotion/react'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { ResourceIcon } from './HelpIcons'

/** What the card brings to the Kingdom (the scroll printed on the card), apart from its characteristics */
export const ProductionLine: FC<{ resources: Resources[]; condition?: string }> = ({ resources, condition }) => {
  const { t } = useTranslation()
  return (
    <p css={lineCss}>
      <span css={labelCss}>{t('help.unit.production', 'Production')}</span>
      {resources.map((resource, index) => (
        <ResourceIcon key={index} resource={resource} />
      ))}
      {condition && <span>{condition}</span>}
    </p>
  )
}

const lineCss = css`
  display: flex;
  align-items: center;
  gap: 0.4em;
  margin: -0.3em 0 0.8em;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 700;
`

const labelCss = css`
  margin-right: 0.2em;
  color: #6b6058;
  font-weight: 600;

  &::after {
    content: ' :';
  }
`
