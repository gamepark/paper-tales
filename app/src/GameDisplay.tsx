import { css } from '@emotion/react'
import { DevToolsHub, GameTable, GameTableNavigation } from '@gamepark/react-game'
import { FC } from 'react'
import { CardsCatalogue } from './dev/CardsCatalogue'
import { TestStates } from './dev/TestStates'
import { tableBoundaries } from './locators/TableLayout'
import { PlayerPanels } from './panels/PlayerPanels'
import { DraftPassFlights } from './panels/DraftPassFlights'
import { TurnOrderArrows } from './panels/TurnOrderArrows'
import { BuildInfo } from './table/BuildInfo'
import { DeployGold } from './table/DeployGold'
import { DraftDirection } from './table/DraftDirection'
import { SideColumn } from './table/SideColumn'
import { ViewButtons } from './table/ViewButtons'
import { WarInfo } from './table/WarInfo'
import { WarResults } from './table/WarResults'
import { AgeFates } from './table/AgeFates'

export const GameDisplay: FC = () => (
  <GameTable {...tableBoundaries} verticalCenter css={process.env.NODE_ENV === 'development' && tableBorder}>
    <GameTableNavigation css={navigationCss} />
    <PlayerPanels />
    <TurnOrderArrows />
    <DraftPassFlights />
    <SideColumn />
    <DraftDirection />
    <DeployGold />
    <BuildInfo />
    <WarInfo />
    <WarResults />
    <AgeFates />
    <ViewButtons />
    {process.env.NODE_ENV === 'development' && (
      <DevToolsHub fabBottom="calc(5em)">
        <TestStates />
        <CardsCatalogue />
      </DevToolsHub>
    )}
  </GameTable>
)

const tableBorder = css`
  border: 1px solid white;
`

const navigationCss = css`
  top: auto;
  bottom: 1em;
  left: auto;
  right: 1em;
`
