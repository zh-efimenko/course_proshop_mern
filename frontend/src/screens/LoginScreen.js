import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import FormContainer from '../components/FormContainer'
import Icon from '../components/Icon'
import { login } from '../actions/userActions'

const LoginScreen = ({ location, history }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const dispatch = useDispatch()

  const { loading, error, userInfo } = useSelector((s) => s.userLogin)
  const redirect = location.search ? location.search.split('=')[1] : '/'

  useEffect(() => {
    if (userInfo) history.push(redirect)
  }, [history, userInfo, redirect])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(login(email, password))
  }

  return (
    <FormContainer narrow>
      <h1 style={{ marginBottom: 8 }}>Sign in</h1>
      <p className='ps-secondary' style={{ marginBottom: 24 }}>
        Welcome back. Enter your credentials to continue.
      </p>

      {error && (
        <div style={{ marginBottom: 16 }} role='alert' aria-live='assertive'>
          <Message variant='danger'>{error}</Message>
        </div>
      )}

      <form onSubmit={submitHandler} noValidate>
        <div className='ps-field'>
          <label htmlFor='email' className='ps-label'>Email</label>
          <input
            id='email'
            className='ps-input'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete='email'
            required
          />
        </div>

        <div className='ps-field'>
          <label htmlFor='password' className='ps-label'>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id='password'
              className='ps-input'
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='current-password'
              required
              style={{ paddingRight: 44 }}
            />
            <button
              type='button'
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
              aria-pressed={showPwd}
              className='ps-btn ps-btn-icon'
              style={{ position: 'absolute', right: 4, top: 4, width: 32, height: 32 }}
            >
              <Icon name={showPwd ? 'eyeOff' : 'eye'} size={16} />
            </button>
          </div>
        </div>

        <button
          type='submit'
          className='ps-btn ps-btn-primary ps-btn-block ps-btn-lg'
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? <Loader inline label='Signing in' /> : 'Sign in'}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 'var(--text-body-sm)', color: 'var(--fg-secondary)' }}>
        New to ProShop?{' '}
        <Link to={redirect ? `/register?redirect=${redirect}` : '/register'}>
          Create an account
        </Link>
      </p>
    </FormContainer>
  )
}

export default LoginScreen
