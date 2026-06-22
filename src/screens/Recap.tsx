import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Check, Compass, RotateCcw, Share2, X } from 'lucide-react'
import type { TeamWithId } from '../content/schema'
import { Shell } from '../components/Shell'
import { TeamIcon } from '../components/TeamIcon'
import { TeamActions } from '../components/TeamActions'

interface RecapProps {
  score: number
  total: number
  bestStreak: number
  /** Correct/incorrect for each card, in the order they were played. */
  results: boolean[]
  teams: TeamWithId[]
  onPlayAgain: () => void
  onDirectory: () => void
  onExplore: () => void
  onHome: () => void
}

/** A headline that reflects how the round actually went. */
function verdict(score: number, total: number): { title: string; sub: string } {
  const pct = total > 0 ? score / total : 0
  if (pct === 1) return { title: 'Perfect round! 🎯', sub: 'You know exactly who to ask.' }
  if (pct >= 0.8) return { title: 'Nicely done!', sub: 'You can spot a data-science question.' }
  if (pct >= 0.5) return { title: 'Good triaging!', sub: 'A few more rounds and you’ll have it down.' }
  return { title: 'Warming up!', sub: 'The directory below shows who does what.' }
}

export function Recap({ score, total, bestStreak, results, teams, onPlayAgain, onDirectory, onExplore, onHome }: RecapProps) {
  const [copied, setCopied] = useState(false)
  const { title, sub } = verdict(score, total)

  async function share() {
    const grid = results.map((r) => (r ? '🟢' : '⚪')).join('')
    const url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
    const text = `DSC Concierge — ${score}/${total} correct · best streak ${bestStreak}\n${grid}`
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: 'DSC Concierge', text, url })
        return
      }
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* user dismissed the share sheet — nothing to do */
    }
  }

  return (
    <Shell onHome={onHome}>
      <motion.div
        className="flex flex-1 flex-col py-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-center text-3xl font-bold text-embl-grey-darkest">{title}</h1>
        <p className="mt-1 text-center text-embl-grey-dark">{sub}</p>

        {results.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-1.5" aria-label="Per-question results">
            {results.map((r, i) => (
              <span
                key={i}
                title={`Q${i + 1}: ${r ? 'correct' : 'missed'}`}
                className={`grid h-6 w-6 place-items-center rounded-full ${
                  r ? 'bg-embl-green text-white' : 'bg-embl-grey-lightest text-embl-grey'
                }`}
              >
                {r ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <div className="rounded-2xl bg-embl-green-lightest px-6 py-4 text-center">
            <div className="text-3xl font-bold text-embl-green-darkest">
              {score}/{total}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-embl-green-dark">Correct</div>
          </div>
          <div className="rounded-2xl bg-embl-green-lightest px-6 py-4 text-center">
            <div className="text-3xl font-bold text-embl-green-darkest">{bestStreak}</div>
            <div className="text-xs font-semibold uppercase tracking-wide text-embl-green-dark">Best streak</div>
          </div>
        </div>

        {teams.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-embl-grey-darkest">Where to go for what you saw</h2>
            <p className="mt-1 text-sm text-embl-grey-dark">
              Your personalised shortlist of teams and channels from this round.
            </p>

            <ul className="mt-4 space-y-3">
              {teams.map((team) => (
                <li key={team.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-embl-grey-lightest">
                  <div className="flex items-start gap-3">
                    <TeamIcon icon={team.icon} sizeClass="h-11 w-11" iconClass="h-5 w-5" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-embl-grey-darkest">{team.name}</h3>
                      {team.blurb && <p className="mt-0.5 text-sm text-embl-grey-dark">{team.blurb}</p>}
                      <div className="mt-3">
                        <TeamActions team={team} />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onPlayAgain}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-embl-green px-8 py-3.5 text-lg font-semibold text-white transition-colors hover:bg-embl-green-dark"
            >
              <RotateCcw className="h-5 w-5" aria-hidden="true" />
              Play again
            </button>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-lg font-semibold text-embl-green-dark ring-1 ring-embl-green transition-colors hover:bg-embl-green-lightest"
            >
              {copied ? <Check className="h-5 w-5" aria-hidden="true" /> : <Share2 className="h-5 w-5" aria-hidden="true" />}
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={onDirectory}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
            >
              <BookOpen className="h-5 w-5" aria-hidden="true" />
              Scenario directory
            </button>
            <button
              type="button"
              onClick={onExplore}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-base font-semibold text-embl-link transition-colors hover:text-embl-link-hover"
            >
              <Compass className="h-5 w-5" aria-hidden="true" />
              Explore the DSC
            </button>
          </div>
        </div>
      </motion.div>
    </Shell>
  )
}
