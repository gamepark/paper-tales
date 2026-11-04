import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { useRules } from '@gamepark/react-game'
import { ComponentType } from 'react'
import { isWarAnnounced } from '../material/help/book/phases'
import { PhaseIcon } from './PhaseIcon'
import { WarAnnouncedHeader } from './WarHeader'

/**
 * A header of a step of the turn, after the icon of its phase. While a popup of the tutorial announces the wars, the header
 * of the wars, for the header to say what the popup says.
 */
export const withPhaseIcon = (Header: ComponentType): ComponentType => {
  const WithPhaseIcon = () => {
    const rules = useRules<PaperTalesRules>()!
    return (
      <>
        <PhaseIcon />
        {isWarAnnounced(rules) ? <WarAnnouncedHeader /> : <Header />}
      </>
    )
  }
  return WithPhaseIcon
}
