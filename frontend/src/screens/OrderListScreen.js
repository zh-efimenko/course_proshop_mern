import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Icon from '../components/Icon'
import { listOrders } from '../actions/orderActions'

const OrderListScreen = ({ history }) => {
  const dispatch = useDispatch()
  const { loading, error, orders } = useSelector((s) => s.orderList)
  const { userInfo } = useSelector((s) => s.userLogin)

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) dispatch(listOrders())
    else history.push('/login')
  }, [dispatch, history, userInfo])

  const OrderListSkeleton = () => (
    <div style={{ overflowX: 'auto' }} aria-busy='true' aria-live='polite'>
      <table className='ps-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th className='num'>Total</th>
            <th>Paid</th>
            <th>Delivered</th>
            <th className='actions'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i}>
              <td><div className='ps-skeleton' style={{ height: 12, width: 60 }} /></td>
              <td><div className='ps-skeleton' style={{ height: 12, width: 120 }} /></td>
              <td><div className='ps-skeleton' style={{ height: 12, width: 80 }} /></td>
              <td className='num'><div className='ps-skeleton' style={{ height: 12, width: 60, marginLeft: 'auto' }} /></td>
              <td><div className='ps-skeleton' style={{ height: 20, width: 90 }} /></td>
              <td><div className='ps-skeleton' style={{ height: 20, width: 90 }} /></td>
              <td className='actions'><div className='ps-skeleton' style={{ height: 28, width: 80 }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const StatusCell = ({ active, dateStr, label }) =>
    active ? (
      <span className='ps-badge ps-badge--success'>
        <Icon name='check' size={12} /> {dateStr.substring(0, 10)}
      </span>
    ) : (
      <span className='ps-badge ps-badge--warning'>{label}</span>
    )

  return (
    <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header className='ps-page-header'>
        <div className='ps-page-title'>
          <h1>Orders</h1>
          {orders && <span className='ps-caption'>{orders.length} total</span>}
        </div>
      </header>

      {loading ? (
        <OrderListSkeleton />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : orders.length === 0 ? (
        <div className='ps-empty'>
          <span className='ps-empty-icon'><Icon name='inbox' size={40} /></span>
          <h3>No orders yet</h3>
          <p>Orders will appear here as customers check out.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className='ps-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th className='num'>Total</th>
                <th>Paid</th>
                <th>Delivered</th>
                <th className='actions'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className='ps-mono' style={{ color: 'var(--fg-muted)' }}>{order._id.slice(-6)}</td>
                  <td style={{ fontWeight: 500 }}>{order.user && order.user.name}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td className='num'>${order.totalPrice}</td>
                  <td><StatusCell active={order.isPaid} dateStr={order.paidAt || ''} label='Awaiting payment' /></td>
                  <td><StatusCell active={order.isDelivered} dateStr={order.deliveredAt || ''} label='Pending' /></td>
                  <td className='actions'>
                    <Link to={`/order/${order._id}`} className='ps-btn ps-btn-ghost ps-btn-sm'>
                      Details <Icon name='arrowRight' size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default OrderListScreen
