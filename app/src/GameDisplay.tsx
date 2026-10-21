import { css } from '@emotion/react'
import { DevToolsHub, GameTable, GameTableNavigation } from '@gamepark/react-game'
import { FC } from 'react'
import { CardsCatalogue } from './dev/CardsCatalogue'
import { TestStates } from './dev/TestStates'
import { tableBoundaries } from './locators/TableLayout'
import { zoomButtonCss } from './theme/tableTheme'
import { PlayerPanels } from './panels/PlayerPanels'
import { TurnOrderArrows } from './panels/TurnOrderArrows'
import { BuildInfo } from './table/BuildInfo'
import { DeployGold } from './table/DeployGold'
import { DraftDirection } from './table/DraftDirection'
import { ExpansionRulesButton } from './table/ExpansionRulesButton'
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
    <SideColumn />
    <DraftDirection />
    <DeployGold />
    <BuildInfo />
    <WarInfo />
    <WarResults />
    <AgeFates />
    <ViewButtons />
    <ExpansionRulesButton />
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

/**
 * The zoom buttons stay on the screen, not on the table: on its right edge, one above the other, at mid-height, where the
 * right column leaves a free strip beside the deck whatever the shape of the screen
 */
const navigationCss = css`
  font-size: calc(3.2em * var(--gp-scale));
  flex-direction: column;
  gap: 0.25em;
  top: 50%;
  margin-top: -1.8em;
  left: auto;
  right: 0.3em;

  > button {
    ${zoomButtonCss};
  }
`
