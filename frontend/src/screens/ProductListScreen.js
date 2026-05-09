import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Paginate from '../components/Paginate'
import Icon from '../components/Icon'
import ConfirmModal from '../components/ConfirmModal'
import {
  listProducts,
  deleteProduct,
  createProduct,
} from '../actions/productActions'
import { PRODUCT_CREATE_RESET } from '../constants/productConstants'

const ProductListScreen = ({ history, match }) => {
  const pageNumber = match.params.pageNumber || 1
  const dispatch = useDispatch()

  const { loading, error, products, page, pages } = useSelector((s) => s.productList)
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = useSelector((s) => s.productDelete)
  const { loading: loadingCreate, error: errorCreate, success: successCreate, product: createdProduct } = useSelector((s) => s.productCreate)
  const { userInfo } = useSelector((s) => s.userLogin)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET })
    if (!userInfo || !userInfo.isAdmin) history.push('/login')
    if (successCreate) history.push(`/admin/product/${createdProduct._id}/edit`)
    else dispatch(listProducts('', pageNumber))
  }, [dispatch, history, userInfo, successDelete, successCreate, createdProduct, pageNumber])

  const ProductListSkeleton = () => (
    <div style={{ overflowX: 'auto' }} aria-busy='true' aria-live='polite'>
      <table className='ps-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th className='num'>Price</th>
            <th>Category</th>
            <th>Brand</th>
            <th className='actions'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i}>
              <td><div className='ps-skeleton' style={{ height: 12, width: 60 }} /></td>
              <td><div className='ps-skeleton' style={{ height: 12, width: 180 }} /></td>
              <td className='num'><div className='ps-skeleton' style={{ height: 12, width: 60, marginLeft: 'auto' }} /></td>
              <td><div className='ps-skeleton' style={{ height: 12, width: 100 }} /></td>
              <td><div className='ps-skeleton' style={{ height: 12, width: 90 }} /></td>
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
          <h1>Products</h1>
          {products && <span className='ps-caption'>{products.length} on page</span>}
        </div>
        <button type='button' className='ps-btn ps-btn-primary' onClick={() => dispatch(createProduct())}>
          <Icon name='plus' size={18} />
          New product
        </button>
      </header>

      {(loadingDelete || loadingCreate) && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {errorCreate && <Message variant='danger'>{errorCreate}</Message>}

      {loading ? (
        <ProductListSkeleton />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : products.length === 0 ? (
        <div className='ps-empty'>
          <span className='ps-empty-icon'><Icon name='package' size={40} /></span>
          <h3>No products yet</h3>
          <p>Create your first product to start selling.</p>
          <button type='button' className='ps-btn ps-btn-primary' onClick={() => dispatch(createProduct())}>
            <Icon name='plus' size={16} /> Add first product
          </button>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table className='ps-table'>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th className='num'>Price</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th className='actions'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className='ps-mono' style={{ color: 'var(--fg-muted)' }}>{product._id.slice(-6)}</td>
                    <td style={{ fontWeight: 500 }}>{product.name}</td>
                    <td className='num'>${product.price}</td>
                    <td>{product.category}</td>
                    <td>{product.brand}</td>
                    <td className='actions'>
                      <Link
                        to={`/admin/product/${product._id}/edit`}
                        className='ps-btn ps-btn-ghost ps-btn-sm'
                        aria-label={`Edit ${product.name}`}
                      >
                        <Icon name='pencil' size={16} />
                      </Link>
                      <button
                        type='button'
                        className='ps-btn ps-btn-ghost ps-btn-sm'
                        onClick={() => setConfirm(product)}
                        aria-label={`Delete ${product.name}`}
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
          <div style={{ marginTop: 32 }}>
            <Paginate pages={pages} page={page} isAdmin={true} />
          </div>
        </>
      )}

      {confirm && (
        <ConfirmModal
          title='Delete product?'
          body={`This permanently removes "${confirm.name}". Any orders referencing it keep their snapshot. This action cannot be undone.`}
          confirmLabel='Delete'
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => { dispatch(deleteProduct(confirm._id)); setConfirm(null) }}
        />
      )}
    </div>
  )
}

export default ProductListScreen
