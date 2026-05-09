import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Icon from './Icon'
import useFeatureEnabled from '../hooks/useFeatureEnabled'

const SearchBox = ({ history }) => {
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapRef = useRef(null)

  const autosuggestEnabled = useFeatureEnabled('search_autosuggest')

  useEffect(() => {
    if (!autosuggestEnabled || !keyword.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await axios.get('/api/products/suggest', {
          params: { q: keyword },
        })
        setSuggestions(data)
        setShowDropdown(data.length > 0)
        setActiveIndex(-1)
      } catch {
        setSuggestions([])
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [keyword, autosuggestEnabled])

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const navigateTo = (k) => {
    setShowDropdown(false)
    if (k && k.trim()) history.push(`/search/${k}`)
    else history.push('/')
  }

  const submitHandler = (e) => {
    e.preventDefault()
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      pickSuggestion(suggestions[activeIndex]._id)
      return
    }
    navigateTo(keyword)
  }

  const pickSuggestion = (id) => {
    setKeyword('')
    setSuggestions([])
    setShowDropdown(false)
    history.push(`/product/${id}`)
  }

  const onKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  return (
    <form onSubmit={submitHandler} role='search' className='ps-search' ref={wrapRef}>
      <span className='ps-search-icon' aria-hidden='true'>
        <Icon name='search' size={18} />
      </span>
      <input
        type='text'
        name='q'
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder='Search products…'
        aria-label='Search products'
        autoComplete='off'
        role='combobox'
        aria-autocomplete='list'
        aria-expanded={showDropdown}
        aria-controls='ps-search-suggestions'
        aria-activedescendant={
          activeIndex >= 0 && suggestions[activeIndex]
            ? `ps-search-option-${suggestions[activeIndex]._id}`
            : undefined
        }
      />
      {showDropdown && suggestions.length > 0 && (
        <ul
          id='ps-search-suggestions'
          role='listbox'
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            listStyle: 'none',
            margin: 0,
            padding: 4,
            background: 'var(--surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {suggestions.map((s, idx) => (
            <li
              key={s._id}
              id={`ps-search-option-${s._id}`}
              role='option'
              aria-selected={idx === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault()
                pickSuggestion(s._id)
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--fg)',
                background: idx === activeIndex ? 'var(--surface-alt)' : 'transparent',
              }}
            >
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </form>
  )
}

export default SearchBox
