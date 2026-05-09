import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Rating from '../components/Rating'
import Icon from '../components/Icon'
import { listPendingReviews, moderateReview } from '../actions/reviewActions'
import { REVIEW_MODERATE_RESET } from '../constants/reviewConstants'

const ReviewModerationScreen = ({ history }) => {
  const dispatch = useDispatch()
  const { userInfo } = useSelector((s) => s.userLogin)
  const { loading, error, reviews } = useSelector((s) => s.pendingReviews)
  const { success: successModerate } = useSelector((s) => s.reviewModerate)

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login')
      return
    }
    dispatch(listPendingReviews())
    if (successModerate) dispatch({ type: REVIEW_MODERATE_RESET })
  }, [dispatch, history, userInfo, successModerate])

  const ReviewCardSkeleton = () => (
    <article className='ps-card' aria-hidden='true'>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
        <div className='ps-skeleton' style={{ height: 18, width: 220 }} />
        <div className='ps-skeleton' style={{ height: 12, width: 80 }} />
      </div>
      <div className='ps-skeleton' style={{ height: 14, width: '40%', marginBottom: 12 }} />
      <div className='ps-skeleton' style={{ height: 14, width: '95%', marginBottom: 8 }} />
      <div className='ps-skeleton' style={{ height: 14, width: '80%' }} />
    </article>
  )

  const ReviewListSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} aria-busy='true' aria-live='polite'>
      {Array.from({ length: 5 }).map((_, i) => <ReviewCardSkeleton key={i} />)}
    </div>
  )

  return (
    <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header className='ps-page-header'>
        <div className='ps-page-title'>
          <h1>Review queue</h1>
          {reviews && reviews.length > 0 && (
            <span className='ps-badge ps-badge--warning'>{reviews.length} pending</span>
          )}
        </div>
      </header>

      {loading ? (
        <ReviewListSkeleton />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : reviews.length === 0 ? (
        <div className='ps-empty'>
          <span className='ps-empty-icon' style={{ color: 'var(--success)' }}>
            <Icon name='check' size={40} />
          </span>
          <h3>Queue is clear</h3>
          <p>No pending reviews. Anything new will land here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map(({ productId, productName, review }) => (
            <article key={review._id} className='ps-card'>
              <header style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0 }}>{productName}</h3>
                  <span className='ps-badge ps-badge--warning'>Pending</span>
                </div>
                <span className='ps-muted' style={{ fontSize: 'var(--text-body-sm)' }}>
                  {review.createdAt?.substring(0, 10)}
                </span>
              </header>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500 }}>{review.name}</span>
                <Rating value={review.rating} />
              </div>
              <p style={{ fontSize: 'var(--text-body-lg)', lineHeight: 1.55, maxWidth: '80ch', color: 'var(--fg)', marginBottom: 12 }}>
                {review.comment}
              </p>
              {review.images && review.images.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {review.images.map((src, i) => (
                    <a key={i} href={src} target='_blank' rel='noopener noreferrer'>
                      <img
                        src={src}
                        alt={`Review attachment ${i + 1}`}
                        style={{
                          width: 80, height: 80, objectFit: 'cover',
                          borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                        }}
                      />
                    </a>
                  ))}
                </div>
              )}
              <footer style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type='button'
                  className='ps-btn ps-btn-primary'
                  onClick={() => dispatch(moderateReview(productId, review._id, 'approved'))}
                >
                  <Icon name='check' size={16} /> Approve
                </button>
                <button
                  type='button'
                  className='ps-btn ps-btn-danger'
                  onClick={() => dispatch(moderateReview(productId, review._id, 'rejected'))}
                >
                  <Icon name='x' size={16} /> Reject
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReviewModerationScreen
