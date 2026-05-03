import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { CohereClient } from 'cohere-ai'
import { QdrantClient } from '@qdrant/js-client-rest'
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env') })

if (!process.env.COHERE_API_KEY) {
  console.error('Error: COHERE_API_KEY is not set. Add it to .env and restart.')
  process.exit(1)
}

const COLLECTION = 'proshop_docs'

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })
const qdrant = new QdrantClient({ url: process.env.QDRANT_URL || 'http://localhost:6333' })

const server = new McpServer({ name: 'proshop-rag', version: '1.0.0' })

server.tool(
  'search_project_docs',
  `Search the ProShop project knowledge base — architecture, features, API docs, runbooks, ADRs, incidents, and pages. Use this when the user asks about how something works in this codebase, how to perform an operational task, why a technology was chosen, or what a specific API endpoint does. Do NOT use this for generic programming questions unrelated to ProShop — it only knows about this project. Returns the top_k most relevant text chunks with source file and section (default 5).

Examples:
  { "query": "как задеплоить приложение в production?" }
  { "query": "почему выбрали MongoDB вместо PostgreSQL?", "top_k": 3 }
  { "query": "как работает feature flag dark_mode?" }`,
  {
    query: z.string().describe('Question in natural language (Russian or English) about the ProShop project'),
    top_k: z.number().int().min(1).max(15).default(5).describe('Number of chunks to return (1–15). Default: 5.'),
  },
  { readOnlyHint: true, destructiveHint: false, idempotentHint: true },
  async ({ query, top_k = 5 }) => {
    let collectionExists = true
    try {
      await qdrant.getCollection(COLLECTION)
    } catch {
      collectionExists = false
    }

    if (!collectionExists) {
      return {
        content: [{ type: 'text', text: JSON.stringify({
          error: 'COLLECTION_NOT_FOUND',
          message: "Collection 'proshop_docs' not found. Run: node mcp-rag/ingest.js",
        }) }],
        isError: true,
      }
    }

    let embedResponse
    try {
      embedResponse = await cohere.embed({
        texts: [query],
        model: 'embed-multilingual-v3.0',
        inputType: 'search_query',
        embeddingTypes: ['float'],
      })
    } catch (err) {
      return {
        content: [{ type: 'text', text: JSON.stringify({
          error: 'EMBED_FAILED',
          message: `Cohere embedding failed: ${err.message}. Check COHERE_API_KEY in .env.`,
        }) }],
        isError: true,
      }
    }

    const vector = embedResponse.embeddings.float[0]

    let results
    try {
      results = await qdrant.search(COLLECTION, {
        vector,
        limit: top_k,
        withPayload: true,
      })
    } catch (err) {
      return {
        content: [{ type: 'text', text: JSON.stringify({
          error: 'SEARCH_FAILED',
          message: `Qdrant search failed: ${err.message}. Check that Qdrant is running at ${process.env.QDRANT_URL || 'http://localhost:6333'}.`,
        }) }],
        isError: true,
      }
    }

    const chunks = results.map(r => ({
      score: Math.round(r.score * 100) / 100,
      source_file: r.payload.source_file,
      section: r.payload.section,
      type: r.payload.type,
      text: r.payload.text,
    }))

    return { content: [{ type: 'text', text: JSON.stringify(chunks, null, 2) }] }
  },
)

server.resource(
  'proshop-docs-index',
  'file:///proshop-docs-index',
  'Read-only list of all indexed project-data files with their type and last_modified. Use search_project_docs tool to query content.',
  async () => {
    try {
      const seen = new Map()
      let offset = undefined

      do {
        const response = await qdrant.scroll(COLLECTION, {
          limit: 100,
          offset,
          withPayload: ['source_file', 'type', 'last_modified'],
          withVector: false,
        })
        for (const point of response.points) {
          const { source_file, type, last_modified } = point.payload
          if (!seen.has(source_file)) seen.set(source_file, { source_file, type, last_modified })
        }
        offset = response.next_page_offset
      } while (offset != null)

      const index = [...seen.values()].sort((a, b) => a.source_file.localeCompare(b.source_file))
      return {
        contents: [{ uri: 'file:///proshop-docs-index', mimeType: 'application/json', text: JSON.stringify(index, null, 2) }],
      }
    } catch {
      return {
        contents: [{ uri: 'file:///proshop-docs-index', mimeType: 'application/json', text: JSON.stringify({ error: "Collection 'proshop_docs' not found. Run: node mcp-rag/ingest.js" }) }],
      }
    }
  },
)

async function main() {
  try {
    await qdrant.getCollection(COLLECTION)
  } catch {
    console.error(`Collection '${COLLECTION}' not found. Run: node mcp-rag/ingest.js`)
  }
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

main().catch(console.error)
