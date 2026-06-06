import { PaperTalesOptionsSpec } from '@gamepark/paper-tales/PaperTalesOptions'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PaperTalesSetup } from '@gamepark/paper-tales/PaperTalesSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { paperTalesAnimation } from './animations/PaperTalesAnimations'
import App from './App'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="paper-tales"
      Rules={PaperTalesRules}
      optionsSpec={PaperTalesOptionsSpec}
      GameSetup={PaperTalesSetup}
      material={Material}
      locators={Locators}
      animations={paperTalesAnimation}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
