import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Rating from '../components/Rating'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Meta from '../components/Meta'
import Icon from '../components/Icon'
import Product from '../components/Product'
import {
  listProductDetails,
  createProductReview,
  listProductRecommendations,
} from '../actions/productActions'
import { PRODUCT_CREATE_REVIEW_RESET } from '../constants/productConstants'
import useFeatureEnabled from '../hooks/useFeatureEnabled'

const ProductScreen = ({ history, match }) => {
  const [qty, setQty] = useState(1)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewImages, setReviewImages] = useState([])

  const dispatch = useDispatch()
  const { loading, error, product } = useSelector((s) => s.productDetails)
  const { userInfo } = useSelector((s) => s.userLogin)
  const {
    success: successProductReview,
    loading: loadingProductReview,
    error: errorProductReview,
  } = useSelector((s) => s.productReviewCreate)

  const recommendationsEnabled = useFeatureEnabled('product_recommendations')
  const photoReviewsEnabled = useFeatureEnabled('photo_reviews')
  const { products: recommendations = [] } = useSelector((s) => s.productRecommendations)

  useEffect(() => {
    if (successProductReview) {
      setRating(0); setComment(''); setReviewImages([])
    }
    if (!product || !product._id || product._id !== match.params.id) {
      dispatch(listProductDetails(match.params.id))
      dispatch({ type: PRODUCT_CREATE_REVIEW_RESET })
      dispatch(listProductRecommendations(match.params.id))
    }
  }, [dispatch, match, successProductReview, product])

  const addToCartHandler = () => {
    history.push(`/cart/${match.params.id}?qty=${qty}`)
  }

  const submitHandler = (e) => {
    e.preventDefault()
    let payload
    if (photoReviewsEnabled && reviewImages.length > 0) {
      payload = new FormData()
      payload.append('rating', rating)
      payload.append('comment', comment)
      reviewImages.forEach((file) => payload.append('images', file))
    } else {
      payload = { rating, comment }
    }
    dispatch(createProductReview(match.params.id, payload))
  }

  const inStock = product && product.countInStock > 0

  const ProductDetailsSkeleton = () => (
    <div
      style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: 48, alignItems: 'flex-start' }}
      aria-busy='true'
      aria-live='polite'
    >
      <div className='ps-skeleton' style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 'var(--radius-xl)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className='ps-skeleton' style={{ height: 32, width: '80%' }} />
        <div className='ps-skeleton' style={{ height: 16, width: '40%' }} />
        <div className='ps-skeleton' style={{ height: 28, width: '30%' }} />
        <div className='ps-skeleton' style={{ height: 14, width: '95%' }} />
        <div className='ps-skeleton' style={{ height: 14, width: '88%' }} />
        <div className='ps-skeleton' style={{ height: 14, width: '60%' }} />
        <div className='ps-card' style={{ marginTop: 16, padding: 16 }}>
          <div className='ps-skeleton' style={{ height: 14, width: '40%', marginBottom: 12 }} />
          <div className='ps-skeleton' style={{ height: 32, width: 100, marginBottom: 16 }} />
          <div className='ps-skeleton' style={{ height: 44, width: '100%' }} />
        </div>
      </div>
    </div>
  )

  return (
    <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }}>
      <Link to='/' className='ps-btn ps-btn-ghost ps-btn-sm' style={{ marginBottom: 16 }}>
        <Icon name='arrowLeft' size={16} /> Back to catalog
      </Link>

      {loading ? (
        <ProductDetailsSkeleton />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <Meta title={product.name} />

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: 48, alignItems: 'flex-start' }}>
            <div>
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--surface-alt)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h1>{product.name}</h1>
              <Rating value={product.rating} text={`${product.numReviews} reviews`} />
              <div className='ps-mono' style={{ fontSize: 'var(--text-h2)', fontWeight: 500 }}>
                ${product.price}
              </div>
              <p style={{ fontSize: 'var(--text-body-lg)', lineHeight: 1.55, color: 'var(--fg-secondary)', maxWidth: '60ch', margin: 0 }}>
                {product.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                {inStock && (
                  <div>
                    <label htmlFor='qty' className='ps-caption' style={{ display: 'block', marginBottom: 6 }}>Quantity</label>
                    <select id='qty' className='ps-select' value={qty} onChange={(e) => setQty(e.target.value)} style={{ width: 100 }}>
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <button
                    type='button'
                    className='ps-btn ps-btn-primary ps-btn-lg ps-btn-block'
                    onClick={addToCartHandler}
                    disabled={!inStock}
                    style={{ marginTop: 24 }}
                  >
                    <Icon name='cart' size={18} /> Add to cart
                  </button>
                </div>
              </div>

              <div>
                {inStock ? (
                  <span className='ps-badge ps-badge--success'>
                    <Icon name='check' size={12} /> In stock · ships in 2 days
                  </span>
                ) : (
                  <span className='ps-badge ps-badge--danger'>Out of stock</span>
                )}
              </div>

              <p className='ps-muted' style={{ fontSize: 'var(--text-body-sm)', margin: 0 }}>
                Free returns within 30 days · Tracked shipping
              </p>
            </div>
          </div>

          <section style={{ marginTop: 64 }} aria-labelledby='reviews-h'>
            <h2 id='reviews-h' style={{ marginBottom: 24 }}>Customer reviews</h2>

            {product.reviews.length === 0 ? (
              <Message>No reviews yet. Be the first to leave one.</Message>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {product.reviews.map((review) => (
                  <article key={review._id} className='ps-card ps-card--alt'>
                    <header style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                      <strong>{review.name}</strong>
                      <Rating value={review.rating} />
                      <span className='ps-muted' style={{ fontSize: 'var(--text-body-sm)' }}>
                        {review.createdAt.substring(0, 10)}
                      </span>
                    </header>
                    <p style={{ marginBottom: 0 }}>{review.comment}</p>
                    {review.images && review.images.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                        {review.images.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`Review attachment ${i + 1}`}
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                          />
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            <div className='ps-card' style={{ maxWidth: 640 }}>
              <h3 style={{ marginBottom: 16 }}>Write a review</h3>
              {successProductReview && (
                <div style={{ marginBottom: 12 }}><Message variant='success'>Review submitted</Message></div>
              )}
              {errorProductReview && (
                <div style={{ marginBottom: 12 }}><Message variant='danger'>{errorProductReview}</Message></div>
              )}

              {userInfo ? (
                <form onSubmit={submitHandler} noValidate>
                  <div className='ps-field'>
                    <label htmlFor='rating' className='ps-label'>Rating</label>
                    <select id='rating' className='ps-select' value={rating} onChange={(e) => setRating(e.target.value)} required>
                      <option value=''>Choose…</option>
                      <option value='1'>1 — Poor</option>
                      <option value='2'>2 — Fair</option>
                      <option value='3'>3 — Good</option>
                      <option value='4'>4 — Very good</option>
                      <option value='5'>5 — Excellent</option>
                    </select>
                  </div>
                  <div className='ps-field'>
                    <label htmlFor='comment' className='ps-label'>Comment</label>
                    <textarea id='comment' className='ps-textarea' rows='4'
                      value={comment} onChange={(e) => setComment(e.target.value)} required />
                  </div>
                  {photoReviewsEnabled && (
                    <div className='ps-field'>
                      <label htmlFor='review-photos' className='ps-label'>Photos (up to 3)</label>
                      <input
                        id='review-photos'
                        type='file'
                        multiple
                        accept='image/*'
                        onChange={(e) => setReviewImages(Array.from(e.target.files).slice(0, 3))}
                      />
                    </div>
                  )}
                  <button type='submit' className='ps-btn ps-btn-primary' disabled={loadingProductReview} aria-busy={loadingProductReview}>
                    {loadingProductReview ? <Loader inline label='Submitting' /> : 'Submit review'}
                  </button>
                </form>
              ) : (
                <Message>
                  <Link to='/login'>Sign in</Link> to write a review.
                </Message>
              )}
            </div>
          </section>

          {recommendationsEnabled && recommendations.length > 0 && (
            <section style={{ marginTop: 64 }} aria-labelledby='recos-h'>
              <h2 id='recos-h' style={{ marginBottom: 24 }}>You may also like</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
                {recommendations.map((p) => <Product key={p._id} product={p} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

export default ProductScreen
