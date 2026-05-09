import React, { useEffect, useMemo, useState } from 'react'
import {
  Row,
  Col,
  Form,
  InputGroup,
  ButtonGroup,
  Button,
  Badge,
  Card,
} from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import { updateFeatureFlag } from '../actions/featureFlagActions'

const STATUSES = ['Enabled', 'Testing', 'Disabled']

const statusVariant = (status) => {
  if (status === 'Enabled') return 'success'
  if (status === 'Testing') return 'info'
  return 'secondary'
}

const SkeletonCard = () => (
  <Card className='mb-3' aria-hidden='true'>
    <Card.Body>
      <div
        style={{
          height: '1.2rem',
          width: '40%',
          background: '#e9ecef',
          borderRadius: 4,
          marginBottom: 12,
        }}
      />
      <div
        style={{
          height: '0.9rem',
          width: '90%',
          background: '#e9ecef',
          borderRadius: 4,
          marginBottom: 8,
        }}
      />
      <div
        style={{
          height: '0.9rem',
          width: '70%',
          background: '#e9ecef',
          borderRadius: 4,
          marginBottom: 16,
        }}
      />
      <div
        style={{
          height: '2rem',
          width: '50%',
          background: '#e9ecef',
          borderRadius: 4,
        }}
      />
    </Card.Body>
  </Card>
)

const EmptyState = ({ title, hint }) => (
  <div
    role='status'
    style={{ textAlign: 'center', padding: '4rem 1rem', color: '#6c757d' }}
  >
    <div style={{ fontSize: '2.5rem', marginBottom: 8 }} aria-hidden='true'>
      ∅
    </div>
    <h3 style={{ marginBottom: 8 }}>{title}</h3>
    <p style={{ maxWidth: 360, margin: '0 auto' }}>{hint}</p>
  </div>
)

const FlagCard = ({ flag, onStatusChange, onTrafficChange }) => {
  const [localTraffic, setLocalTraffic] = useState(flag.traffic_percentage)

  useEffect(() => {
    setLocalTraffic(flag.traffic_percentage)
  }, [flag.traffic_percentage])

  const sliderId = `traffic-${flag.key}`

  return (
    <Card className='mb-3'>
      <Card.Body>
        <Row>
          <Col md={8}>
            <div className='d-flex align-items-center mb-2' style={{ gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ padding: 0, margin: 0, fontSize: '1.1rem' }}>
                {flag.name}
              </h3>
              <Badge variant={statusVariant(flag.status)} aria-label={`Status: ${flag.status}`}>
                {flag.status}
              </Badge>
              {flag.implemented === 'yes' && (
                <Badge variant='light' title='Implemented in code'>in code</Badge>
              )}
              {flag.implemented === 'partial' && (
                <Badge variant='warning' title='Partially implemented'>partial</Badge>
              )}
            </div>
            <code style={{ fontSize: '0.8rem' }}>{flag.key}</code>
            <p
              className='text-muted mt-2 mb-0'
              style={{ fontSize: '0.9rem' }}
            >
              {flag.description}
            </p>
            <small className='text-muted d-block mt-2'>
              Last modified: {flag.last_modified}
              {flag.rollout_strategy && ` · ${flag.rollout_strategy}`}
              {flag.targeted_segments && flag.targeted_segments.length > 0 &&
                ` · ${flag.targeted_segments.join(', ')}`}
            </small>
          </Col>
          <Col md={4}>
            <Form.Group className='mb-3'>
              <Form.Label
                id={`status-label-${flag.key}`}
                style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                Status
              </Form.Label>
              <ButtonGroup
                size='sm'
                aria-labelledby={`status-label-${flag.key}`}
                role='group'
                style={{ display: 'flex' }}
              >
                {STATUSES.map((s) => (
                  <Button
                    key={s}
                    variant={
                      flag.status === s
                        ? statusVariant(s)
                        : `outline-${statusVariant(s)}`
                    }
                    onClick={() => {
                      if (flag.status !== s) onStatusChange(s)
                    }}
                    aria-pressed={flag.status === s}
                    aria-label={`Set status to ${s}`}
                  >
                    {s}
                  </Button>
                ))}
              </ButtonGroup>
            </Form.Group>

            <Form.Group className='mb-0'>
              <Form.Label
                htmlFor={sliderId}
                style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                Traffic: <strong>{localTraffic}%</strong>
              </Form.Label>
              <input
                id={sliderId}
                type='range'
                min='0'
                max='100'
                step='1'
                value={localTraffic}
                disabled={flag.status !== 'Testing'}
                onChange={(e) => setLocalTraffic(Number(e.target.value))}
                onMouseUp={(e) => {
                  const v = Number(e.target.value)
                  if (v !== flag.traffic_percentage) onTrafficChange(v)
                }}
                onTouchEnd={(e) => {
                  const v = Number(e.target.value)
                  if (v !== flag.traffic_percentage) onTrafficChange(v)
                }}
                onKeyUp={(e) => {
                  const v = Number(e.target.value)
                  if (v !== flag.traffic_percentage) onTrafficChange(v)
                }}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={localTraffic}
                aria-label={`Traffic percentage for ${flag.name}`}
                style={{ width: '100%' }}
              />
              {flag.status !== 'Testing' && (
                <small className='text-muted'>
                  Slider active only when status is Testing.
                </small>
              )}
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  )
}

const FeatureFlagsScreen = ({ history }) => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.userLogin)
  const { loading, error, flags, updateError } = useSelector(
    (state) => state.featureFlags
  )

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login')
    }
  }, [history, userInfo])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return flags.filter((f) => {
      if (statusFilter !== 'All' && f.status !== statusFilter) return false
      if (!q) return true
      return (
        f.name.toLowerCase().includes(q) ||
        f.key.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
      )
    })
  }, [flags, search, statusFilter])

  const counts = useMemo(() => {
    const c = { Enabled: 0, Testing: 0, Disabled: 0 }
    flags.forEach((f) => {
      if (c[f.status] !== undefined) c[f.status]++
    })
    return c
  }, [flags])

  const handleStatusChange = (key, status) => {
    dispatch(updateFeatureFlag(key, { status }))
  }

  const handleTrafficChange = (key, traffic_percentage) => {
    dispatch(updateFeatureFlag(key, { traffic_percentage }))
  }

  return (
    <>
      <div className='d-flex align-items-baseline justify-content-between flex-wrap mb-3'>
        <h1 style={{ marginBottom: 0 }}>Feature Dashboard</h1>
        <small className='text-muted'>
          {flags.length} total · {counts.Enabled} enabled · {counts.Testing}{' '}
          testing · {counts.Disabled} disabled
        </small>
      </div>

      {updateError && (
        <Message variant='danger'>
          Failed to save change: {updateError}
        </Message>
      )}

      <Row className='mb-3'>
        <Col md={7} className='mb-2 mb-md-0'>
          <Form onSubmit={(e) => e.preventDefault()} role='search'>
            <InputGroup>
              <Form.Control
                type='search'
                placeholder='Search by name, key, or description'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label='Search feature flags'
              />
            </InputGroup>
          </Form>
        </Col>
        <Col md={5}>
          <ButtonGroup
            aria-label='Filter by status'
            role='group'
            style={{ display: 'flex' }}
          >
            {['All', ...STATUSES].map((s) => (
              <Button
                key={s}
                variant={
                  statusFilter === s ? 'dark' : 'outline-dark'
                }
                onClick={() => setStatusFilter(s)}
                aria-pressed={statusFilter === s}
              >
                {s}
              </Button>
            ))}
          </ButtonGroup>
        </Col>
      </Row>

      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : error ? (
        <Message variant='danger'>
          Could not load feature flags: {error}
        </Message>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={flags.length === 0 ? 'No feature flags' : 'No matches'}
          hint={
            flags.length === 0
              ? 'features.json appears empty.'
              : 'Adjust the search query or status filter.'
          }
        />
      ) : (
        filtered.map((flag) => (
          <FlagCard
            key={flag.key}
            flag={flag}
            onStatusChange={(s) => handleStatusChange(flag.key, s)}
            onTrafficChange={(v) => handleTrafficChange(flag.key, v)}
          />
        ))
      )}
    </>
  )
}

export default FeatureFlagsScreen
