import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Icon from '../components/Icon'
import { listProductDetails, updateProduct } from '../actions/productActions'
import { PRODUCT_UPDATE_RESET } from '../constants/productConstants'

const ProductEditScreen = ({ match, history }) => {
  const productId = match.params.id

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [image, setImage] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState(0)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const dispatch = useDispatch()
  const { loading, error, product } = useSelector((s) => s.productDetails)
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = useSelector((s) => s.productUpdate)

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET })
      history.push('/admin/productlist')
    } else {
      if (!product.name || product._id !== productId) {
        dispatch(listProductDetails(productId))
      } else {
        setName(product.name)
        setPrice(product.price)
        setImage(product.image)
        setBrand(product.brand)
        setCategory(product.category)
        setCountInStock(product.countInStock)
        setDescription(product.description)
      }
    }
  }, [dispatch, history, productId, product, successUpdate])

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)
    setUploadError('')
    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImage(data)
    } catch (err) {
      setUploadError('Image upload failed. Try a smaller file or different format.')
    } finally {
      setUploading(false)
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(updateProduct({
      _id: productId, name, price, image, brand, category, description, countInStock,
    }))
  }

  return (
    <div className='ps-container' style={{ paddingTop: 32, paddingBottom: 64, maxWidth: 720 }}>
      <Link to='/admin/productlist' className='ps-btn ps-btn-ghost ps-btn-sm' style={{ marginBottom: 16 }}>
        <Icon name='arrowLeft' size={16} /> Back to products
      </Link>
      <h1 style={{ marginBottom: 24 }}>Edit product</h1>
      {loadingUpdate && <Loader />}
      {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <form onSubmit={submitHandler} noValidate>
          <div className='ps-field'>
            <label htmlFor='name' className='ps-label'>Name</label>
            <input id='name' className='ps-input' type='text' value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className='ps-field'>
              <label htmlFor='price' className='ps-label'>Price (USD)</label>
              <input id='price' className='ps-input' type='number' min='0' step='0.01' value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className='ps-field'>
              <label htmlFor='stock' className='ps-label'>Count in stock</label>
              <input id='stock' className='ps-input' type='number' min='0' value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required />
            </div>
          </div>

          <div className='ps-field'>
            <label htmlFor='image' className='ps-label'>Image</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              {image && (
                <img
                  src={image}
                  alt='Product preview'
                  style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <input id='image' className='ps-input' type='text' value={image} onChange={(e) => setImage(e.target.value)} placeholder='/uploads/...' />
                <label
                  htmlFor='image-file'
                  className='ps-btn ps-btn-secondary ps-btn-sm'
                  style={{ marginTop: 8, cursor: 'pointer' }}
                >
                  <Icon name='upload' size={14} /> Upload file
                </label>
                <input id='image-file' type='file' accept='image/*' onChange={uploadFileHandler} style={{ display: 'none' }} />
                {uploading && <span style={{ marginLeft: 12 }}><Loader inline /></span>}
                {uploadError && <p className='ps-help ps-help--error'>{uploadError}</p>}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className='ps-field'>
              <label htmlFor='brand' className='ps-label'>Brand</label>
              <input id='brand' className='ps-input' type='text' value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div className='ps-field'>
              <label htmlFor='category' className='ps-label'>Category</label>
              <input id='category' className='ps-input' type='text' value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
          </div>

          <div className='ps-field'>
            <label htmlFor='description' className='ps-label'>Description</label>
            <textarea id='description' className='ps-textarea' rows='5' value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <button type='submit' className='ps-btn ps-btn-primary' disabled={loadingUpdate}>
            Save product
          </button>
        </form>
      )}
    </div>
  )
}

export default ProductEditScreen
