# RAG MCP Server — Design Spec

**Date:** 2026-05-03
**Status:** Approved

---

## Goal

Load all `project-data/` markdown files into Qdrant, expose semantic search via an MCP server so Claude Code can retrieve relevant documentation context when answering questions about the ProShop project.

---

## File Structure

```
mcp-rag/
  index.js          # MCP server — search_project_docs tool
  ingest.js         # One-shot ingestion script
  package.json      # ES modules, dependencies

docs/rag/
  docker_qdrant.sh  # Start Qdrant in Docker (mirrors docs/docker_mongo.sh)
  qdrant-data/      # Docker volume directory (gitignored)
```

Root `.env` additions:
```
COHERE_API_KEY=...
QDRANT_URL=http://localhost:6333
```

`.mcp.json` entry (same pattern as `features` server):
```json
{
  "mcpServers": {
    "features": { "command": "node", "args": ["mcp-features/index.js"] },
    "proshop-rag": { "command": "node", "args": ["mcp-rag/index.js"] }
  }
}
```

Credentials are read via `process.env` — never passed in `.mcp.json`.

---

## Ingestion Pipeline (`ingest.js`)

Run manually: `node mcp-rag/ingest.js`
Re-run any time `project-data/` changes.

**Steps:**

1. **Walk** — recursively find all `.md` files in `project-data/`

2. **Metadata** — per file:
    - `source_file` — relative path (`project-data/runbooks/deploy.md`)
    - `type` — inferred from directory:
      ```
      runbooks/  → runbook
      incidents/ → incident
      adrs/      → adr
      features/  → feature
      api/       → api
      pages/     → page
      root       → doc
      ```
    - `last_modified` — file `mtime` as ISO string

3. **Chunking** — split by `##` headings:
    - Section ≤ 512 tokens → one chunk
    - Section > 512 tokens → split on paragraph boundaries into ~400-token chunks
    - Chunks < 50 tokens → skipped (empty sections)
    - No overlap (natural heading boundaries)

4. **Embeddings** — Cohere `embed-multilingual-v3.0`, `input_type: search_document`
    - Batch size: 96 (Cohere API limit)

5. **Upsert** — Qdrant collection `proshop_docs`
    - Vector: 1024 dimensions, Cosine distance
    - Payload per point:
      ```json
      {
        "source_file": "project-data/runbooks/deploy.md",
        "section": "## Rollback procedure",
        "type": "runbook",
        "last_modified": "2025-04-10T12:00:00.000Z",
        "text": "...chunk text..."
      }
      ```

6. **Idempotency** — `recreate_collection` before every upsert. Re-running ingest always produces a clean, deduplicated result.

---

## MCP Server (`index.js`)

**Type:** Read-only (per mcp-design-principles.md, Part 7 — same archetype as Context7).

### Tool: `search_project_docs`

**Signature:** `search_project_docs(query: str, top_k: int = 5) -> List[Chunk]`

**Description (written for the model):**

> Search the ProShop project knowledge base — architecture, features, API docs, runbooks, ADRs, incidents, and pages. Use this when the user asks about how something works in this codebase, how to perform an operational task, why a technology was chosen, or what a specific API endpoint does. Do NOT use this for generic programming questions unrelated to ProShop — it only knows about this project. Returns the top_k most relevant text chunks with source file and section.

**Parameters:**
- `query` (string, required) — question in natural language (Russian or English)
- `top_k` (integer, optional, default 5) — number of chunks to return (1–15)

**Annotations:**
```js
{ readOnlyHint: true, destructiveHint: false, idempotentHint: true }
```

**Input examples (3, for +18% call accuracy per mcp-design-principles):**
```json
{ "query": "как задеплоить приложение в production?" }
{ "query": "почему выбрали MongoDB вместо PostgreSQL?", "top_k": 3 }
{ "query": "как работает feature flag dark_mode?" }
```

**Response shape:**
```json
[
  {
    "score": 0.91,
    "source_file": "project-data/runbooks/deploy.md",
    "section": "## Deploy to production",
    "type": "runbook",
    "text": "...relevant chunk..."
  }
]
```

**Startup check:** on server init, verify Qdrant is reachable and collection `proshop_docs` exists. If not:
```
Collection 'proshop_docs' not found. Run: node mcp-rag/ingest.js
```

### Resource: `proshop-docs-index`

Read-only list of all indexed source files with their `type` and `last_modified`. Claude can read without calling the tool.

---

## Qdrant Docker

`docs/rag/docker_qdrant.sh`:
```bash
docker run -d -p 6333:6333 --name qdrant \
  -v "$(pwd)/docs/rag/qdrant-data:/qdrant/storage" \
  qdrant/qdrant
```

`docs/rag/qdrant-data/` is gitignored (binary vector data).

---

## Dependencies (`mcp-rag/package.json`)

```json
{
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.29.0",
    "@qdrant/js-client-rest": "^1.x",
    "cohere-ai": "^7.x",
    "dotenv": "^16.x",
    "zod": "^3.x"
  }
}
```

---

## MCP Design Principles Applied

| Principle | Applied |
|---|---|
| 1 Tool (well under 5–15 limit) | ✓ Only `search_project_docs` |
| Tool description as prompt | ✓ 4 sentences + 3 examples |
| No destructive operations | ✓ Read-only, `readOnlyHint: true` |
| Credentials not in config files | ✓ `process.env` only |
| Static data as Resource | ✓ `proshop-docs-index` resource |
| Error messages as instructions | ✓ Tells user exactly what command to run |
| Multilingual queries | ✓ `embed-multilingual-v3.0` |
