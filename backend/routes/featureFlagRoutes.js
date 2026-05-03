import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import asyncHandler from 'express-async-handler'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const router = express.Router()

router.get('/', asyncHandler(async (req, res) => {
  const filePath = path.join(__dirname, '..', 'features.json')

  let raw
  try {
    raw = await readFile(filePath, 'utf-8')
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(503)
      throw new Error('Feature flags configuration is temporarily unavailable')
    }
    throw err
  }

  let data
  try {
    data = JSON.parse(raw)
  } catch {
    res.status(500)
    throw new Error('Feature flags file contains invalid JSON')
  }

  res.json(data)
}))

export default router
