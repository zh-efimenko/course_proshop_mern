import {
  PENDING_REVIEWS_REQUEST,
  PENDING_REVIEWS_SUCCESS,
  PENDING_REVIEWS_FAIL,
  REVIEW_MODERATE_REQUEST,
  REVIEW_MODERATE_SUCCESS,
  REVIEW_MODERATE_FAIL,
  REVIEW_MODERATE_RESET,
} from '../constants/reviewConstants'

export const pendingReviewsReducer = (state = { reviews: [] }, action) => {
  switch (action.type) {
    case PENDING_REVIEWS_REQUEST:
      return { loading: true, reviews: [] }
    case PENDING_REVIEWS_SUCCESS:
      return { loading: false, reviews: action.payload }
    case PENDING_REVIEWS_FAIL:
      return { loading: false, error: action.payload, reviews: [] }
    default:
      return state
  }
}

export const reviewModerateReducer = (state = {}, action) => {
  switch (action.type) {
    case REVIEW_MODERATE_REQUEST:
      return { loading: true }
    case REVIEW_MODERATE_SUCCESS:
      return { loading: false, success: true }
    case REVIEW_MODERATE_FAIL:
      return { loading: false, error: action.payload }
    case REVIEW_MODERATE_RESET:
      return {}
    default:
      return state
  }
}
