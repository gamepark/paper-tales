import { css, keyframes } from '@emotion/react'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialContext } from '@gamepark/react-game'
import { useEffect, useState, useSyncExternalStore } from 'react'

/**
 * The wars are told beat by beat once they start, while the animations pause on them (see PaperTalesAnimations): the
 * front rows and the strengths of the kingdoms (see FrontRows, WarInfo), the war against the left neighbour, the one
 * against the right neighbour (see WarResults), then the points (see WarGains). Delays in seconds from the start.
 */
export const STRENGTHS_AT = 0.4
export const WAR_RESULTS_AT = [2.9, 5.9]
export const GAINS_AT = 8.9
/** The lines of the gains, one after the other */
export const GAIN_LINE_PACE = 0.5
/** How long the animations pause on the wars before the points are scored: every beat, and time to read the last one */
export const WARS_READING_MS = 11000

/** The beats of the wars, in their order */
export enum WarBeat {
  Strengths,
  FirstWar,
  SecondWar,
  Gains
}

/*
 * The summary of the wars can tell them again (« Replay »): a count of the replays asked for, kept on this screen only,
 * that the beats of the wars follow. It is not a move of the game: nothing changes but what is shown.
 */
let replays = 0
let replaying = false
let replayEnd: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
const notify = () => listeners.forEach((listener) => listener())

/** Tells the wars again, beat by beat */
export const replayWars = () => {
  replays++
  replaying = true
  clearTimeout(replayEnd)
  replayEnd = setTimeout(() => {
    replaying = false
    notify()
  }, WARS_READING_MS)
  notify()
}

/** The number of replays asked for: a key that starts the beats again when it changes */
export const useWarReplays = () => useSyncExternalStore(subscribe, () => replays)

const useReplaying = () => useSyncExternalStore(subscribe, () => replaying)

/** The wars are being told: when they start, or when the summary tells them again */
export const useWarsTold = (context: MaterialContext) => {
  const replay = useReplaying()
  const rule = context.rules.game.rule?.id
  return rule === RuleId.War || (rule === RuleId.WarSummary && replay)
}

const beatTimes = [WAR_RESULTS_AT[0], WAR_RESULTS_AT[1], GAINS_AT]

/** The beat of the wars reached since they started to be told, for the header */
export const useWarBeat = (): WarBeat => {
  const replay = useWarReplays()
  const [beat, setBeat] = useState(WarBeat.Strengths)
  useEffect(() => {
    setBeat(WarBeat.Strengths)
    const timers = beatTimes.map((time, index) => setTimeout(() => setBeat(index + 1), time * 1000))
    return () => timers.forEach(clearTimeout)
  }, [replay])
  return beat
}

const popIn = keyframes`
  from {
    opacity: 0;
    scale: 1.6;
  }
`

/** What comes in with a beat of the wars, at its delay (the individual scale leaves the transform free) */
export const beatCss = (delay: number) => css`
  animation: ${popIn} 0.45s cubic-bezier(0.2, 1.5, 0.4, 1) ${delay}s both;

  @media (prefers-reduced-motion: reduce) {
    animation: ${popIn} 0.01s ${delay}s both;
  }
`
