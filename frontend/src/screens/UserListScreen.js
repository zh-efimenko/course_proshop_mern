import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Icon from '../components/Icon'
import ConfirmModal from '../components/ConfirmModal'
import { listUsers, deleteUser } from '../actions/userActions'

const UserListScreen = ({ history }) => {
  const dispatch = useDispatch()

  const { loading, error, users } = useSelector((s) => s.userList)
  const { userInfo } = useSelector((s) => s.userLogin)
  const { success: successDelete } = useSelector((s) => s.userDelete)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) dispatch(listUsers())
    else history.push('/login')
  }, [dispatch, history, successDelete, userInfo])

  const UserListSkeleton = () => (
    <div style={{ overflowX: 'auto' }} aria-busy='true' aria-live='polite'>
      <table className='ps-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th className='actions'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i}>
              <td><div className='ps-skeleton' style={{ height: 12, width: 60 }} /></td>
              <td><div className='ps-skeleton' style={{ height: 12, width: 140 }} /></td>
              <td><div className='ps-skeleton' style={{ height: 12, width: 200 }} /></td>
              <td><div className='ps-skeleton' style={{ height: 20, width: 80 }} /></td>
              <td className='actions'>
                <div style={{ display: 'inline-flex', gap: 8 }}>
                  <div className='ps-skeleton' style={{ height: 28, width: 28 }} />
                  <div className='ps-skeleton' style={{ height: 28, width: 28 }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header className='ps-page-header'>
        <div className='ps-page-title'>
          <h1>Users</h1>
          {users && <span className='ps-caption'>{users.length} total</span>}
        </div>
      </header>

      {loading ? (
        <UserListSkeleton />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : users.length === 0 ? (
        <div className='ps-empty'>
          <span className='ps-empty-icon'><Icon name='user' size={40} /></span>
          <h3>No users yet</h3>
          <p>The first registered customer will show up here.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className='ps-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th className='actions'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className='ps-mono' style={{ color: 'var(--fg-muted)' }}>{user._id.slice(-6)}</td>
                  <td style={{ fontWeight: 500 }}>{user.name}</td>
                  <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                  <td>
                    <span className={`ps-badge ${user.isAdmin ? 'ps-badge--accent' : ''}`}>
                      {user.isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td className='actions'>
                    <Link
                      to={`/admin/user/${user._id}/edit`}
                      className='ps-btn ps-btn-ghost ps-btn-sm'
                      aria-label={`Edit ${user.name}`}
                    >
                      <Icon name='pencil' size={16} />
                    </Link>
                    <button
                      type='button'
                      className='ps-btn ps-btn-ghost ps-btn-sm'
                      onClick={() => setConfirm(user)}
                      aria-label={`Delete ${user.name}`}
                      style={{ color: 'var(--danger)' }}
                    >
                      <Icon name='trash' size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title='Delete user?'
          body={`This permanently removes ${confirm.name} (${confirm.email}). This action cannot be undone.`}
          confirmLabel='Delete'
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            dispatch(deleteUser(confirm._id))
            setConfirm(null)
          }}
        />
      )}
    </div>
  )
}

export default UserListScreen
