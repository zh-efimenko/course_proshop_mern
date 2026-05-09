import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import FormContainer from '../components/FormContainer'
import CheckoutSteps from '../components/CheckoutSteps'
import { saveShippingAddress } from '../actions/cartActions'
import useFeatureEnabled from '../hooks/useFeatureEnabled'

const ShippingScreen = ({ history }) => {
  const dispatch = useDispatch()
  const { shippingAddress } = useSelector((s) => s.cart)
  const multiStepCheckoutEnabled = useFeatureEnabled('multi_step_checkout_v2')

  const [address, setAddress] = useState(shippingAddress.address || '')
  const [city, setCity] = useState(shippingAddress.city || '')
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '')
  const [country, setCountry] = useState(shippingAddress.country || '')

  useEffect(() => {
    if (multiStepCheckoutEnabled) history.push('/checkout')
  }, [multiStepCheckoutEnabled, history])

  if (multiStepCheckoutEnabled) return null

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(saveShippingAddress({ address, city, postalCode, country }))
    history.push('/payment')
  }

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1 style={{ marginBottom: 24 }}>Shipping address</h1>
      <form onSubmit={submitHandler} noValidate>
        <div className='ps-field'>
          <label htmlFor='address' className='ps-label'>Street address</label>
          <input id='address' className='ps-input' type='text' value={address} onChange={(e) => setAddress(e.target.value)} required autoComplete='street-address' />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
          <div className='ps-field'>
            <label htmlFor='city' className='ps-label'>City</label>
            <input id='city' className='ps-input' type='text' value={city} onChange={(e) => setCity(e.target.value)} required autoComplete='address-level2' />
          </div>
          <div className='ps-field'>
            <label htmlFor='postal' className='ps-label'>Postal code</label>
            <input id='postal' className='ps-input' type='text' value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required autoComplete='postal-code' />
          </div>
        </div>
        <div className='ps-field'>
          <label htmlFor='country' className='ps-label'>Country</label>
          <input id='country' className='ps-input' type='text' value={country} onChange={(e) => setCountry(e.target.value)} required autoComplete='country-name' />
        </div>
        <button type='submit' className='ps-btn ps-btn-primary'>Continue to payment</button>
      </form>
    </FormContainer>
  )
}

export default ShippingScreen
