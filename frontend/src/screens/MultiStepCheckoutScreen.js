import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import CheckoutStepperV2 from '../components/CheckoutStepperV2'
import Icon from '../components/Icon'
import { createOrder } from '../actions/orderActions'
import { saveShippingAddress, savePaymentMethod } from '../actions/cartActions'
import { ORDER_CREATE_RESET } from '../constants/orderConstants'
import { USER_DETAILS_RESET } from '../constants/userConstants'
import useFeatureEnabled from '../hooks/useFeatureEnabled'
import '../assets/checkout-v2.css'

const STEPS = ['shipping', 'payment', 'review']
const initialErrors = { address: '', city: '', postalCode: '', country: '' }

const Field = ({ id, label, value, onChange, error: err, autoComplete }) => (
  <div className='ps-field'>
    <label htmlFor={id} className='ps-label'>{label}</label>
    <input
      id={id}
      className={`ps-input${err ? ' ps-input--error' : ''}`}
      type='text'
      value={value}
      onChange={onChange}
      aria-invalid={!!err}
      aria-describedby={err ? `${id}-help` : undefined}
      autoComplete={autoComplete}
    />
    {err && <p id={`${id}-help`} className='ps-help ps-help--error'>{err}</p>}
  </div>
)

const MultiStepCheckoutScreen = ({ history }) => {
  const dispatch = useDispatch()
  const cart = useSelector((s) => s.cart)
  const { shippingAddress, paymentMethod, cartItems } = cart
  const giftMessageEnabled = useFeatureEnabled('gift_message')
  const { order, success, error } = useSelector((s) => s.orderCreate)

  const [currentStep, setCurrentStep] = useState('shipping')
  const [address, setAddress] = useState(shippingAddress.address || '')
  const [city, setCity] = useState(shippingAddress.city || '')
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '')
  const [country, setCountry] = useState(shippingAddress.country || '')
  const [errors, setErrors] = useState(initialErrors)
  const [selectedPayment, setSelectedPayment] = useState(paymentMethod || 'PayPal')
  const [isGift, setIsGift] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')

  useEffect(() => {
    if (success) {
      history.push(`/order/${order._id}`)
      dispatch({ type: USER_DETAILS_RESET })
      dispatch({ type: ORDER_CREATE_RESET })
    }
  }, [history, success, dispatch, order])

  useEffect(() => {
    if (!giftMessageEnabled) { setIsGift(false); setGiftMessage('') }
  }, [giftMessageEnabled])

  const validateShipping = useCallback(() => {
    const e = { ...initialErrors }
    let valid = true
    if (!address.trim()) { e.address = 'Address is required'; valid = false }
    if (!city.trim()) { e.city = 'City is required'; valid = false }
    if (!postalCode.trim()) { e.postalCode = 'Postal code is required'; valid = false }
    if (!country.trim()) { e.country = 'Country is required'; valid = false }
    setErrors(e)
    return valid
  }, [address, city, postalCode, country])

  const goToStep = (step) => setCurrentStep(step)

  const handleContinue = () => {
    if (currentStep === 'shipping') {
      if (!validateShipping()) return
      dispatch(saveShippingAddress({ address, city, postalCode, country }))
      goToStep('payment')
    } else if (currentStep === 'payment') {
      dispatch(savePaymentMethod(selectedPayment))
      goToStep('review')
    }
  }

  const handleBack = () => {
    const idx = STEPS.indexOf(currentStep)
    if (idx > 0) goToStep(STEPS[idx - 1])
    else history.push('/cart')
  }

  const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2)
  const itemsPrice = fmt(cartItems.reduce((acc, it) => acc + it.price * it.qty, 0))
  const shippingPrice = fmt(itemsPrice > 100 ? 0 : 100)
  const taxPrice = fmt(Number((0.15 * itemsPrice).toFixed(2)))
  const totalPrice = (Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)).toFixed(2)

  const placeOrderHandler = () => {
    dispatch(createOrder({
      orderItems: cartItems,
      shippingAddress: cart.shippingAddress,
      paymentMethod: cart.paymentMethod,
      itemsPrice, shippingPrice, taxPrice, totalPrice,
      giftMessage: isGift ? giftMessage.trim() : '',
    }))
  }

  const ShippingPanel = (
    <section aria-labelledby='ship-h'>
      <h2 id='ship-h' style={{ marginBottom: 16 }}>Shipping address</h2>
      <Field id='ship-address' label='Street address' value={address}
        onChange={(e) => { setAddress(e.target.value); errors.address && setErrors((p) => ({ ...p, address: '' })) }}
        error={errors.address} autoComplete='street-address' />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Field id='ship-city' label='City' value={city}
          onChange={(e) => { setCity(e.target.value); errors.city && setErrors((p) => ({ ...p, city: '' })) }}
          error={errors.city} autoComplete='address-level2' />
        <Field id='ship-postal' label='Postal code' value={postalCode}
          onChange={(e) => { setPostalCode(e.target.value); errors.postalCode && setErrors((p) => ({ ...p, postalCode: '' })) }}
          error={errors.postalCode} autoComplete='postal-code' />
      </div>
      <Field id='ship-country' label='Country' value={country}
        onChange={(e) => { setCountry(e.target.value); errors.country && setErrors((p) => ({ ...p, country: '' })) }}
        error={errors.country} autoComplete='country-name' />
    </section>
  )

  const PaymentPanel = (
    <section aria-labelledby='pay-h'>
      <h2 id='pay-h' style={{ marginBottom: 16 }}>Payment method</h2>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className='ps-label'>Choose how to pay</legend>
        <label
          style={{
            display: 'flex',
            gap: 12,
            padding: 16,
            border: `1px solid ${selectedPayment === 'PayPal' ? 'var(--accent)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            background: selectedPayment === 'PayPal' ? 'var(--accent-soft)' : 'var(--surface)',
          }}
        >
          <input
            type='radio'
            name='paymentMethod'
            value='PayPal'
            checked={selectedPayment === 'PayPal'}
            onChange={(e) => setSelectedPayment(e.target.value)}
            style={{ marginTop: 4 }}
          />
          <span style={{ flex: 1 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
              <Icon name='creditCard' size={18} /> PayPal or credit card
            </span>
            <span className='ps-help' style={{ marginTop: 4 }}>Pay with PayPal or a saved card.</span>
          </span>
        </label>
      </fieldset>
    </section>
  )

  const ReviewPanel = (
    <section aria-labelledby='review-h' style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 id='review-h'>Review</h2>

      <article className='ps-card'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h3 style={{ marginBottom: 8 }}>Shipping</h3>
            <p style={{ margin: 0, color: 'var(--fg-secondary)' }}>
              {cart.shippingAddress.address}, {cart.shippingAddress.city} {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
            </p>
          </div>
          <button type='button' className='ps-btn ps-btn-ghost ps-btn-sm' onClick={() => goToStep('shipping')}>Edit</button>
        </div>
      </article>

      <article className='ps-card'>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h3 style={{ marginBottom: 8 }}>Payment</h3>
            <p style={{ margin: 0, color: 'var(--fg-secondary)' }}>{cart.paymentMethod}</p>
          </div>
          <button type='button' className='ps-btn ps-btn-ghost ps-btn-sm' onClick={() => goToStep('payment')}>Edit</button>
        </div>
      </article>

      <article className='ps-card'>
        <h3 style={{ marginBottom: 16 }}>Order items</h3>
        {cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {cartItems.map((item, idx) => (
              <li key={idx} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--surface-alt)' }} />
                <Link to={`/product/${item.product}`}>{item.name}</Link>
                <span className='ps-mono'>{item.qty} × ${item.price}</span>
              </li>
            ))}
          </ul>
        )}
      </article>

      {giftMessageEnabled && (
        <article className='ps-card'>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type='checkbox'
              checked={isGift}
              onChange={(e) => { setIsGift(e.target.checked); if (!e.target.checked) setGiftMessage('') }}
            />
            <span style={{ fontWeight: 500 }}>This is a gift</span>
          </label>
          {isGift && (
            <div className='ps-field' style={{ marginTop: 12 }}>
              <label htmlFor='v2-gift' className='ps-label'>Gift message</label>
              <textarea
                id='v2-gift'
                className='ps-textarea'
                rows='3'
                maxLength={200}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder='Add a personal message…'
              />
              <p className='ps-help'>{giftMessage.length}/200</p>
            </div>
          )}
        </article>
      )}
    </section>
  )

  const SummaryRow = ({ label, value, strong }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: strong ? 600 : 400 }}>
      <span>{label}</span>
      <span className='ps-mono'>{value}</span>
    </div>
  )

  return (
    <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h1 style={{ marginBottom: 16 }}>Checkout</h1>
      <CheckoutStepperV2 currentStep={currentStep} onStepClick={goToStep} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 32, alignItems: 'flex-start' }}>
        <div>
          <div className='ps-card'>
            {currentStep === 'shipping' && ShippingPanel}
            {currentStep === 'payment' && PaymentPanel}
            {currentStep === 'review' && ReviewPanel}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <button type='button' className='ps-btn ps-btn-ghost' onClick={handleBack}>
              <Icon name='arrowLeft' size={16} /> {currentStep === 'shipping' ? 'Back to cart' : 'Back'}
            </button>
            {currentStep === 'review' ? (
              <button
                type='button'
                className='ps-btn ps-btn-primary ps-btn-lg'
                disabled={cartItems.length === 0}
                onClick={placeOrderHandler}
              >
                Place order
              </button>
            ) : (
              <button type='button' className='ps-btn ps-btn-primary ps-btn-lg' onClick={handleContinue}>
                Continue <Icon name='arrowRight' size={16} />
              </button>
            )}
          </div>
        </div>

        <aside className='ps-card ps-card--alt' style={{ position: 'sticky', top: 80 }} aria-labelledby='sum-h'>
          <h2 id='sum-h' style={{ marginBottom: 16 }}>Order summary</h2>
          <SummaryRow label='Items' value={`$${itemsPrice}`} />
          <SummaryRow label='Shipping' value={`$${shippingPrice}`} />
          <SummaryRow label='Tax' value={`$${taxPrice}`} />
          <div style={{ borderTop: '1px solid var(--border-strong)', marginTop: 8, paddingTop: 8 }}>
            <SummaryRow label='Total' value={`$${totalPrice}`} strong />
          </div>
          {currentStep === 'review' && error && (
            <div style={{ marginTop: 12 }}><Message variant='danger'>{error}</Message></div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default MultiStepCheckoutScreen
