import React from 'react'
import { ProgressBar } from 'react-bootstrap'

const STEPS = [
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
]

const CheckoutStepperV2 = ({ currentStep, onStepClick }) => {
  const stepIndex = STEPS.findIndex((s) => s.key === currentStep)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  return (
    <div className='checkout-stepper-v2 mb-4'>
      <ProgressBar
        now={progress}
        className='checkout-stepper-v2__progress'
      />
      <div className='checkout-stepper-v2__steps d-flex justify-content-between mt-2'>
        {STEPS.map((step, index) => {
          const isCompleted = index < stepIndex
          const isCurrent = index === stepIndex
          return (
            <div
              key={step.key}
              className={`checkout-stepper-v2__step ${
                isCurrent ? 'current' : isCompleted ? 'completed' : ''
              }`}
              role='button'
              tabIndex={0}
              onClick={() => isCompleted && onStepClick(step.key)}
              onKeyDown={(e) =>
                isCompleted && e.key === 'Enter' && onStepClick(step.key)
              }
            >
              <div className='checkout-stepper-v2__circle'>
                {isCompleted ? (
                  <i className='fas fa-check'></i>
                ) : (
                  index + 1
                )}
              </div>
              <span className='checkout-stepper-v2__label'>{step.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CheckoutStepperV2
