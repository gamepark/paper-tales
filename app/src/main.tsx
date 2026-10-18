import { PaperTalesBot } from '@gamepark/paper-tales/PaperTalesBot'
import { PaperTalesOptionsSpecV2 } from '@gamepark/paper-tales/PaperTalesOptions'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PaperTalesSetup } from '@gamepark/paper-tales/PaperTalesSetup'
import { GameProvider } from '@gamepark/react-game'
import { MaterialGame } from '@gamepark/rules-api'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { paperTalesAnimation } from './animations/PaperTalesAnimations'
import { PaperTalesLogs } from './logs/PaperTalesLogs'
import { PaperTalesScoring } from './scoring/PaperTalesScoring'
import { theme } from './theme'
import App from './App'
import { Locators } from './locators/Locators'
import { Material, materialI18n } from './material/Material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="paper-tales"
      Rules={PaperTalesRules}
      optionsSpec={PaperTalesOptionsSpecV2}
      GameSetup={PaperTalesSetup}
      material={Material}
      materialI18n={materialI18n}
      locators={Locators}
      animations={paperTalesAnimation}
      theme={theme}
      logs={new PaperTalesLogs()}
      scoring={new PaperTalesScoring()}
      ai={(game: MaterialGame, playerId: number) => Promise.resolve(new PaperTalesBot(playerId).run(game))}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
