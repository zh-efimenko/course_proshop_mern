import React from 'react'
import Icon from './Icon'

const STEPS = [
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
]

const CheckoutStepperV2 = ({ currentStep, onStepClick }) => {
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep)
  return (
    <nav className='ps-stepper' aria-label='Checkout progress'>
      {STEPS.map((step, index) => {
        const isCompleted = index < stepIndex
        const isCurrent = index === stepIndex
        const clickable = isCompleted && onStepClick
        const cls = `ps-step${isCurrent ? ' is-current' : ''}${isCompleted ? ' is-done' : ''}`
        const inner = (
          <>
            <span className='ps-step-num' aria-hidden='true'>
              {isCompleted ? <Icon name='check' size={14} /> : index + 1}
            </span>
            <span>{step.label}</span>
          </>
        )
        return (
          <React.Fragment key={step.key}>
            {clickable ? (
              <button
                type='button'
                className={cls}
                onClick={() => onStepClick(step.key)}
                style={{ border: 0, background: 'transparent', cursor: 'pointer' }}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {inner}
              </button>
            ) : (
              <span className={cls} aria-current={isCurrent ? 'step' : undefined}>
                {inner}
              </span>
            )}
            {index < STEPS.length - 1 && <span className='ps-step-line' aria-hidden='true' />}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

export default CheckoutStepperV2
