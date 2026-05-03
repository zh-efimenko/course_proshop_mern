import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Row,
  Col,
  ListGroup,
  Image,
  Card,
  Form,
} from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import CheckoutStepperV2 from '../components/CheckoutStepperV2'
import { createOrder } from '../actions/orderActions'
import {
  saveShippingAddress,
  savePaymentMethod,
} from '../actions/cartActions'
import { ORDER_CREATE_RESET } from '../constants/orderConstants'
import { USER_DETAILS_RESET } from '../constants/userConstants'
import useFeatureEnabled from '../hooks/useFeatureEnabled'
import '../assets/checkout-v2.css'

const STEPS = ['shipping', 'payment', 'review']

const initialErrors = {
  address: '',
  city: '',
  postalCode: '',
  country: '',
}

const MultiStepCheckoutScreen = ({ history }) => {
  const dispatch = useDispatch()

  const cart = useSelector((state) => state.cart)
  const { shippingAddress, paymentMethod, cartItems } = cart

  const giftMessageEnabled = useFeatureEnabled('gift_message')

  const orderCreate = useSelector((state) => state.orderCreate)
  const { order, success, error } = orderCreate

  const [currentStep, setCurrentStep] = useState('shipping')
  const [direction, setDirection] = useState('forward')

  // Shipping form state
  const [address, setAddress] = useState(shippingAddress.address || '')
  const [city, setCity] = useState(shippingAddress.city || '')
  const [postalCode, setPostalCode] = useState(
    shippingAddress.postalCode || ''
  )
  const [country, setCountry] = useState(shippingAddress.country || '')
  const [shippingErrors, setShippingErrors] = useState(initialErrors)

  // Payment state
  const [selectedPayment, setSelectedPayment] = useState(
    paymentMethod || 'PayPal'
  )

  // Gift message state
  const [isGift, setIsGift] = useState(false)
  const [giftMessage, setGiftMessage] = useState('')

  useEffect(() => {
    if (success) {
      history.push(`/order/${order._id}`)
      dispatch({ type: USER_DETAILS_RESET })
      dispatch({ type: ORDER_CREATE_RESET })
    }
  }, [history, success, dispatch, order])

  useEffect(() => {
    if (!giftMessageEnabled) {
      setIsGift(false)
      setGiftMessage('')
    }
  }, [giftMessageEnabled])

  // --- Inline validation ---
  const validateShipping = useCallback(() => {
    const errors = { ...initialErrors }
    let valid = true

    if (!address.trim()) {
      errors.address = 'Address is required'
      valid = false
    }
    if (!city.trim()) {
      errors.city = 'City is required'
      valid = false
    }
    if (!postalCode.trim()) {
      errors.postalCode = 'Postal code is required'
      valid = false
    }
    if (!country.trim()) {
      errors.country = 'Country is required'
      valid = false
    }

    setShippingErrors(errors)
    return valid
  }, [address, city, postalCode, country])

  // --- Navigation ---
  const goToStep = (step) => {
    const fromIndex = STEPS.indexOf(currentStep)
    const toIndex = STEPS.indexOf(step)
    setDirection(toIndex > fromIndex ? 'forward' : 'backward')
    setCurrentStep(step)
  }

  const handleContinue = () => {
    if (currentStep === 'shipping') {
      if (!validateShipping()) return
      dispatch(
        saveShippingAddress({ address, city, postalCode, country })
      )
      goToStep('payment')
    } else if (currentStep === 'payment') {
      dispatch(savePaymentMethod(selectedPayment))
      goToStep('review')
    }
  }

  const handleBack = () => {
    const currentIndex = STEPS.indexOf(currentStep)
    if (currentIndex > 0) {
      goToStep(STEPS[currentIndex - 1])
    }
  }

  // --- Order ---
  const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2)

  const itemsPrice = addDecimals(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  )
  const shippingPrice = addDecimals(itemsPrice > 100 ? 0 : 100)
  const taxPrice = addDecimals(Number((0.15 * itemsPrice).toFixed(2)))
  const totalPrice = (
    Number(itemsPrice) +
    Number(shippingPrice) +
    Number(taxPrice)
  ).toFixed(2)

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        giftMessage: isGift ? giftMessage.trim() : '',
      })
    )
  }

  // --- Panel render helpers ---
  const panelClass = (key) => {
    if (currentStep !== key) return 'd-none'
    return ''
  }

  const renderShippingPanel = () => (
    <div className={panelClass('shipping')}>
      <h2>Shipping Address</h2>
      <Form>
        <Form.Group controlId='v2-address'>
          <Form.Label>Address</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter address'
            value={address}
            className={shippingErrors.address ? 'is-invalid' : ''}
            onChange={(e) => {
              setAddress(e.target.value)
              if (shippingErrors.address)
                setShippingErrors((prev) => ({ ...prev, address: '' }))
            }}
          />
          <div className='invalid-feedback'>{shippingErrors.address}</div>
        </Form.Group>

        <Form.Group controlId='v2-city'>
          <Form.Label>City</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter city'
            value={city}
            className={shippingErrors.city ? 'is-invalid' : ''}
            onChange={(e) => {
              setCity(e.target.value)
              if (shippingErrors.city)
                setShippingErrors((prev) => ({ ...prev, city: '' }))
            }}
          />
          <div className='invalid-feedback'>{shippingErrors.city}</div>
        </Form.Group>

        <Form.Group controlId='v2-postalCode'>
          <Form.Label>Postal Code</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter postal code'
            value={postalCode}
            className={shippingErrors.postalCode ? 'is-invalid' : ''}
            onChange={(e) => {
              setPostalCode(e.target.value)
              if (shippingErrors.postalCode)
                setShippingErrors((prev) => ({ ...prev, postalCode: '' }))
            }}
          />
          <div className='invalid-feedback'>
            {shippingErrors.postalCode}
          </div>
        </Form.Group>

        <Form.Group controlId='v2-country'>
          <Form.Label>Country</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter country'
            value={country}
            className={shippingErrors.country ? 'is-invalid' : ''}
            onChange={(e) => {
              setCountry(e.target.value)
              if (shippingErrors.country)
                setShippingErrors((prev) => ({ ...prev, country: '' }))
            }}
          />
          <div className='invalid-feedback'>{shippingErrors.country}</div>
        </Form.Group>
      </Form>
    </div>
  )

  const renderPaymentPanel = () => (
    <div className={panelClass('payment')}>
      <h2>Payment Method</h2>
      <Form>
        <Form.Group>
          <Form.Label as='legend'>Select Method</Form.Label>
          <Col>
            <Form.Check
              type='radio'
              label='PayPal or Credit Card'
              id='v2-PayPal'
              name='paymentMethod'
              value='PayPal'
              checked={selectedPayment === 'PayPal'}
              onChange={(e) => setSelectedPayment(e.target.value)}
            />
          </Col>
        </Form.Group>
      </Form>
    </div>
  )

  const renderReviewPanel = () => (
    <div className={panelClass('review')}>
      <ListGroup variant='flush'>
        <ListGroup.Item>
          <h2>Shipping</h2>
          <p>
            <strong>Address:</strong> {cart.shippingAddress.address},{' '}
            {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{' '}
            {cart.shippingAddress.country}
          </p>
          <Button
            variant='link'
            className='p-0'
            onClick={() => goToStep('shipping')}
          >
            Edit
          </Button>
        </ListGroup.Item>

        <ListGroup.Item>
          <h2>Payment Method</h2>
          <strong>Method: </strong> {cart.paymentMethod}
          <br />
          <Button
            variant='link'
            className='p-0'
            onClick={() => goToStep('payment')}
          >
            Edit
          </Button>
        </ListGroup.Item>

        <ListGroup.Item>
          <h2>Order Items</h2>
          {cartItems.length === 0 ? (
            <Message>Your cart is empty</Message>
          ) : (
            <ListGroup variant='flush'>
              {cartItems.map((item, index) => (
                <ListGroup.Item key={index}>
                  <Row>
                    <Col md={1}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fluid
                        rounded
                      />
                    </Col>
                    <Col>
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </Col>
                    <Col md={4}>
                      {item.qty} x ${item.price} = $
                      {item.qty * item.price}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </ListGroup.Item>

        {giftMessageEnabled && (
          <ListGroup.Item>
            <Form.Group controlId='v2-isGift' className='mb-0'>
              <Form.Check
                type='checkbox'
                label='This is a gift order'
                checked={isGift}
                onChange={(e) => {
                  setIsGift(e.target.checked)
                  if (!e.target.checked) setGiftMessage('')
                }}
              />
            </Form.Group>
            {isGift && (
              <Form.Group controlId='v2-giftMessage' className='mt-2 mb-0'>
                <Form.Label>Gift Message</Form.Label>
                <Form.Control
                  as='textarea'
                  rows={3}
                  maxLength={200}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder='Add a personal message...'
                />
                <Form.Text className='text-muted'>
                  {giftMessage.length}/200
                </Form.Text>
              </Form.Group>
            )}
          </ListGroup.Item>
        )}
      </ListGroup>
    </div>
  )

  const renderActionButtons = () => {
    const isReview = currentStep === 'review'
    return (
      <div className='d-flex justify-content-between mt-4'>
        <Button variant='outline-secondary' onClick={handleBack}>
          {currentStep === 'shipping' ? 'Back to Cart' : 'Back'}
        </Button>
        {isReview ? (
          <Button
            variant='primary'
            disabled={cartItems.length === 0}
            onClick={placeOrderHandler}
          >
            Place Order
          </Button>
        ) : (
          <Button variant='primary' onClick={handleContinue}>
            Continue
          </Button>
        )}
      </div>
    )
  }

  const renderOrderSummary = () => (
    <Col md={4}>
      <Card>
        <ListGroup variant='flush'>
          <ListGroup.Item>
            <h2>Order Summary</h2>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row>
              <Col>Items</Col>
              <Col>${itemsPrice}</Col>
            </Row>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row>
              <Col>Shipping</Col>
              <Col>${shippingPrice}</Col>
            </Row>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row>
              <Col>Tax</Col>
              <Col>${taxPrice}</Col>
            </Row>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row>
              <Col>Total</Col>
              <Col>${totalPrice}</Col>
            </Row>
          </ListGroup.Item>
          {currentStep === 'review' && (
            <>
              <ListGroup.Item>
                {error && <Message variant='danger'>{error}</Message>}
              </ListGroup.Item>
            </>
          )}
        </ListGroup>
      </Card>
    </Col>
  )

  return (
    <div className='checkout-v2'>
      <CheckoutStepperV2
        currentStep={currentStep}
        onStepClick={goToStep}
      />
      <Row>
        <Col md={8}>
          {renderShippingPanel()}
          {renderPaymentPanel()}
          {renderReviewPanel()}
          {renderActionButtons()}
        </Col>
        {renderOrderSummary()}
      </Row>
    </div>
  )
}

export default MultiStepCheckoutScreen
