// src/screens/CityScreen.jsx
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '../hooks/usePlayer.js'
import { getCityById } from '../data/cities.js'
import { getBuildingsForCity } from '../data/buildings.js'
import { GAME } from '../config.js'

const GRID = 12
const TILE = { GROUND:0, ROAD:1, BUILDING:2, TREE:3, WATER:4 }
const TILE_BG = { 0:'#0c1325', 1:'#18283f', 2:'transparent', 3:'#0a1a0a', 4:'#0a1220' }

function buildGrid(buildings) {
  const g = Array(GRID).fill(null).map(() => Array(GRID).fill(TILE.GROUND))
  // Roads
  for (let c = 0; c < GRID; c++) { g[4][c] = TILE.ROAD; g[5][c] = TILE.ROAD; g[6][c] = TILE.ROAD }
  for (let r = 0; r < GRID; r++) { g[r][4] = TILE.ROAD; g[r][5] = TILE.ROAD; g[r][6] = TILE.ROAD }
  // Decorations
  [[0,0],[0,11],[11,0],[11,11],[2,9],[9,2],[9,9],[2,2],[1,8],[8,1]].forEach(([r,c]) => {
    if (g[r]?.[c] === TILE.GROUND) g[r][c] = TILE.TREE
  })
  // Buildings
  buildings.forEach(b => { if (b.gy < GRID && b.gx < GRID) g[b.gy][b.gx] = TILE.BUILDING })
  return g
}

export default function CityScreen({ cityId, onEnterBuilding, onBack }) {
  const player   = usePlayer()
  const city     = getCityById(cityId)
  const buildings = getBuildingsForCity(cityId)
  const grid     = useMemo(() => buildGrid(buildings), [buildings])

  const [playerPos, setPlayerPos] = useState({ x: 5, y: 5 })
  const [nearBuilding, setNearBuilding] = useState(null)

  const getRoomsDone = b => {
    let done = 0, total = 0
    for (let f = 0; f < GAME.FLOORS_PER_BUILDING; f++)
      for (let r = 0; r < GAME.ROOMS_PER_FLOOR; r++) {
        total++
        if (player.isRoomCleared(cityId, b.id, f, r)) done++
      }
    return { done, total }
  }

  const movePlayer = (tx, ty) => {
    setPlayerPos({ x: tx, y: ty })
    const near = buildings.find(b => Math.abs(b.gx - tx) <= 1.5 && Math.abs(b.gy - ty) <= 1.5)
    setNearBuilding(near || null)
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#080c18' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-2 sticky top-0 z-10"
        style={{ background: 'rgba(0,0,0,0.92)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onBack} className="text-white/50 text-xl px-1 font-black">←</button>
        <span className="text-xl">{city?.emoji}</span>
        <div className="flex-1">
          <p className="font-black text-white text-sm">{city?.name}</p>
          <p className="text-xs" style={{ color: city?.col }}>Class {city?.cls} Zone · {buildings.length} Buildings</p>
        </div>
        <p className="text-xs" style={{ color: '#475569' }}>Tap to move</p>
      </div>

      {/* Grid */}
      <div className="flex-1 p-2">
        <div className="mx-auto" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID}, 1fr)`,
          gap: '1px',
          maxWidth: '400px',
          aspectRatio: '1',
        }}>
          {Array(GRID).fill(null).map((_, r) =>
            Array(GRID).fill(null).map((_, c) => {
              const tile   = grid[r]?.[c] ?? 0
              const isPlayer = playerPos.x === c && playerPos.y === r
              const bldg   = buildings.find(b => b.gx === c && b.gy === r)
              const isNear = nearBuilding?.gx === c && nearBuilding?.gy === r
              const { done, total } = bldg ? getRoomsDone(bldg) : {}
              const allDone = bldg && done === total && total > 0

              return (
                <div key={`${r}_${c}`}
                  onClick={() => movePlayer(c, r)}
                  className={`grid-tile ${isNear ? 'near' : ''} ${isPlayer ? 'player-pos' : ''}`}
                  style={{ background: TILE_BG[tile] }}
                >
                  {isPlayer && (
                    <span style={{ fontSize:'0.9rem', position:'absolute', zIndex:5, filter:'drop-shadow(0 0 3px white)' }}>
                      {player.avatar}
                    </span>
                  )}
                  {bldg && !isPlayer && (
                    <div className="w-full h-full flex items-center justify-center rounded-sm relative"
                      style={{ background: `${bldg.col}22`, border: `1px solid ${bldg.col}66` }}>
                      <span style={{ fontSize: '0.8rem' }}>{bldg.icon}</span>
                      {allDone && <span style={{ position:'absolute', top:'-2px', right:'-2px', fontSize:'0.45rem' }}>✅</span>}
                    </div>
                  )}
                  {tile === TILE.TREE  && !isPlayer && <span style={{ fontSize:'0.65rem' }}>🌲</span>}
                  {tile === TILE.WATER && !isPlayer && <span style={{ fontSize:'0.65rem' }}>💧</span>}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Bottom panel */}
      <div className="px-3 pb-3">
        <AnimatePresence mode="wait">
          {nearBuilding ? (
            <motion.div key="near"
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:10 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background:'rgba(0,0,0,0.92)', border:`1px solid ${nearBuilding.col}55` }}>
              <span className="text-3xl">{nearBuilding.icon}</span>
              <div className="flex-1">
                <p className="font-black text-white text-sm">{nearBuilding.name}</p>
                <p className="text-xs" style={{ color: nearBuilding.col }}>{nearBuilding.subj}</p>
                {(() => {
                  const p = getRoomsDone(nearBuilding)
                  return (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width:`${(p.done/p.total)*100}%`, background: nearBuilding.col }} />
                      </div>
                      <span className="text-xs" style={{ color:'#64748b' }}>{p.done}/{p.total}</span>
                    </div>
                  )
                })()}
              </div>
              <button onClick={() => onEnterBuilding(nearBuilding)}
                className="px-5 py-3 rounded-xl font-black text-sm text-black active:scale-95 transition-all"
                style={{ background: `linear-gradient(135deg,${nearBuilding.col},${nearBuilding.col}bb)` }}>
                ENTER
              </button>
            </motion.div>
          ) : (
            <motion.div key="quick"
              initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="rounded-xl px-4 py-3"
              style={{ background:'rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-xs mb-2" style={{ color: '#475569' }}>Quick-navigate to a building:</p>
              <div className="flex flex-wrap gap-2">
                {buildings.map(b => {
                  const p = getRoomsDone(b)
                  return (
                    <button key={b.id}
                      onClick={() => { setPlayerPos({ x: b.gx, y: b.gy }); setNearBuilding(b) }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                      style={{ background:`${b.col}18`, border:`1px solid ${b.col}44`, color: b.col }}>
                      {b.icon} {b.name.split(' ')[0]}
                      {p.done > 0 && <span style={{ color:'rgba(255,255,255,0.3)' }}>({p.done}/{p.total})</span>}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
