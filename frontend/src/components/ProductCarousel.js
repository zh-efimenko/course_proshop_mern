import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Carousel } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Loader from './Loader'
import Message from './Message'
import { listTopProducts } from '../actions/productActions'

const ProductCarousel = () => {
  const dispatch = useDispatch()
  const { loading, error, products } = useSelector((s) => s.productTopRated)

  useEffect(() => { dispatch(listTopProducts()) }, [dispatch])

  if (loading) return <Loader />
  if (error) return <Message variant='danger'>{error}</Message>

  return (
    <Carousel
      pause='hover'
      style={{
        background: 'var(--surface-alt)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        padding: 24,
      }}
      indicators
      controls
    >
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link
            to={`/product/${product._id}`}
            style={{ display: 'block', textDecoration: 'none' }}
            aria-label={`${product.name}, $${product.price}`}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                display: 'block',
                margin: '0 auto',
                maxHeight: 360,
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: 'var(--radius-lg)',
              }}
            />
            <Carousel.Caption>
              <h2>{product.name} · ${product.price}</h2>
            </Carousel.Caption>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  )
}

export default ProductCarousel
