import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'darkMode'

const getInitial = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'true') return true
  if (saved === 'false') return false
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

const apply = (isDark) => {
  const root = document.documentElement
  if (isDark) root.setAttribute('data-theme', 'dark')
  else root.removeAttribute('data-theme')
}

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const initial = getInitial()
    apply(initial)
    return initial
  })

  useEffect(() => {
    apply(isDark)
    localStorage.setItem(STORAGE_KEY, isDark)
  }, [isDark])

  const toggleDarkMode = useCallback(() => setIsDark((prev) => !prev), [])
  return [isDark, toggleDarkMode]
}

export default useDarkMode
