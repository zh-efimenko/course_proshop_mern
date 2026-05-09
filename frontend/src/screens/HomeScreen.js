import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Product from '../components/Product'
import Message from '../components/Message'
import Paginate from '../components/Paginate'
import ProductCarousel from '../components/ProductCarousel'
import Meta from '../components/Meta'
import Icon from '../components/Icon'
import { listProducts } from '../actions/productActions'

const HomeScreen = ({ match }) => {
  const keyword = match.params.keyword
  const pageNumber = match.params.pageNumber || 1
  const dispatch = useDispatch()
  const { loading, error, products, page, pages } = useSelector((s) => s.productList)

  useEffect(() => { dispatch(listProducts(keyword, pageNumber)) }, [dispatch, keyword, pageNumber])

  const ProductCardSkeleton = () => (
    <article className='ps-product-card' aria-hidden='true'>
      <div className='ps-skeleton' style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 0 }} />
      <div className='ps-product-body'>
        <div className='ps-skeleton' style={{ height: 16, width: '85%', marginBottom: 10 }} />
        <div className='ps-skeleton' style={{ height: 12, width: '50%', marginBottom: 12 }} />
        <div className='ps-skeleton' style={{ height: 18, width: '40%' }} />
      </div>
    </article>
  )

  const HomeSkeleton = () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 32,
      }}
      aria-busy='true'
      aria-live='polite'
    >
      {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
    </div>
  )

  return (
    <>
      <Meta />
      <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64 }}>
        {!keyword ? (
          <section style={{ marginBottom: 64 }}>
            <ProductCarousel />
          </section>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <Link to='/' className='ps-btn ps-btn-ghost ps-btn-sm'>
              <Icon name='arrowLeft' size={16} /> Back to all products
            </Link>
          </div>
        )}

        <header className='ps-page-header'>
          <div className='ps-page-title'>
            <h1>{keyword ? `Results for "${keyword}"` : 'Latest products'}</h1>
            {products && <span className='ps-caption'>{products.length} item{products.length === 1 ? '' : 's'}</span>}
          </div>
        </header>

        {loading ? (
          <HomeSkeleton />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : products.length === 0 ? (
          <div className='ps-empty'>
            <span className='ps-empty-icon'><Icon name='package' size={40} /></span>
            <h3>{keyword ? 'No matches' : 'No products yet'}</h3>
            <p>
              {keyword
                ? `Try a different keyword or browse the full catalog.`
                : `Check back soon — new arrivals incoming.`}
            </p>
            {keyword && <Link to='/' className='ps-btn ps-btn-primary'>Browse all</Link>}
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: 32,
              }}
            >
              {products.map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </div>
            <div style={{ marginTop: 64, display: 'flex', justifyContent: 'center' }}>
              <Paginate pages={pages} page={page} keyword={keyword || ''} />
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default HomeScreen
