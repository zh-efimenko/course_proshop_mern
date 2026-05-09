import React from 'react'
import { Link } from 'react-router-dom'
import Rating from './Rating'

const Product = ({ product }) => {
  const outOfStock = product.countInStock === 0
  return (
    <article className='ps-product-card'>
      <Link to={`/product/${product._id}`} aria-label={product.name} style={{ display: 'block' }}>
        <img
          className='ps-product-img'
          src={product.image}
          alt={product.name}
          loading='lazy'
        />
      </Link>
      <div className='ps-product-body'>
        <Link to={`/product/${product._id}`} className='ps-product-title'>
          {product.name}
        </Link>
        <Rating value={product.rating} text={`${product.numReviews} reviews`} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span className='ps-product-price'>${product.price}</span>
          {outOfStock && <span className='ps-badge ps-badge--danger'>Out of stock</span>}
        </div>
      </div>
    </article>
  )
}

export default Product
