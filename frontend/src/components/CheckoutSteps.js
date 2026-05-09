import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Icon from './Icon'

const STEPS = [
  { key: 'step1', label: 'Sign in', to: '/login' },
  { key: 'step2', label: 'Shipping', to: '/shipping' },
  { key: 'step3', label: 'Payment', to: '/payment' },
  { key: 'step4', label: 'Place order', to: '/placeorder' },
]

const CheckoutSteps = (props) => {
  const { userInfo } = useSelector((s) => s.userLogin)
  const enabledFlags = STEPS.map((s) => Boolean(props[s.key]))
  const currentIdx = enabledFlags.lastIndexOf(true)

  return (
    <nav className='ps-stepper' aria-label='Checkout progress'>
      {STEPS.map((s, i) => {
        const enabled = enabledFlags[i]
        const isCurrent = i === currentIdx
        const isDone = enabled && i < currentIdx
        const cls = `ps-step${isCurrent ? ' is-current' : ''}${isDone ? ' is-done' : ''}`
        // Sign-in step becomes static once user authenticated — clicking /login
        // when already logged in bounces to home and wipes checkout progress.
        const isSignInDone = s.to === '/login' && userInfo
        const linkable = enabled && !isSignInDone
        const inner = (
          <>
            <span className='ps-step-num' aria-hidden='true'>
              {isDone || isSignInDone ? <Icon name='check' size={14} /> : i + 1}
            </span>
            <span>{s.label}</span>
          </>
        )
        return (
          <React.Fragment key={s.key}>
            {linkable ? (
              <Link to={s.to} className={cls} aria-current={isCurrent ? 'step' : undefined}>
                {inner}
              </Link>
            ) : (
              <span
                className={`${cls}${isSignInDone ? ' is-done' : ''}`}
                aria-disabled='true'
              >
                {inner}
              </span>
            )}
            {i < STEPS.length - 1 && <span className='ps-step-line' aria-hidden='true' />}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default CheckoutSteps
