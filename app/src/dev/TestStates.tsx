import { DevToolEntry } from '@gamepark/react-game'
import { FC } from 'react'

/**
 * Development only: load a saved game state (app/public/test-states, produced by the state tool on port 3100) as its
 * first player, to look at a given phase without playing up to it. Replaces the local game, like game.new() does.
 */
const states = [
  { file: 'st7-2-r2', label: '7 joueurs · Recrutement T2' },
  { file: 'st7-4-r2', label: '7 joueurs · Déploiement T2' },
  { file: 'st7-12-r2', label: '7 joueurs · Construction T2' },
  { file: 'st7-2-r3', label: '7 joueurs · Recrutement T3 (jetons Âge)' },
  { file: 'st7-7-r3', label: '7 joueurs · Effet de déploiement à choisir T3' },
  { file: 'st7-12-r3', label: '7 joueurs · Construction T3' },
  { file: 'st7-16-r3', label: '7 joueurs · Effet mystique T3' },
  { file: 'st7-end', label: '7 joueurs · Fin de partie' },
  { file: 'st2-2-r2', label: '2 joueurs · Recrutement T2' },
  { file: 'st2-4-r2', label: '2 joueurs · Déploiement T2' },
  { file: 'st2-12-r2', label: '2 joueurs · Construction T2' },
  { file: 'ext4-deploy-artifact', label: 'Extensions, 4 joueurs · Déploiement avec un artefact' },
  { file: 'ext4-deploy-choice', label: 'Extensions, 4 joueurs · Effet de déploiement à choisir' },
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
