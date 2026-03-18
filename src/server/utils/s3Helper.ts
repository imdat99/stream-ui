// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
import { AwsClient } from 'aws4fetch';

export type Part = {
  index: number
  host: string
  url: string
}

export type Manifest = {
  version: 1
  id: string
  filename: string
  total_parts: number
  parts: Part[]
  createdAt: number
  expiresAt: number
  size: number
}

// ---------------------------------------------------------------------------
// S3 Config
// ---------------------------------------------------------------------------

const S3_ENDPOINT = "https://minio1.webtui.vn:9000"
const BUCKET_NAME = "bucket-lethdat"

const aws = new AwsClient({
  accessKeyId: "lethdat",
  secretAccessKey: "D@tkhong9",
  service: 's3',
  region: 'auto'
});

// ---------------------------------------------------------------------------
// S3 Operations
// ---------------------------------------------------------------------------

const OBJECT_KEY = (id: string) => `${id}.json`

/** Persist a manifest as JSON in MinIO. */
export async function saveManifest(manifest: Manifest): Promise<void> {
  const url = `${S3_ENDPOINT}/${BUCKET_NAME}/${OBJECT_KEY(manifest.id)}`;

  const response = await aws.fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(manifest),
  });

  if (!response.ok) {
    throw new Error(`Failed to save manifest: ${response.status} ${await response.text()}`)
  }
}

/** Fetch a manifest from MinIO. */
export async function getManifest(id: string): Promise<Manifest | null> {
  const url = `${S3_ENDPOINT}/${BUCKET_NAME}/${OBJECT_KEY(id)}`;

  try {
    const response = await aws.fetch(url, {
      method: 'GET',
    });

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to get manifest: ${response.status}`)
    }

    const text = await response.text()
    const manifest: Manifest = JSON.parse(text)

    if (manifest.expiresAt < Date.now()) {
      await deleteManifest(id).catch(() => { })
      return null
    }

    return manifest
  } catch (error) {
    return null
  }
}

/** Remove a manifest object from MinIO. */
export async function deleteManifest(id: string): Promise<void> {
  const url = `${S3_ENDPOINT}/${BUCKET_NAME}/${OBJECT_KEY(id)}`;

  const response = await aws.fetch(url, {
    method: 'DELETE',
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete manifest: ${response.status}`)
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Allowed chunk source hosts
const ALLOWED_HOSTS = [
  'tmpfiles.org',
  'gofile.io',
  'pixeldrain.com',
  'uploadfiles.io',
  'anonfiles.com',
]

/** Returns an error message if any URL is disallowed, otherwise null. */
export function validateChunkUrls(chunks: string[]): boolean {
  for (const u of chunks) {
    try {
      const { hostname } = new URL(u)
      if (!ALLOWED_HOSTS.some(h => hostname.includes(h))) {
        return false
      }
    } catch {
        return false
    }
  }
  return true
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export function detectHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'unknown'
  }
}

function formatUrl(url: string): string {
  if (url.includes("tmpfiles.org/") && !url.includes("tmpfiles.org/dl/")) {
    return url.trim().replace("tmpfiles.org/", 'tmpfiles.org/dl/')
  }
  return url.trim()
}

/** List all manifests in bucket (simple implementation). */
export async function getListFiles(): Promise<string[]> {
  // For now return empty array - implement listing if needed
  // MinIO S3 ListObjectsV2 would require XML parsing
  return []
}

/** Build a new Manifest. */
export function createManifest(
  filename: string,
  chunks: string[],
  size: number,
  ttlMs = 60 * 60 * 1000,
): Manifest {
  const id = crypto.randomUUID()
  const now = Date.now()
  return {
    version: 1,
    id,
    filename: sanitizeFilename(filename),
    total_parts: chunks.length,
    parts: chunks.map((url, index) => ({ index, host: detectHost(url), url: formatUrl(url) })),
    createdAt: now,
    expiresAt: now + ttlMs,
    size,
  }
}

// ---------------------------------------------------------------------------
// Streaming
// ---------------------------------------------------------------------------

/** Streams all parts in index order as one continuous ReadableStream. */
export function streamManifest(manifest: Manifest): ReadableStream<Uint8Array> {
  const parts = [...manifest.parts].sort((a, b) => a.index - b.index)
  const RETRY = 3
  return new ReadableStream({
    async start(controller) {
      for (const part of parts) {
        let attempt = 0
        let ok = false
        while (attempt < RETRY && !ok) {
          attempt++
          try {
            const res = await fetch(formatUrl(part.url))
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const reader = res.body!.getReader()
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              controller.enqueue(value)
            }
            ok = true
          } catch (err: any) {
            if (attempt >= RETRY) {
              controller.error(new Error(`Part ${part.index} failed: ${err?.message ?? err}`))
              return
            }
            await new Promise(r => setTimeout(r, 1000 * attempt))
          }
        }
      }
      controller.close()
    },
  })
}
export async function saveImageFromStream(stream: ArrayBuffer, filename: string): Promise<void> {
  // Implement this function to save the thumbnail image stream to storage and update the database with the thumbnail URL
  const url = `${S3_ENDPOINT}/${BUCKET_NAME}/${filename}.jpg`;

  const response = await aws.fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'image/jpeg',
    },
    body: stream,
  });

  if (!response.ok) {
    throw new Error(`Failed to save thumbnail: ${response.status} ${await response.text()}`)
  }
}