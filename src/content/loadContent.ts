import yaml from 'js-yaml'
import { buildContent, ContentError, type Content } from './schema'

/**
 * Fetch, parse and validate the content file at runtime so a content editor can
 * change public/content.yaml and simply refresh — no rebuild required.
 *
 * Returns a typed, reference-resolved Content object, or throws a ContentError
 * with friendly, located issues (handled by the app's error screen).
 */
export async function loadContent(signal?: AbortSignal): Promise<Content> {
  const url = `${import.meta.env.BASE_URL}content.yaml`

  let text: string
  try {
    const res = await fetch(url, { signal, cache: 'no-cache' })
    if (!res.ok) {
      throw new ContentError([
        { where: 'content.yaml', message: `could not be loaded (HTTP ${res.status}). Expected at ${url}.` },
      ])
    }
    text = await res.text()
  } catch (err) {
    if (err instanceof ContentError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new ContentError([
      { where: 'content.yaml', message: `could not be fetched from ${url}. ${(err as Error).message}` },
    ])
  }

  let data: unknown
  try {
    data = yaml.load(text)
  } catch (err) {
    const e = err as { reason?: string; mark?: { line?: number } }
    const line = e.mark?.line != null ? ` (line ${e.mark.line + 1})` : ''
    throw new ContentError([{ where: `content.yaml${line}`, message: `is not valid YAML: ${e.reason ?? (err as Error).message}` }])
  }

  return buildContent(data)
}
