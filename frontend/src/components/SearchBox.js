import React, { useState, useEffect } from 'react'
import { Form, Button, ListGroup } from 'react-bootstrap'
import axios from 'axios'
import useFeatureEnabled from '../hooks/useFeatureEnabled'

const SearchBox = ({ history }) => {
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

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
      } catch {
        setSuggestions([])
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [keyword, autosuggestEnabled])

  const submitHandler = (e) => {
    e.preventDefault()
    setShowDropdown(false)
    if (keyword.trim()) {
      history.push(`/search/${keyword}`)
    } else {
      history.push('/')
    }
  }

  const suggestionClickHandler = (id) => {
    setKeyword('')
    setSuggestions([])
    setShowDropdown(false)
    history.push(`/product/${id}`)
  }

  const blurHandler = () => {
    setTimeout(() => setShowDropdown(false), 150)
  }

  return (
    <Form onSubmit={submitHandler} inline>
      <div style={{ position: 'relative' }}>
        <Form.Control
          type='text'
          name='q'
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onBlur={blurHandler}
          placeholder='Search Products...'
          className='mr-sm-2 ml-sm-5'
        ></Form.Control>
        {showDropdown && suggestions.length > 0 && (
          <ListGroup
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              zIndex: 1000,
              width: '300px',
            }}
          >
            {suggestions.map((s) => (
              <ListGroup.Item
                key={s._id}
                action
                onClick={() => suggestionClickHandler(s._id)}
              >
                {s.name}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>
      <Button type='submit' variant='outline-success' className='p-2'>
        Search
      </Button>
    </Form>
  )
}

export default SearchBox
