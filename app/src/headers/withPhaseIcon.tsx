import { ComponentType } from 'react'
import { PhaseIcon } from './PhaseIcon'

/** A header of a step of the turn, after the icon of its phase */
export const withPhaseIcon = (Header: ComponentType): ComponentType => {
  const WithPhaseIcon = () => (
    <>
      <PhaseIcon />
      <Header />
    </>
  )
  return WithPhaseIcon
}
