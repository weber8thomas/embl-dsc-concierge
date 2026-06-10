import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Content } from './content/schema'
import { useGame } from './game/useGame'
import { Landing } from './screens/Landing'
import { Swipe } from './screens/Swipe'
import { Reveal } from './screens/Reveal'
import { Recap } from './screens/Recap'
import { Directory } from './screens/Directory'

type Screen = 'landing' | 'swipe' | 'reveal' | 'recap' | 'directory'

/**
 * Screen state machine for the game, given validated content. Kept separate from
 * App so the useGame hook only runs once content exists.
 */
export function Concierge({ content }: { content: Content }) {
  const reduced = useReducedMotion()
  const game = useGame(content.scenarios)
  // Optional deep-link: visiting #directory opens the directory directly.
  const initialScreen: Screen =
    typeof window !== 'undefined' && window.location.hash === '#directory' ? 'directory' : 'landing'
  const [screen, setScreen] = useState<Screen>(initialScreen)
  // Where the directory was opened from, so Back returns there.
  const [directoryOrigin, setDirectoryOrigin] = useState<Screen>('landing')

  function start() {
    game.restart()
    setScreen('swipe')
  }

  function handleAnswer(guess: boolean) {
    game.answer(guess)
    setScreen('reveal')
  }

  function handleNext() {
    if (game.index >= game.total - 1) {
      setScreen('recap')
    } else {
      game.next()
      setScreen('swipe')
    }
  }

  function openDirectory(from: Screen) {
    setDirectoryOrigin(from)
    setScreen('directory')
  }

  function goHome() {
    setScreen('landing')
  }

  // A key that changes on every meaningful view so AnimatePresence transitions.
  const viewKey = screen === 'swipe' || screen === 'reveal' ? `${screen}-${game.index}` : screen

  function renderScreen() {
    switch (screen) {
      case 'landing':
        return <Landing onStart={start} onDirectory={() => openDirectory('landing')} />
      case 'swipe':
        return game.current ? (
          <Swipe
            scenario={game.current}
            index={game.index}
            total={game.total}
            streak={game.streak}
            onAnswer={handleAnswer}
            onHome={goHome}
          />
        ) : null
      case 'reveal':
        return game.currentAnswer ? (
          <Reveal
            answer={game.currentAnswer}
            isLast={game.index >= game.total - 1}
            onNext={handleNext}
            onHome={goHome}
          />
        ) : null
      case 'recap':
        return (
          <Recap
            score={game.score}
            total={game.total}
            bestStreak={game.bestStreak}
            entities={game.matchedEntities}
            onPlayAgain={start}
            onDirectory={() => openDirectory('recap')}
            onHome={goHome}
          />
        )
      case 'directory':
        return <Directory content={content} onBack={() => setScreen(directoryOrigin)} />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={viewKey}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduced ? undefined : { opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderScreen()}
      </motion.div>
    </AnimatePresence>
  )
}
