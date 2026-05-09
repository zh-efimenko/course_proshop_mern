import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { PayPalButton } from 'react-paypal-button-v2'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Icon from '../components/Icon'
import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from '../actions/orderActions'
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants'

const OrderScreen = ({ match, history }) => {
  const orderId = match.params.id
  const [sdkReady, setSdkReady] = useState(false)
  const dispatch = useDispatch()

  const { order, loading, error } = useSelector((s) => s.orderDetails)
  const { loading: loadingPay, success: successPay } = useSelector((s) => s.orderPay)
  const { loading: loadingDeliver, success: successDeliver } = useSelector((s) => s.orderDeliver)
  const { userInfo } = useSelector((s) => s.userLogin)

  if (!loading && order && order.orderItems) {
    const fmt = (n) => (Math.round(n * 100) / 100).toFixed(2)
    order.itemsPrice = fmt(order.orderItems.reduce((acc, it) => acc + it.price * it.qty, 0))
  }

  useEffect(() => {
    if (!userInfo) history.push('/login')

    const addPayPalScript = async () => {
      const { data: clientId } = await axios.get('/api/config/paypal')
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
      script.async = true
      script.onload = () => setSdkReady(true)
      document.body.appendChild(script)
    }

    if (!order || successPay || successDeliver || order._id !== orderId) {
      dispatch({ type: ORDER_PAY_RESET })
      dispatch({ type: ORDER_DELIVER_RESET })
      dispatch(getOrderDetails(orderId))
    } else if (!order.isPaid) {
      if (!window.paypal) addPayPalScript()
      else setSdkReady(true)
    }
  }, [dispatch, orderId, successPay, successDeliver, order, userInfo, history])

  const OrderSkeleton = () => {
    const Section = ({ rows = 3 }) => (
      <section className='ps-card'>
        <div className='ps-skeleton' style={{ height: 18, width: '30%', marginBottom: 14 }} />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className='ps-skeleton' style={{ height: 12, width: `${70 + ((i * 11) % 25)}%`, marginBottom: 8 }} />
        ))}
      </section>
    )
    return (
      <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }} aria-busy='true' aria-live='polite'>
        <div className='ps-skeleton' style={{ height: 32, width: 240, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section rows={3} />
            <Section rows={3} />
            <Section rows={3} />
            <Section rows={3} />
          </div>
          <aside className='ps-card ps-card--alt'>
            <div className='ps-skeleton' style={{ height: 22, width: '40%', marginBottom: 16 }} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='ps-skeleton' style={{ height: 12, width: '100%', marginBottom: 10 }} />
            ))}
          </aside>
        </div>
      </div>
    )
  }

  if (loading) return <OrderSkeleton />
  if (error) return <div className='ps-container' style={{ paddingTop: 32 }}><Message variant='danger'>{error}</Message></div>

  const SummaryRow = ({ label, value, strong }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: strong ? 600 : 400 }}>
      <span>{label}</span>
      <span className='ps-mono'>{value}</span>
    </div>
  )

  return (
    <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header className='ps-page-header'>
        <div className='ps-page-title'>
          <h1>Order #{order._id.slice(-6).toUpperCase()}</h1>
          {order.isPaid ? (
            <span className='ps-badge ps-badge--success'>
              <Icon name='check' size={12} /> Paid
            </span>
          ) : (
            <span className='ps-badge ps-badge--warning'>Awaiting payment</span>
          )}
          {order.isDelivered ? (
            <span className='ps-badge ps-badge--info'>
              <Icon name='truck' size={12} /> Delivered
            </span>
          ) : (
            <span className='ps-badge'>In transit</span>
          )}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: 32, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className='ps-card'>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3>Shipping</h3>
              {order.isDelivered ? (
                <span className='ps-badge ps-badge--success'>Delivered {order.deliveredAt.substring(0, 10)}</span>
              ) : (
                <span className='ps-badge ps-badge--warning'>Pending</span>
              )}
            </header>
            <p style={{ margin: 0, color: 'var(--fg-secondary)' }}>
              <strong style={{ color: 'var(--fg)' }}>{order.user.name}</strong>{' · '}
              <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
            </p>
            <p style={{ marginTop: 8, marginBottom: 0, color: 'var(--fg-secondary)' }}>
              {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
            </p>
          </section>

          <section className='ps-card'>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3>Payment</h3>
              {order.isPaid ? (
                <span className='ps-badge ps-badge--success'>Paid {order.paidAt.substring(0, 10)}</span>
              ) : (
                <span className='ps-badge ps-badge--warning'>Awaiting</span>
              )}
            </header>
            <p style={{ margin: 0, color: 'var(--fg-secondary)' }}>{order.paymentMethod}</p>
          </section>

          <section className='ps-card'>
            <h3 style={{ marginBottom: 16 }}>Items</h3>
            {order.orderItems.length === 0 ? (
              <Message>Order is empty</Message>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {order.orderItems.map((item, idx) => (
                  <li key={idx} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <img src={item.image} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--surface-alt)' }} />
                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                    <span className='ps-mono'>{item.qty} × ${item.price} = ${(item.qty * item.price).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {order.giftMessage && (
            <section className='ps-card ps-card--alt'>
              <h3 style={{ marginBottom: 8 }}>Gift message</h3>
              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--fg-secondary)' }}>"{order.giftMessage}"</p>
            </section>
          )}
        </div>

        <aside className='ps-card ps-card--alt' style={{ position: 'sticky', top: 80 }} aria-labelledby='order-sum-h'>
          <h2 id='order-sum-h' style={{ marginBottom: 16 }}>Summary</h2>
          <SummaryRow label='Items' value={`$${order.itemsPrice}`} />
          <SummaryRow label='Shipping' value={`$${order.shippingPrice}`} />
          <SummaryRow label='Tax' value={`$${order.taxPrice}`} />
          <div style={{ borderTop: '1px solid var(--border-strong)', marginTop: 8, paddingTop: 8 }}>
            <SummaryRow label='Total' value={`$${order.totalPrice}`} strong />
          </div>

          {!order.isPaid && (
            <div style={{ marginTop: 16 }}>
              {loadingPay && <Loader />}
              {!sdkReady ? (
                <Loader />
              ) : (
                <PayPalButton
                  amount={order.totalPrice}
                  onSuccess={(paymentResult) => dispatch(payOrder(orderId, paymentResult))}
                />
              )}
            </div>
          )}

          {loadingDeliver && <div style={{ marginTop: 12 }}><Loader /></div>}
          {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
            <button
              type='button'
              className='ps-btn ps-btn-secondary ps-btn-block'
              onClick={() => dispatch(deliverOrder(order))}
              style={{ marginTop: 16 }}
            >
              <Icon name='truck' size={16} /> Mark as delivered
            </button>
          )}
        </aside>
      </div>
    </div>
  )
}

export default OrderScreen
