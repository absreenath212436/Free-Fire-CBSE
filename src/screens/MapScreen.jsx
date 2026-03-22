// src/screens/MapScreen.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '../hooks/usePlayer.js'
import { CITIES, ROUTES } from '../data/cities.js'
import { BUILDINGS } from '../data/buildings.js'
import { GAME } from '../config.js'

export default function MapScreen({ onSelectCity, onShowStats }) {
  const player = usePlayer()
  const [hovCity, setHovCity] = useState(null)
  const totalCleared = player.getTotalCleared()
  const totalRooms = Object.values(BUILDINGS).flat().length * GAME.FLOORS_PER_BUILDING * GAME.ROOMS_PER_FLOOR
  const overallPct = Math.round((totalCleared / totalRooms) * 100)

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#080c18' }}>

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-orbitron font-black text-xl" style={{ color: '#FFD93D', letterSpacing: '0.08em' }}>
              🗺️ INDIA QUEST
            </h1>
            <p className="text-xs" style={{ color: '#475569' }}>
              AI Questions · 7 Subjects · Classes 1–5
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onShowStats}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
              title="Question bank stats">
              📊
            </button>
            <div className="text-right">
              <p className="font-black text-sm" style={{ color: '#6BCB77', fontFamily: 'monospace' }}>{totalCleared}/{totalRooms}</p>
              <p className="text-xs" style={{ color: '#475569' }}>rooms</p>
            </div>
          </div>
        </div>

        {/* Overall progress */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg,#FFD93D,#FF8C42)' }}
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-black" style={{ color: '#FFD93D', fontFamily: 'monospace', minWidth: 32 }}>
            {overallPct}%
          </span>
        </div>
      </div>

      {/* ── India SVG Map ── */}
      <div className="flex-1 relative overflow-hidden">
        <svg viewBox="0 0 100 115" className="w-full" style={{ maxHeight: '68vh' }}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="mapbg" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#040810" />
            </radialGradient>
          </defs>

          <rect width="100" height="115" fill="url(#mapbg)" />

          {/* Grid lines */}
          {[20,40,60,80].map(x => <line key={`vx${x}`} x1={x} y1="0" x2={x} y2="115" stroke="rgba(255,255,255,0.025)" strokeWidth="0.3"/>)}
          {[20,40,60,80,100].map(y => <line key={`hy${y}`} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.025)" strokeWidth="0.3"/>)}

          {/* India outline */}
          <polygon
            points="35,3 55,3 72,8 82,18 86,28 83,45 78,58 68,70 60,82 52,95 48,100 44,95 36,82 28,72 18,60 12,48 8,35 12,20 22,10"
            fill="rgba(30,58,138,0.2)"
            stroke="rgba(99,102,241,0.45)"
            strokeWidth="0.7"
          />

          {/* Route lines */}
          {ROUTES.map(([a, b]) => {
            const ca = CITIES.find(c => c.id === a)
            const cb = CITIES.find(c => c.id === b)
            if (!ca || !cb) return null
            return (
              <line key={`${a}_${b}`} x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
                stroke="rgba(255,255,255,0.1)" strokeWidth="0.4" strokeDasharray="1.5,1.5" />
            )
          })}

          {/* City nodes */}
          {CITIES.map(city => {
            const unlocked = totalCleared >= city.unlock
            const isHov = hovCity === city.id
            // Count cleared rooms in this city
            const cityBuildings = BUILDINGS[city.id] || []
            const cityTotal = cityBuildings.length * GAME.FLOORS_PER_BUILDING * GAME.ROOMS_PER_FLOOR
            const cityDone = Object.keys(player.completedRooms).filter(k => k.startsWith(city.id) && player.completedRooms[k] > 0).length

            return (
              <g key={city.id}
                style={{ cursor: unlocked ? 'pointer' : 'default' }}
                onMouseEnter={() => setHovCity(city.id)}
                onMouseLeave={() => setHovCity(null)}
                onClick={() => unlocked && onSelectCity(city.id)}
              >
                {/* Pulse ring */}
                {unlocked && (
                  <circle cx={city.x} cy={city.y} r={isHov ? 5.5 : 4.5}
                    fill="none" stroke={city.col} strokeWidth="0.5"
                    opacity={isHov ? 0.9 : 0.35}
                    style={{ animation: unlocked ? 'pulse 2s infinite' : '' }}
                  />
                )}
                {/* Dot */}
                <circle cx={city.x} cy={city.y} r="3"
                  fill={unlocked ? city.col : 'rgba(255,255,255,0.08)'}
                  filter={unlocked ? 'url(#glow)' : ''} />
                {/* Emoji */}
                <text x={city.x} y={city.y + 1} textAnchor="middle" fontSize="3"
                  style={{ userSelect: 'none' }}>
                  {city.emoji}
                </text>
                {/* Label */}
                <text x={city.x} y={city.y + 6} textAnchor="middle" fontSize="2"
                  fill={unlocked ? city.col : 'rgba(255,255,255,0.2)'} fontWeight="bold">
                  {city.name}
                </text>
                {/* Progress or lock */}
                {unlocked && cityDone > 0 ? (
                  <text x={city.x} y={city.y + 9} textAnchor="middle" fontSize="1.5"
                    fill="rgba(255,255,255,0.4)">
                    {cityDone}/{cityTotal}
                  </text>
                ) : !unlocked ? (
                  <text x={city.x} y={city.y + 9} textAnchor="middle" fontSize="1.4"
                    fill="rgba(255,255,255,0.25)">
                    🔒{city.unlock}⭐
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>

        {/* City info popup */}
        <AnimatePresence>
          {hovCity && (() => {
            const city = CITIES.find(c => c.id === hovCity)
            const unlocked = totalCleared >= city.unlock
            return (
              <motion.div
                key={hovCity}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-3 left-3 right-3 rounded-2xl p-4"
                style={{ background: 'rgba(8,12,24,0.97)', border: `1px solid ${city.col}44` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{city.emoji}</span>
                  <div className="flex-1">
                    <p className="font-black text-white text-base">{city.name}</p>
                    <p className="text-xs" style={{ color: city.col }}>
                      Class {city.cls === 0 ? 'Bonus' : city.cls} · {(BUILDINGS[city.id]||[]).length} buildings
                    </p>
                    <p className="text-xs" style={{ color: '#475569' }}>{city.description}</p>
                  </div>
                  {unlocked
                    ? <button onClick={() => onSelectCity(city.id)}
                        className="px-4 py-2 rounded-xl font-black text-sm text-black active:scale-95 transition-all"
                        style={{ background: `linear-gradient(135deg,${city.col},${city.accent})` }}>
                        ENTER →
                      </button>
                    : <div className="text-center">
                        <p className="text-xs font-bold" style={{ color: '#E74C3C' }}>🔒 Locked</p>
                        <p className="text-xs" style={{ color: '#475569' }}>Clear {city.unlock} rooms first</p>
                      </div>
                  }
                </div>
              </motion.div>
            )
          })()}
        </AnimatePresence>
      </div>

      {/* ── Player bar ── */}
      <div className="px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(0,0,0,0.7)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-2xl">{player.avatar}</span>
        <div className="flex-1">
          <p className="font-black text-white text-sm">{player.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs" style={{ color: '#64748b' }}>Lv.{player.level}</p>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full" style={{ width: `${player.getXpProgress() * 100}%`, background: 'linear-gradient(90deg,#667eea,#764ba2)' }} />
            </div>
          </div>
        </div>
        <div className="flex gap-4 text-center text-xs">
          <div><p className="font-black" style={{ color: '#FFD93D' }}>🪙{player.coins}</p><p style={{ color: '#475569' }}>coins</p></div>
          <div><p className="font-black" style={{ color: '#6BCB77' }}>❤️{player.hp}</p><p style={{ color: '#475569' }}>HP</p></div>
        </div>
      </div>
    </div>
  )
}
