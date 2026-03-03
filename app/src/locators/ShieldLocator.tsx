/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationDescription, Locator } from '@gamepark/react-game'
import { ShieldIcon } from './component/Shield'

class ShieldLocator extends Locator {
  locationDescription = new ShieldDescription()

  coordinates = { x: 0, y: 3, z: 5 }
}

class ShieldDescription extends LocationDescription {
  extraCss = css`
    pointer-events: auto !important;
  `
  height = 1
  ratio = 1.5

  content = ShieldIcon
}

export const shieldLocator = new ShieldLocator()
