import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Content } from './content/schema'
import { useGame } from './game/useGame'
import { Landing } from './screens/Landing'
import { Swipe } from './screens/Swipe'
import { Reveal } from './screens/Reveal'
import { Recap } from './screens/Recap'
import { Directory } from './screens/Directory'
import { Explore, type Tab } from './screens/Explore'

type Screen = 'landing' | 'swipe' | 'reveal' | 'recap' | 'directory' | 'explore'

/** Screens that live in the URL hash, so a refresh or shared link restores them.
 * Game screens (swipe/reveal/recap) are session state and fall back to landing. */
type Route = { screen: Screen; tab?: Tab }

/** Read the current location hash into a route. Unknown hashes → landing. */
function parseHash(): Route {
  if (typeof window === 'undefined') return { screen: 'landing' }
  const raw = window.location.hash.replace(/^#\/?/, '')
  const [head, sub] = raw.split('/')
  if (head === 'explore') return { screen: 'explore', tab: sub ? (sub as Tab) : undefined }
  if (head === 'directory') return { screen: 'directory' }
  return { screen: 'landing' }
}

/** The hash string for a routable screen ('' = root, for landing and game screens). */
function toHash(screen: Screen, tab?: Tab): string {
  if (screen === 'explore') return tab ? `#explore/${tab}` : '#explore'
  if (screen === 'directory') return '#directory'
  return ''
}

/**
 * Screen state machine for the game, given validated content. Kept separate from
 * App so the useGame hook only runs once content exists.
 *
 * Navigation is mirrored into the URL hash (lightweight client-side routing): the
 * reference screens (explore/+tab, directory) survive refresh and are shareable;
 * browser Back/Forward work via the popstate/hashchange listener. Game screens are
 * kept out of the hash because they depend on the in-memory deck.
 */
export function Concierge({ content }: { content: Content }) {
  const reduced = useReducedMotion()
  const game = useGame(content.scenarios, content.game)
  const initial = parseHash()
  const [screen, setScreen] = useState<Screen>(initial.screen)
  const [exploreTab, setExploreTab] = useState<Tab | undefined>(initial.tab)
  // Where directory/explore were opened from, so Back returns there.
  const [navOrigin, setNavOrigin] = useState<Screen>('landing')

  // Browser Back/Forward (and manual hash edits) drive the screen from the URL.
  // Our own pushState/replaceState calls don't fire these, so there's no loop.
  useEffect(() => {
    const sync = () => {
      const r = parseHash()
      setScreen(r.screen)
      setExploreTab(r.tab)
    }
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => {
      window.removeEventListener('popstate', sync)
      window.removeEventListener('hashchange', sync)
    }
  }, [])

  /** Go to a screen and reflect it in the URL. `replace` avoids a history entry
   * (used for game-flow steps so Back doesn't walk card-by-card). */
  function go(next: Screen, opts: { tab?: Tab; replace?: boolean } = {}) {
    setScreen(next)
    setExploreTab(next === 'explore' ? opts.tab : undefined)
    const hash = toHash(next, opts.tab)
    const url = hash || window.location.pathname + window.location.search
    if (opts.replace) window.history.replaceState(null, '', url)
    else window.history.pushState(null, '', url)
  }

  function start() {
    game.restart()
    go('swipe', { replace: true })
  }

  function handleAnswer(guess: boolean) {
    game.answer(guess)
    go('reveal', { replace: true })
  }

  function handleNext() {
    if (game.index >= game.total - 1) {
      go('recap', { replace: true })
    } else {
      game.next()
      go('swipe', { replace: true })
    }
  }

  function openDirectory(from: Screen) {
    setNavOrigin(from)
    go('directory')
  }

  function openExplore(from: Screen) {
    setNavOrigin(from)
    go('explore')
  }

  // Back from a reference screen: return to wherever it was opened from. Game
  // origins (recap) aren't routable, so replace the hash rather than push.
  function back() {
    go(navOrigin, { replace: navOrigin !== 'landing' })
  }

  function goHome() {
    go('landing', { replace: true })
  }

  // A key that changes on every meaningful view so AnimatePresence transitions.
  const viewKey =
    screen === 'swipe' || screen === 'reveal' ? `${screen}-${game.index}` : screen === 'explore' ? `explore-${exploreTab ?? ''}` : screen

  function renderScreen() {
    switch (screen) {
      case 'landing':
        return (
          <Landing
            onStart={start}
            onDirectory={() => openDirectory('landing')}
            onExplore={() => openExplore('landing')}
          />
        )
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
        ) : (
          // Refreshed mid-game (no deck position): drop back to landing.
          <Landing onStart={start} onDirectory={() => openDirectory('landing')} onExplore={() => openExplore('landing')} />
        )
      case 'reveal':
        return game.currentAnswer ? (
          <Reveal
            answer={game.currentAnswer}
            competencies={content.competencies}
            isLast={game.index >= game.total - 1}
            onNext={handleNext}
            onHome={goHome}
          />
        ) : (
          <Landing onStart={start} onDirectory={() => openDirectory('landing')} onExplore={() => openExplore('landing')} />
        )
      case 'recap':
        return (
          <Recap
            score={game.score}
            total={game.total}
            bestStreak={game.bestStreak}
            results={game.answers.map((a) => Boolean(a?.correct))}
            teams={game.matchedTeams}
            onPlayAgain={start}
            onDirectory={() => openDirectory('recap')}
            onExplore={() => openExplore('recap')}
            onHome={goHome}
          />
        )
      case 'directory':
        return <Directory content={content} onBack={back} />
      case 'explore':
        return <Explore content={content} onBack={back} initialTab={exploreTab} onTabChange={(t) => go('explore', { tab: t, replace: true })} />
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
