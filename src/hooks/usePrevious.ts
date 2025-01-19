import { useEffect, useRef } from 'react'

/**
 * Hook to retrieve the previous value of a prop or state.
 * @param value - The current value.
 * @returns The previous value, or `undefined` if it doesn't exist.
 */
const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export default usePrevious
