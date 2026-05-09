import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Icon from '../components/Icon'
import { getUserDetails, updateUserProfile } from '../actions/userActions'
import { listMyOrders } from '../actions/orderActions'
import { USER_UPDATE_PROFILE_RESET } from '../constants/userConstants'

const ProfileScreen = ({ history }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState(null)
  const dispatch = useDispatch()

  const { loading, error, user } = useSelector((s) => s.userDetails)
  const { userInfo } = useSelector((s) => s.userLogin)
  const { success } = useSelector((s) => s.userUpdateProfile)
  const { loading: loadingOrders, error: errorOrders, orders } = useSelector((s) => s.orderListMy)

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    } else if (!user || !user.name || success) {
      dispatch({ type: USER_UPDATE_PROFILE_RESET })
      dispatch(getUserDetails('profile'))
      dispatch(listMyOrders())
    } else {
      setName(user.name)
      setEmail(user.email)
    }
  }, [dispatch, history, userInfo, user, success])

  const submitHandler = (e) => {
    e.preventDefault()
    if (password && password !== confirmPassword) {
      setMessage('Passwords do not match')
    } else {
      setMessage(null)
      dispatch(updateUserProfile({ id: user._id, name, email, password }))
    }
  }

  const OrdersTableSkeleton = () => (
    <div style={{ overflowX: 'auto' }} aria-busy='true' aria-live='polite'>
      <table className='ps-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th className='num'>Total</th>
            <th>Paid</th>
            <th>Delivered</th>
            <th className='actions'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td><div className='ps-skeleton' style={{ height: 12, width: 60 }} /></td>
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

  const StatusBadge = ({ done, doneDate, pendingLabel }) =>
    done ? (
      <span className='ps-badge ps-badge--success'>
        <Icon name='check' size={12} /> {doneDate.substring(0, 10)}
      </span>
    ) : (
      <span className='ps-badge ps-badge--warning'>{pendingLabel}</span>
    )

  return (
    <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }}>
      <h1 style={{ marginBottom: 24 }}>Account</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 32, alignItems: 'flex-start' }}>
        <section className='ps-card' aria-labelledby='profile-h'>
          <h2 id='profile-h' style={{ marginBottom: 16 }}>Profile</h2>
          {message && <div style={{ marginBottom: 12 }}><Message variant='danger'>{message}</Message></div>}
          {success && <div style={{ marginBottom: 12 }}><Message variant='success'>Profile updated</Message></div>}
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant='danger'>{error}</Message>
          ) : (
            <form onSubmit={submitHandler} noValidate>
              <div className='ps-field'>
                <label htmlFor='name' className='ps-label'>Name</label>
                <input id='name' className='ps-input' value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className='ps-field'>
                <label htmlFor='email' className='ps-label'>Email</label>
                <input id='email' className='ps-input' type='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className='ps-field'>
                <label htmlFor='password' className='ps-label'>New password</label>
                <input id='password' className='ps-input' type='password' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='new-password' />
                <p className='ps-help'>Leave blank to keep current password.</p>
              </div>
              <div className='ps-field'>
                <label htmlFor='confirm' className='ps-label'>Confirm new password</label>
                <input id='confirm' className='ps-input' type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete='new-password' />
              </div>
              <button type='submit' className='ps-btn ps-btn-primary'>Save changes</button>
            </form>
          )}
        </section>

        <section aria-labelledby='orders-h'>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <h2 id='orders-h'>My orders</h2>
            {orders && <span className='ps-caption'>{orders.length}</span>}
          </div>
          {loadingOrders ? (
            <OrdersTableSkeleton />
          ) : errorOrders ? (
            <Message variant='danger'>{errorOrders}</Message>
          ) : !orders || orders.length === 0 ? (
            <div className='ps-empty'>
              <span className='ps-empty-icon'><Icon name='inbox' size={40} /></span>
              <h3>No orders yet</h3>
              <p>Once you place an order, you'll find it here.</p>
              <Link to='/' className='ps-btn ps-btn-primary'>Browse products</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className='ps-table'>
                <thead>
                  <tr>
                    <th>ID</th>
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
                      <td>{order.createdAt.substring(0, 10)}</td>
                      <td className='num'>${order.totalPrice}</td>
                      <td><StatusBadge done={order.isPaid} doneDate={order.paidAt || ''} pendingLabel='Awaiting payment' /></td>
                      <td><StatusBadge done={order.isDelivered} doneDate={order.deliveredAt || ''} pendingLabel='In transit' /></td>
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
        </section>
      </div>
    </div>
  )
}

export default ProfileScreen
