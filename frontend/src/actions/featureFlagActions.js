import axios from 'axios'
import {
  FEATURE_FLAGS_REQUEST,
  FEATURE_FLAGS_SUCCESS,
  FEATURE_FLAGS_FAIL,
  FEATURE_FLAG_UPDATE_OPTIMISTIC,
  FEATURE_FLAG_UPDATE_SUCCESS,
  FEATURE_FLAG_UPDATE_FAIL,
} from '../constants/featureFlagConstants'

export const loadFeatureFlags = () => async (dispatch) => {
  try {
    dispatch({ type: FEATURE_FLAGS_REQUEST })

    const { data } = await axios.get('/api/featureflags')

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

export const updateFeatureFlag = (key, patch) => async (dispatch, getState) => {
  const {
    userLogin: { userInfo },
    featureFlags: { flags },
  } = getState()

  const previous = flags.find((f) => f.key === key)
  if (!previous) return

  dispatch({
    type: FEATURE_FLAG_UPDATE_OPTIMISTIC,
    payload: { key, patch },
  })

  try {
    const { data } = await axios.patch(`/api/featureflags/${key}`, patch, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    })

    dispatch({ type: FEATURE_FLAG_UPDATE_SUCCESS, payload: data })
  } catch (error) {
    dispatch({
      type: FEATURE_FLAG_UPDATE_FAIL,
      payload: {
        previous,
        error:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      },
    })
  }
}
