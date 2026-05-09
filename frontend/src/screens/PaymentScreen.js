import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormContainer from '../components/FormContainer'
import CheckoutSteps from '../components/CheckoutSteps'
import Icon from '../components/Icon'
import { savePaymentMethod } from '../actions/cartActions'
import useFeatureEnabled from '../hooks/useFeatureEnabled'

const PaymentScreen = ({ history }) => {
  const dispatch = useDispatch()
  const { shippingAddress } = useSelector((s) => s.cart)
  const multiStepCheckoutEnabled = useFeatureEnabled('multi_step_checkout_v2')
  const [paymentMethod, setPaymentMethod] = useState('PayPal')

  useEffect(() => {
    if (multiStepCheckoutEnabled) history.push('/checkout')
  }, [multiStepCheckoutEnabled, history])

  if (multiStepCheckoutEnabled) return null
  if (!shippingAddress.address) {
    history.push('/shipping')
    return null
  }

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(savePaymentMethod(paymentMethod))
    history.push('/placeorder')
  }

  const Option = ({ value, label, hint, icon }) => {
    const checked = paymentMethod === value
    return (
      <label
        style={{
          display: 'flex',
          gap: 12,
          padding: 16,
          border: `1px solid ${checked ? 'var(--accent)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          background: checked ? 'var(--accent-soft)' : 'var(--surface)',
          transition: 'border-color var(--motion-base), background-color var(--motion-base)',
        }}
      >
        <input
          type='radio'
          name='paymentMethod'
          value={value}
          checked={checked}
          onChange={(e) => setPaymentMethod(e.target.value)}
          style={{ marginTop: 4 }}
        />
        <span style={{ flex: 1 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
            <Icon name={icon} size={18} /> {label}
          </span>
          <span className='ps-help' style={{ marginTop: 4 }}>{hint}</span>
        </span>
      </label>
    )
  }

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1 style={{ marginBottom: 24 }}>Payment method</h1>
      <form onSubmit={submitHandler}>
        <fieldset style={{ border: 0, padding: 0, margin: 0, marginBottom: 24 }}>
          <legend className='ps-label'>Choose how you'd like to pay</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Option
              value='PayPal'
              label='PayPal or credit card'
              hint='Pay with your PayPal account or a saved card.'
              icon='creditCard'
            />
          </div>
        </fieldset>
        <button type='submit' className='ps-btn ps-btn-primary'>Continue to review</button>
      </form>
    </FormContainer>
  )
}

export default PaymentScreen
