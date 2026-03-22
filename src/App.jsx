// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root component — manages screen routing and shared state
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { usePlayer } from './hooks/usePlayer.js'
import IntroScreen   from './screens/IntroScreen.jsx'
import MapScreen     from './screens/MapScreen.jsx'
import CityScreen    from './screens/CityScreen.jsx'
import BuildingScreen from './screens/BuildingScreen.jsx'
import PuzzleScreen  from './screens/PuzzleScreen.jsx'
import StatsPanel    from './components/StatsPanel.jsx'

// Screen transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.25, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.15 } },
}

export default function App() {
  const { loaded, loadFromStorage } = usePlayer()
  const player = usePlayer()

  // Current navigation state
  const [screen, setScreen]     = useState('intro')
  const [cityId, setCityId]     = useState('delhi')
  const [building, setBuilding] = useState(null)
  const [floor, setFloor]       = useState(0)
  const [room, setRoom]         = useState(0)
  const [showStats, setShowStats] = useState(false)

  // Load saved player on mount
  useEffect(() => { loadFromStorage() }, [])

  // If player was already created, skip intro
  useEffect(() => {
    if (loaded && player.createdAt) setScreen('map')
  }, [loaded])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-game-bg">
        <div className="text-5xl animate-float">🗺️</div>
      </div>
    )
  }

  // ── Navigation handlers ──────────────────────────────────────

  const goToMap      = () => setScreen('map')
  const goToCity     = (id)  => { setCityId(id); setScreen('city') }
  const goToBuilding = (b)   => { setBuilding(b); setScreen('building') }
  const goToPuzzle   = (f, r) => { setFloor(f); setRoom(r); setScreen('puzzle') }

  const handleIntroComplete = () => setScreen('map')

  const handlePuzzleComplete = async (stars, hpAfter, coinsAfter, xpAfter) => {
    await player.completeRoom(cityId, building.id, floor, room, stars, hpAfter, coinsAfter, xpAfter)
    setScreen('building')
  }

  const screens = {
    intro:    <IntroScreen   key="intro"    onComplete={handleIntroComplete} />,
    map:      <MapScreen     key="map"      onSelectCity={goToCity} onShowStats={() => setShowStats(true)} />,
    city:     <CityScreen    key="city"     cityId={cityId} onEnterBuilding={goToBuilding} onBack={goToMap} />,
    building: <BuildingScreen key="building" building={building} cityId={cityId} onEnterRoom={goToPuzzle} onBack={() => setScreen('city')} />,
    puzzle:   <PuzzleScreen  key="puzzle"   building={building} cityId={cityId} floor={floor} room={room} onComplete={handlePuzzleComplete} onBack={() => setScreen('building')} />,
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-game-bg overflow-hidden relative">
      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1e2d42', color: 'white', border: '1px solid rgba(255,255,255,0.1)' },
          duration: 2000,
        }}
      />

      {/* Stats overlay */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            className="absolute inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <StatsPanel onClose={() => setShowStats(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main screen */}
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          variants={pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="min-h-screen"
        >
          {screens[screen]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
