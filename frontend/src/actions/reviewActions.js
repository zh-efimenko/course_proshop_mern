import axios from 'axios'
import {
  PENDING_REVIEWS_REQUEST,
  PENDING_REVIEWS_SUCCESS,
  PENDING_REVIEWS_FAIL,
  REVIEW_MODERATE_REQUEST,
  REVIEW_MODERATE_SUCCESS,
  REVIEW_MODERATE_FAIL,
} from '../constants/reviewConstants'

export const listPendingReviews = () => async (dispatch, getState) => {
  try {
    dispatch({ type: PENDING_REVIEWS_REQUEST })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: { Authorization: `Bearer ${userInfo.token}` },
    }

    const { data } = await axios.get('/api/products/reviews', config)
    dispatch({ type: PENDING_REVIEWS_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: PENDING_REVIEWS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}

export const moderateReview = (productId, reviewId, status) => async (
  dispatch,
  getState
) => {
  try {
    dispatch({ type: REVIEW_MODERATE_REQUEST })

    const {
      userLogin: { userInfo },
    } = getState()

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    }

    await axios.put(
      `/api/products/${productId}/reviews/${reviewId}`,
      { status },
      config
    )
    dispatch({ type: REVIEW_MODERATE_SUCCESS })
  } catch (error) {
    dispatch({
      type: REVIEW_MODERATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}
