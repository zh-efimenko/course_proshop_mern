import { useMemo } from 'react'
import { useSelector } from 'react-redux'

const TRAFFIC_KEY = 'ff_traffic_bucket'

function getOrCreateTrafficBucket() {
  let bucket = sessionStorage.getItem(TRAFFIC_KEY)
  if (!bucket) {
    bucket = String(Math.random())
    sessionStorage.setItem(TRAFFIC_KEY, bucket)
  }
  return parseFloat(bucket) * 100
}

export default function useFeatureEnabled(flagKey) {
  const { flags } = useSelector((state) => state.featureFlags)
  const { userInfo } = useSelector((state) => state.userLogin)
  const isAdmin = userInfo?.isAdmin === true

  return useMemo(() => {
    const flag = flags.find((f) => f.key === flagKey)
    if (!flag) return false
    if (flag.status === 'Enabled') return true
    if (flag.status === 'Testing' && flag.traffic_percentage > 0) {
      return isAdmin || getOrCreateTrafficBucket() < flag.traffic_percentage
    }
    return false
  }, [flags, flagKey, isAdmin])
}
