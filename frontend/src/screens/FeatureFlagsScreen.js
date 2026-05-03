import React, { useEffect } from 'react'
import { Table, Badge } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import Loader from '../components/Loader'
import Message from '../components/Message'

const statusVariant = (status) => {
  if (status === 'Enabled') return 'success'
  if (status === 'Testing') return 'warning'
  return 'danger'
}

const implementedVariant = (value) => {
  if (value === 'yes') return 'success'
  if (value === 'partial') return 'warning'
  return 'secondary'
}

const FeatureFlagsScreen = ({ history }) => {
  const { userInfo } = useSelector((state) => state.userLogin)
  const { loading, error, flags } = useSelector((state) => state.featureFlags)

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login')
    }
  }, [history, userInfo])

  return (
    <>
      <h1>Feature Flags</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <Table striped bordered hover responsive className='table-sm'>
          <thead>
            <tr>
              <th>Key</th>
              <th>Name</th>
              <th>Status</th>
              <th>In Code</th>
              <th>Traffic %</th>
              <th>Strategy</th>
              <th>Segments</th>
              <th>Last Modified</th>
              <th>Dependencies</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.key}>
                <td>
                  <code>{flag.key}</code>
                </td>
                <td>{flag.name}</td>
                <td>
                  <Badge variant={statusVariant(flag.status)}>
                    {flag.status}
                  </Badge>
                </td>
                <td>
                  <Badge variant={implementedVariant(flag.implemented)}>
                    {flag.implemented || 'no'}
                  </Badge>
                </td>
                <td>{flag.traffic_percentage}%</td>
                <td>{flag.rollout_strategy}</td>
                <td>
                  {flag.targeted_segments
                    ? flag.targeted_segments.join(', ')
                    : ''}
                </td>
                <td>{flag.last_modified}</td>
                <td>
                  {flag.dependencies ? flag.dependencies.join(', ') : ''}
                </td>
                <td
                  title={flag.description}
                  style={{ maxWidth: '300px', overflow: 'hidden' }}
                >
                  {flag.description && flag.description.length > 80
                    ? flag.description.slice(0, 80) + '…'
                    : flag.description}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default FeatureFlagsScreen
