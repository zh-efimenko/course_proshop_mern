import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import FormContainer from '../components/FormContainer'
import Icon from '../components/Icon'
import { register } from '../actions/userActions'

const scorePassword = (pwd) => {
  let s = 0
  if (pwd.length >= 8) s++
  if (pwd.length >= 12) s++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++
  if (/\d/.test(pwd)) s++
  if (/[^A-Za-z0-9]/.test(pwd)) s++
  return Math.min(s, 4)
}
const STRENGTH_LABEL = ['Too short', 'Weak', 'Okay', 'Good', 'Strong']
const STRENGTH_COLOR = ['var(--fg-muted)', 'var(--danger)', 'var(--warning)', 'var(--info)', 'var(--success)']

const RegisterScreen = ({ location, history }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [message, setMessage] = useState(null)
  const dispatch = useDispatch()

  const { loading, error, userInfo } = useSelector((s) => s.userRegister)
  const redirect = location.search ? location.search.split('=')[1] : '/'

  useEffect(() => { if (userInfo) history.push(redirect) }, [history, userInfo, redirect])

  const score = useMemo(() => scorePassword(password), [password])
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword

  const submitHandler = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }
    setMessage(null)
    dispatch(register(name, email, password))
  }

  return (
    <FormContainer narrow>
      <h1 style={{ marginBottom: 8 }}>Create account</h1>
      <p className='ps-secondary' style={{ marginBottom: 24 }}>
        A few details and you're set. We never share your email.
      </p>

      {(message || error) && (
        <div style={{ marginBottom: 16 }} role='alert'>
          <Message variant='danger'>{message || error}</Message>
        </div>
      )}

      <form onSubmit={submitHandler} noValidate>
        <div className='ps-field'>
          <label htmlFor='name' className='ps-label'>Full name</label>
          <input id='name' className='ps-input' type='text' value={name}
            onChange={(e) => setName(e.target.value)} autoComplete='name' required />
        </div>

        <div className='ps-field'>
          <label htmlFor='email' className='ps-label'>Email</label>
          <input id='email' className='ps-input' type='email' value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete='email' required />
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
              autoComplete='new-password'
              required
              minLength={8}
              aria-describedby='pwd-strength'
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
          {password.length > 0 && (
            <div id='pwd-strength' style={{ marginTop: 8 }} aria-live='polite'>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 999,
                      background: i < score ? STRENGTH_COLOR[score] : 'var(--surface-sunken)',
                      transition: 'background-color var(--motion-base)',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 'var(--text-body-sm)', color: STRENGTH_COLOR[score] }}>
                {STRENGTH_LABEL[score]}
              </span>
            </div>
          )}
          {password.length === 0 && (
            <p className='ps-help'>At least 8 characters. Mix letters, numbers, symbols.</p>
          )}
        </div>

        <div className='ps-field'>
          <label htmlFor='confirm' className='ps-label'>Confirm password</label>
          <input
            id='confirm'
            className={`ps-input${mismatch ? ' ps-input--error' : ''}`}
            type={showPwd ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete='new-password'
            required
            aria-invalid={mismatch}
            aria-describedby='confirm-help'
          />
          {mismatch && (
            <p id='confirm-help' className='ps-help ps-help--error'>Passwords do not match.</p>
          )}
        </div>

        <button
          type='submit'
          className='ps-btn ps-btn-primary ps-btn-block ps-btn-lg'
          disabled={loading || mismatch}
          aria-busy={loading}
        >
          {loading ? <Loader inline label='Creating' /> : 'Create account'}
        </button>
      </form>

      <p style={{ marginTop: 24, fontSize: 'var(--text-body-sm)', color: 'var(--fg-secondary)' }}>
        Already have an account?{' '}
        <Link to={redirect ? `/login?redirect=${redirect}` : '/login'}>Sign in</Link>
      </p>
    </FormContainer>
  )
}

export default RegisterScreen
