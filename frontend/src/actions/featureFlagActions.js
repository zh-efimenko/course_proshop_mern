import axios from 'axios'
import {
  FEATURE_FLAGS_REQUEST,
  FEATURE_FLAGS_SUCCESS,
  FEATURE_FLAGS_FAIL,
} from '../constants/featureFlagConstants'

export const loadFeatureFlags = () => async (dispatch) => {
  try {
    dispatch({ type: FEATURE_FLAGS_REQUEST })

    const { data } = await axios.get('/api/featureflags')

    // Convert object { key: {...} } to array [{ key, ...rest }]
    const flags = Object.entries(data).map(([key, value]) => ({
      key,
      ...value,
    }))

    dispatch({ type: FEATURE_FLAGS_SUCCESS, payload: flags })
  } catch (error) {
    dispatch({
      type: FEATURE_FLAGS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}
