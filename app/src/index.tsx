/** @jsxImportSource @emotion/react */
import { PaperTalesOptionsSpec } from '@gamepark/paper-tales/PaperTalesOptions'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PaperTalesSetup } from '@gamepark/paper-tales/PaperTalesSetup'
import { GameProvider, setupTranslation } from '@gamepark/react-game'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { paperTalesAnimation } from './animations/PaperTalesAnimations'
import App from './App'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'
import translations from './translations.json'

setupTranslation(translations, { debug: false })

ReactDOM.render(
  <StrictMode>
    <GameProvider 
    game="paper-tales" 
    Rules={PaperTalesRules} 
    optionsSpec={PaperTalesOptionsSpec} 
    GameSetup={PaperTalesSetup}
      material={Material} 
      locators={Locators} 
      animations={paperTalesAnimation}>
      <App />
    </GameProvider>
  </StrictMode>,
  document.getElementById('root')
)
