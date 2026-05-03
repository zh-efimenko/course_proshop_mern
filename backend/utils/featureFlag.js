import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FEATURES_PATH = path.join(__dirname, '..', 'features.json')

const CACHE_TTL_MS = 5 * 1000
let cachedFlags = null
let cacheTimestamp = 0

async function loadFlags() {
  const now = Date.now()
  if (cachedFlags && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedFlags
  }

  const raw = await readFile(FEATURES_PATH, 'utf-8')
  cachedFlags = JSON.parse(raw)
  cacheTimestamp = now
  return cachedFlags
}

function invalidateCache() {
  cachedFlags = null
  cacheTimestamp = 0
}

async function isFeatureEnabled(flagKey, { isAdmin = false, bucket = null } = {}) {
  const flags = await loadFlags()
  const flag = flags[flagKey]

  if (!flag) return false
  if (flag.status === 'Enabled') return true
  if (flag.status === 'Testing' && flag.traffic_percentage > 0) {
    if (isAdmin) return true
    const effective = bucket !== null ? bucket : Math.random() * 100
    return effective < flag.traffic_percentage
  }
  return false
}

function parseBucketHeader(req) {
  const raw = req.headers['x-ff-bucket']
  if (!raw) return null
  const v = parseFloat(raw)
  if (isNaN(v)) return null
  return Math.min(1, Math.max(0, v)) * 100
}

export { isFeatureEnabled, invalidateCache, parseBucketHeader }
