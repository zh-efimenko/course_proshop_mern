import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, Button, Image } from 'react-bootstrap'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Rating from '../components/Rating'
import { listPendingReviews, moderateReview } from '../actions/reviewActions'
import { REVIEW_MODERATE_RESET } from '../constants/reviewConstants'

const ReviewModerationScreen = ({ history }) => {
  const dispatch = useDispatch()

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  const { loading, error, reviews } = useSelector(
    (state) => state.pendingReviews
  )

  const reviewModerate = useSelector((state) => state.reviewModerate)
  const { success: successModerate } = reviewModerate

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      history.push('/login')
      return
    }
    dispatch(listPendingReviews())
    if (successModerate) {
      dispatch({ type: REVIEW_MODERATE_RESET })
    }
  }, [dispatch, history, userInfo, successModerate])

  const handleModerate = (productId, reviewId, status) => {
    dispatch(moderateReview(productId, reviewId, status))
  }

  return (
    <>
      <h1>Review Moderation Queue</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : reviews.length === 0 ? (
        <Message>No pending reviews</Message>
      ) : (
        <Table striped bordered hover responsive className='table-sm'>
          <thead>
            <tr>
              <th>Product</th>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Photos</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(({ productId, productName, review }) => (
              <tr key={review._id}>
                <td>{productName}</td>
                <td>{review.name}</td>
                <td>
                  <Rating value={review.rating} />
                </td>
                <td>{review.comment}</td>
                <td>
                  {review.images && review.images.length > 0 ? (
                    <div className='d-flex flex-wrap'>
                      {review.images.map((src, i) => (
                        <a key={i} href={src} target='_blank' rel='noopener noreferrer'>
                          <Image
                            src={src}
                            alt={`review-img-${i}`}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              marginRight: '4px',
                              marginBottom: '4px',
                            }}
                            thumbnail
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td>{review.createdAt?.substring(0, 10)}</td>
                <td>
                  <Button
                    variant='success'
                    size='sm'
                    className='mr-2'
                    onClick={() =>
                      handleModerate(productId, review._id, 'approved')
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant='danger'
                    size='sm'
                    onClick={() =>
                      handleModerate(productId, review._id, 'rejected')
                    }
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

export default ReviewModerationScreen
