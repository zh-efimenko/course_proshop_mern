import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Icon from '../components/Icon'
import { addToCart, removeFromCart } from '../actions/cartActions'
import useFeatureEnabled from '../hooks/useFeatureEnabled'

const CartScreen = ({ match, location, history }) => {
  const productId = match.params.id
  const qty = location.search ? Number(location.search.split('=')[1]) : 1
  const dispatch = useDispatch()
  const { cartItems } = useSelector((s) => s.cart)
  const multiStepCheckoutEnabled = useFeatureEnabled('multi_step_checkout_v2')

  useEffect(() => {
    if (productId) dispatch(addToCart(productId, qty))
  }, [dispatch, productId, qty])

  const checkoutHandler = () => {
    history.push(multiStepCheckoutEnabled ? '/login?redirect=checkout' : '/login?redirect=shipping')
  }

  const itemCount = cartItems.reduce((acc, it) => acc + it.qty, 0)
  const subtotal = cartItems.reduce((acc, it) => acc + it.qty * it.price, 0)

  return (
    <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header className='ps-page-header'>
        <div className='ps-page-title'>
          <h1>Your cart</h1>
          <span className='ps-caption'>{itemCount} item{itemCount === 1 ? '' : 's'}</span>
        </div>
      </header>

      {cartItems.length === 0 ? (
        <div className='ps-empty'>
          <span className='ps-empty-icon'><Icon name='cart' size={40} /></span>
          <h3>Your cart is empty</h3>
          <p>Find something you love — your cart is waiting.</p>
          <Link to='/' className='ps-btn ps-btn-primary'>Browse products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 32, alignItems: 'flex-start' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {cartItems.map((item) => (
              <li
                key={item.product}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '96px 1fr auto',
                  gap: 16,
                  padding: '16px 0',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                }}
              >
                <Link to={`/product/${item.product}`}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--surface-alt)' }}
                  />
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Link to={`/product/${item.product}`} style={{ color: 'var(--fg)', fontWeight: 500, textDecoration: 'none' }}>
                    {item.name}
                  </Link>
                  <span className='ps-mono' style={{ color: 'var(--fg-muted)' }}>${item.price}</span>
                  <button
                    type='button'
                    onClick={() => dispatch(removeFromCart(item.product))}
                    className='ps-btn ps-btn-ghost ps-btn-sm'
                    style={{ alignSelf: 'flex-start', color: 'var(--danger)', padding: 0, height: 'auto' }}
                  >
                    <Icon name='trash' size={14} /> Remove
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <label htmlFor={`qty-${item.product}`} className='ps-caption' style={{ alignSelf: 'flex-end' }}>Qty</label>
                  <select
                    id={`qty-${item.product}`}
                    className='ps-select'
                    value={item.qty}
                    onChange={(e) => dispatch(addToCart(item.product, Number(e.target.value)))}
                    style={{ width: 80 }}
                  >
                    {[...Array(item.countInStock).keys()].map((x) => (
                      <option key={x + 1} value={x + 1}>{x + 1}</option>
                    ))}
                  </select>
                  <span className='ps-mono' style={{ fontWeight: 500 }}>${(item.qty * item.price).toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>

          <aside
            className='ps-card ps-card--alt'
            style={{ position: 'sticky', top: 80 }}
            aria-labelledby='summary-h'
          >
            <h2 id='summary-h' style={{ marginBottom: 16 }}>Summary</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className='ps-secondary'>Items ({itemCount})</span>
              <span className='ps-mono'>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: 'var(--fg-muted)', fontSize: 'var(--text-body-sm)' }}>
              <span>Shipping</span>
              <span>Calculated next step</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-strong)', paddingTop: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <strong>Subtotal</strong>
              <strong className='ps-mono'>${subtotal.toFixed(2)}</strong>
            </div>
            <button
              type='button'
              className='ps-btn ps-btn-primary ps-btn-block ps-btn-lg'
              onClick={checkoutHandler}
              disabled={cartItems.length === 0}
            >
              Proceed to checkout <Icon name='arrowRight' size={16} />
            </button>
            <Link to='/' className='ps-btn ps-btn-ghost ps-btn-block' style={{ marginTop: 8 }}>
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  )
}

export default CartScreen
