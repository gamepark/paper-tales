import { DevToolEntry } from '@gamepark/react-game'
import { FC } from 'react'

/**
 * Development only: load a saved game state (app/public/test-states, produced by the state tool on port 3100) as its
 * first player, to look at a given phase without playing up to it. Replaces the local game, like game.new() does.
 */
// The files are named after the phase, never after its rule id, so that a new rule does not shift them
const states = [
  { file: 'st7-draft-r2', label: '7 joueurs · Recrutement T2' },
  { file: 'st7-deploy-r2', label: '7 joueurs · Déploiement T2' },
  { file: 'st7-war-summary-r2', label: '7 joueurs · Bilan des guerres T2' },
  { file: 'st7-build-r2', label: '7 joueurs · Construction T2' },
  { file: 'st7-mystic-r2', label: '7 joueurs · Effet mystique T2' },
  { file: 'st7-draft-r3', label: '7 joueurs · Recrutement T3 (jetons Âge)' },
  { file: 'st7-age-tokens', label: '7 joueurs · Construction T3 (9, 6 et 3 jetons Âge)' },
  { file: 'st7-deploy-choice-r3', label: '7 joueurs · Effet de déploiement à choisir T3' },
  { file: 'st7-build-r3', label: '7 joueurs · Construction T3' },
  { file: 'st7-mystic-r3', label: '7 joueurs · Effet mystique T3' },
  { file: 'st7-end', label: '7 joueurs · Fin de partie' },
  { file: 'st2-draft-r2', label: '2 joueurs · Recrutement T2' },
  { file: 'st2-deploy-r2', label: '2 joueurs · Déploiement T2' },
  { file: 'st2-war-summary-r2', label: '2 joueurs · Bilan des guerres T2' },
  { file: 'st2-build-r2', label: '2 joueurs · Construction T2' },
  { file: 'ext4-deploy-artifact', label: 'Extensions, 4 joueurs · Déploiement avec un artefact' },
  { file: 'ext4-deploy-choice', label: 'Extensions, 4 joueurs · Effet de déploiement à choisir' },
  { file: 'ext4-war-summary-r2', label: 'Extensions, 4 joueurs · Bilan des guerres T2' },
  { file: 'ext4-build-r2', label: 'Extensions, 4 joueurs · Construction T2' },
  { file: 'ext4-build-r4', label: 'Extensions, 4 joueurs · Construction T4' }
]

const GAME_KEY = 'paper-tales'

const loadState = async (file: string) => {
  const saved = await (await fetch(`/test-states/${file}.json`)).json()
  saved.setup = saved.state
  saved.actions = []
  saved.monkeyOpponents = false
  saved.playerId = saved.state.players[0]
  localStorage.setItem(GAME_KEY, JSON.stringify(saved))
  window.location.href = `?player=${saved.playerId}`
}

export const TestStates: FC = () => (
  <>
    {states.map(({ file, label }) => (
      <DevToolEntry key={file} icon="▶" label={label} desc={file} onClick={() => loadState(file)} />
    ))}
  </>
)
