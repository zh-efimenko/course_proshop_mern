import {
  FEATURE_FLAGS_REQUEST,
  FEATURE_FLAGS_SUCCESS,
  FEATURE_FLAGS_FAIL,
  FEATURE_FLAG_UPDATE_OPTIMISTIC,
  FEATURE_FLAG_UPDATE_SUCCESS,
  FEATURE_FLAG_UPDATE_FAIL,
} from '../constants/featureFlagConstants'

export const featureFlagsReducer = (state = { flags: [] }, action) => {
  switch (action.type) {
    case FEATURE_FLAGS_REQUEST:
      return { loading: true, flags: [] }
    case FEATURE_FLAGS_SUCCESS:
      return { loading: false, flags: action.payload }
    case FEATURE_FLAGS_FAIL:
      return { loading: false, error: action.payload, flags: [] }

    case FEATURE_FLAG_UPDATE_OPTIMISTIC: {
      const { key, patch } = action.payload
      return {
        ...state,
        updateError: undefined,
        flags: state.flags.map((f) =>
          f.key === key ? { ...f, ...patch } : f
        ),
      }
    }
    case FEATURE_FLAG_UPDATE_SUCCESS: {
      const updated = action.payload
      return {
        ...state,
        flags: state.flags.map((f) =>
          f.key === updated.key ? { ...f, ...updated } : f
        ),
      }
    }
    case FEATURE_FLAG_UPDATE_FAIL: {
      const { previous, error } = action.payload
      return {
        ...state,
        updateError: error,
        flags: state.flags.map((f) =>
          f.key === previous.key ? previous : f
        ),
      }
    }

    default:
      return state
  }
}
