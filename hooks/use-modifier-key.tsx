'use client'

import { useEffect, useState } from 'react'

export function useModifierKey() {
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    setIsMac(
      typeof navigator !== 'undefined' &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform),
    )
  }, [])

  return isMac ? '⌘' : 'Ctrl'
}
