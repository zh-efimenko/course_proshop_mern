import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import CheckoutSteps from '../components/CheckoutSteps'
import { createOrder } from '../actions/orderActions'
import { ORDER_CREATE_RESET } from '../constants/orderConstants'
import { USER_DETAILS_RESET } from '../constants/userConstants'
import useFeatureEnabled from '../hooks/useFeatureEnabled'

const PlaceOrderScreen = ({ history }) => {
  const dispatch = useDispatch()
  const [isGift, setIsGift] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')

  const giftMessageEnabled = useFeatureEnabled('gift_message')
  const multiStepCheckoutEnabled = useFeatureEnabled('multi_step_checkout_v2')
  const cart = useSelector((s) => s.cart)
  const { order, success, error } = useSelector((s) => s.orderCreate)

  useEffect(() => {
    if (multiStepCheckoutEnabled) history.push('/checkout')
  }, [multiStepCheckoutEnabled, history])

  useEffect(() => {
    if (success) {
      history.push(`/order/${order._id}`)
      dispatch({ type: USER_DETAILS_RESET })
      dispatch({ type: ORDER_CREATE_RESET })
    }
    // eslint-disable-next-line
  }, [history, success])

  useEffect(() => {
    if (!giftMessageEnabled) { setIsGift(false); setGiftMessage('') }
  }, [giftMessageEnabled])

  if (multiStepCheckoutEnabled) return null
  if (!cart.shippingAddress.address) { history.push('/shipping'); return null }
  if (!cart.paymentMethod) { history.push('/payment'); return null }

  const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2)
  cart.itemsPrice = fmt(cart.cartItems.reduce((acc, it) => acc + it.price * it.qty, 0))
  cart.shippingPrice = fmt(cart.itemsPrice > 100 ? 0 : 100)
  cart.taxPrice = fmt(Number((0.15 * cart.itemsPrice).toFixed(2)))
  cart.totalPrice = (Number(cart.itemsPrice) + Number(cart.shippingPrice) + Number(cart.taxPrice)).toFixed(2)

  const placeOrderHandler = () => {
    dispatch(createOrder({
      orderItems: cart.cartItems,
      shippingAddress: cart.shippingAddress,
      paymentMethod: cart.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
      giftMessage: isGift ? giftMessage.trim() : '',
    }))
  }

  const Row = ({ label, value, strong }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: strong ? 600 : 400 }}>
      <span>{label}</span>
      <span className='ps-mono'>{value}</span>
    </div>
  )

  return (
    <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }}>
      <CheckoutSteps step1 step2 step3 step4 />
      <h1 style={{ marginBottom: 24 }}>Review your order</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 32, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className='ps-card'>
            <h3 style={{ marginBottom: 8 }}>Shipping</h3>
            <p style={{ margin: 0, color: 'var(--fg-secondary)' }}>
              {cart.shippingAddress.address}, {cart.shippingAddress.city} {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
            </p>
          </section>

          <section className='ps-card'>
            <h3 style={{ marginBottom: 8 }}>Payment</h3>
            <p style={{ margin: 0, color: 'var(--fg-secondary)' }}>{cart.paymentMethod}</p>
          </section>

          <section className='ps-card'>
            <h3 style={{ marginBottom: 16 }}>Order items</h3>
            {cart.cartItems.length === 0 ? (
              <Message>Your cart is empty</Message>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {cart.cartItems.map((item, idx) => (
                  <li key={idx} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--surface-alt)' }} />
                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                    <span className='ps-mono'>{item.qty} × ${item.price} = ${(item.qty * item.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {giftMessageEnabled && (
            <section className='ps-card'>
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
                  <label htmlFor='gift-msg' className='ps-label'>Gift message</label>
                  <textarea
                    id='gift-msg'
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
            </section>
          )}
        </div>

        <aside className='ps-card ps-card--alt' style={{ position: 'sticky', top: 80 }} aria-labelledby='summary-h'>
          <h2 id='summary-h' style={{ marginBottom: 16 }}>Order summary</h2>
          <Row label='Items' value={`$${cart.itemsPrice}`} />
          <Row label='Shipping' value={`$${cart.shippingPrice}`} />
          <Row label='Tax' value={`$${cart.taxPrice}`} />
          <div style={{ borderTop: '1px solid var(--border-strong)', marginTop: 8, paddingTop: 8 }}>
            <Row label='Total' value={`$${cart.totalPrice}`} strong />
          </div>
          {error && <div style={{ marginTop: 12 }}><Message variant='danger'>{error}</Message></div>}
          <button
            type='button'
            className='ps-btn ps-btn-primary ps-btn-block ps-btn-lg'
            style={{ marginTop: 16 }}
            disabled={cart.cartItems.length === 0}
            onClick={placeOrderHandler}
          >
            Place order
          </button>
        </aside>
      </div>
    </div>
  )
}

export default PlaceOrderScreen
