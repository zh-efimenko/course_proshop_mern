import {
  FEATURE_FLAGS_REQUEST,
  FEATURE_FLAGS_SUCCESS,
  FEATURE_FLAGS_FAIL,
} from '../constants/featureFlagConstants'

export const featureFlagsReducer = (state = { flags: [] }, action) => {
  switch (action.type) {
    case FEATURE_FLAGS_REQUEST:
      return { loading: true, flags: [] }
    case FEATURE_FLAGS_SUCCESS:
      return { loading: false, flags: action.payload }
    case FEATURE_FLAGS_FAIL:
      return { loading: false, error: action.payload, flags: [] }
    default:
      return state
  }
}
