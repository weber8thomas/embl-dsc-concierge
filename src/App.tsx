import { useEffect, useState } from 'react'
import { loadContent } from './content/loadContent'
import { ContentError, type Content } from './content/schema'
import { Concierge } from './Concierge'
import { Shell } from './components/Shell'
import { LoaderCircle, TriangleAlert } from 'lucide-react'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; content: Content }
  | { status: 'error'; error: ContentError | Error }

export default function App() {
  const [state, setState] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    const ac = new AbortController()
    loadContent(ac.signal)
      .then((content) => setState({ status: 'ready', content }))
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setState({ status: 'error', error: err as Error })
      })
    return () => ac.abort()
  }, [])

  if (state.status === 'loading') {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center text-embl-grey-dark">
          <LoaderCircle className="h-8 w-8 animate-spin text-embl-green" aria-hidden="true" />
          <p className="mt-3 text-sm">Loading…</p>
        </div>
      </Shell>
    )
  }

  if (state.status === 'error') {
    return <ContentErrorScreen error={state.error} />
  }

  return <Concierge content={state.content} />
}

/** Friendly, location-aware error screen — never a blank crash. */
function ContentErrorScreen({ error }: { error: ContentError | Error }) {
  const issues = error instanceof ContentError ? error.issues : null
  return (
    <Shell>
      <div className="flex flex-1 flex-col justify-center py-10">
        <div className="rounded-2xl border-2 border-embl-red/30 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-embl-red">
            <TriangleAlert className="h-6 w-6" aria-hidden="true" />
            <h1 className="text-xl font-bold">Couldn’t load the content</h1>
          </div>
          <p className="mt-3 text-sm text-embl-grey-dark">
            There’s a problem in <code className="font-mono">public/content.yaml</code>. Fix the item(s) below and refresh.
            You can also run <code className="font-mono">npm run validate</code> to check the file.
          </p>
          {issues ? (
            <ul className="mt-4 space-y-2">
              {issues.map((iss, i) => (
                <li key={i} className="rounded-lg bg-embl-grey-lightest/50 p-3 text-sm">
                  <span className="font-semibold text-embl-grey-darkest">{iss.where}</span>
                  <span className="text-embl-grey-dark">: {iss.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <pre className="mt-4 overflow-auto rounded-lg bg-embl-grey-lightest/50 p-3 text-sm text-embl-grey-darkest">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    </Shell>
  )
}
