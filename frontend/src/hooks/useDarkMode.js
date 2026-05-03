import { useState, useEffect } from 'react'

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode') === 'true'
    if (saved) document.body.classList.add('dark-theme')
    return saved
  })

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
    localStorage.setItem('darkMode', isDark)
  }, [isDark])

  const toggleDarkMode = () => setIsDark((prev) => !prev)

  return [isDark, toggleDarkMode]
}

export default useDarkMode
