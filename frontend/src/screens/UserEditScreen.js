import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import FormContainer from '../components/FormContainer'
import Icon from '../components/Icon'
import { getUserDetails, updateUser } from '../actions/userActions'
import { USER_UPDATE_RESET } from '../constants/userConstants'

const UserEditScreen = ({ match, history }) => {
  const userId = match.params.id
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const dispatch = useDispatch()

  const { loading, error, user } = useSelector((s) => s.userDetails)
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = useSelector((s) => s.userUpdate)

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: USER_UPDATE_RESET })
      history.push('/admin/userlist')
    } else {
      if (!user.name || user._id !== userId) {
        dispatch(getUserDetails(userId))
      } else {
        setName(user.name)
        setEmail(user.email)
        setIsAdmin(user.isAdmin)
      }
    }
  }, [dispatch, history, userId, user, successUpdate])

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(updateUser({ _id: userId, name, email, isAdmin }))
  }

  return (
    <FormContainer>
      <Link to='/admin/userlist' className='ps-btn ps-btn-ghost ps-btn-sm' style={{ marginBottom: 16 }}>
        <Icon name='arrowLeft' size={16} /> Back to users
      </Link>
      <h1 style={{ marginBottom: 24 }}>Edit user</h1>
      {loadingUpdate && <Loader />}
      {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <form onSubmit={submitHandler} noValidate>
          <div className='ps-field'>
            <label htmlFor='name' className='ps-label'>Name</label>
            <input id='name' className='ps-input' type='text' value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className='ps-field'>
            <label htmlFor='email' className='ps-label'>Email</label>
            <input id='email' className='ps-input' type='email' value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className='ps-field'>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type='checkbox' checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} />
              <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>Administrator</span>
            </label>
            <p className='ps-help'>Admins can manage users, products, orders, and feature flags.</p>
          </div>
          <button type='submit' className='ps-btn ps-btn-primary' disabled={loadingUpdate}>
            Save changes
          </button>
        </form>
      )}
    </FormContainer>
  )
}

export default UserEditScreen
