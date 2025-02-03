/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { MaterialHelpProps } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'

export const TimeTokenHelp: FC<MaterialHelpProps> = (props) => {
  const { item } = props
  const { t } = useTranslation()
  return (
    <>
      <h2 css={titleCss}>{t('time.help.title')}</h2>
      <p>
        <Trans defaults="time.help.text" values={{ place: item.location!.id }}>
          <strong/>
        </Trans>
      </p>
    </>
  )
}

const titleCss = css`
  margin-bottom: 0.5em !important;
`