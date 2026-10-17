import { useMaterialContext } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'
import { getRound } from '../locators/TableLayout'

/**
 * The remaining cards go to the left on rounds 1 and 3, to the right on rounds 2 and 4 (rulebook p.5)
 */
export const GiveDraftToNeighborHeader = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  return <>{getRound(context) % 2 === 1 ? t('header.pass.left', 'The cards pass to the left') : t('header.pass.right', 'The cards pass to the right')}</>
}
