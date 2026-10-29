import { useEffect, useRef, useState } from 'react'

export type ValueDelta = { amount: number; id: number }

/**
 * The last change of a value, for as long as its bubble is shown: null when the value has not changed lately. Changes in
 * the same direction while the bubble is shown add up (the coins of an income come one by one), and the id changes at
 * every change, so that the bubble plays again with the new amount.
 */
export const useValueDelta = (value: number, durationMs = 1800): ValueDelta | null => {
  const previous = useRef(value)
  const [delta, setDelta] = useState<ValueDelta | null>(null)

  useEffect(() => {
    const amount = value - previous.current
    previous.current = value
    if (!amount) return
    setDelta((current) => {
      const sameWay = current !== null && Math.sign(current.amount) === Math.sign(amount)
      return { amount: sameWay ? current.amount + amount : amount, id: (current?.id ?? 0) + 1 }
    })
    const timeout = setTimeout(() => setDelta(null), durationMs)
    return () => clearTimeout(timeout)
  }, [value, durationMs])

  return delta
}
