import { motion } from 'framer-motion'
import { BookOpen, Compass, RotateCcw } from 'lucide-react'
import type { TeamWithId } from '../content/schema'
import { Shell } from '../components/Shell'
import { TeamIcon } from '../components/TeamIcon'
import { TeamActions } from '../components/TeamActions'

interface RecapProps {
  score: number
  total: number
  bestStreak: number
  teams: TeamWithId[]
  onPlayAgain: () => void
  onDirectory: () => void
  onExplore: () => void
  onHome: () => void
}

export function Recap({ score, total, bestStreak, teams, onPlayAgain, onDirectory, onExplore, onHome }: RecapProps) {
  return (
    <Shell onHome={onHome}>
      <motion.div
        className="flex flex-1 flex-col py-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-center text-3xl font-bold text-embl-grey-darkest">Nicely done!</h1>

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
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-embl-green px-8 py-3.5 text-lg font-semibold text-white transition-colors hover:bg-embl-green-dark"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Play again
          </button>
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
