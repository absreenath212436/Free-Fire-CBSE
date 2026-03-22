// src/screens/BuildingScreen.jsx
import { motion } from 'framer-motion'
import { usePlayer } from '../hooks/usePlayer.js'
import { GAME } from '../config.js'

const FLOOR_META = [
  { label: 'Floor 1 — Easy Foundations',   col: '#6BCB77', badgeClass: 'badge-easy'   },
  { label: 'Floor 2 — Applied Learning',   col: '#FFD93D', badgeClass: 'badge-medium' },
  { label: 'Floor 3 — Boss Challenge ⚡',  col: '#FF6B6B', badgeClass: 'badge-hard'   },
]

export default function BuildingScreen({ building, cityId, onEnterRoom, onBack }) {
  const player = usePlayer()
  if (!building) return null

  const rk = (f, r) => `${cityId}_${building.id}_${f}_${r}`

  const floorCleared = (f) =>
    Array(GAME.ROOMS_PER_FLOOR).fill(null).every((_, r) => player.isRoomCleared(cityId, building.id, f, r))

  const floorProgress = (f) =>
    Array(GAME.ROOMS_PER_FLOOR).fill(null).filter((_, r) => player.isRoomCleared(cityId, building.id, f, r)).length

  return (
    <div className="min-h-screen" style={{ background: '#090e1c' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background:'rgba(0,0,0,0.92)', borderBottom:`2px solid ${building.col}33` }}>
        <button onClick={onBack} className="text-white/60 text-xl font-black">←</button>
        <span className="text-3xl">{building.icon}</span>
        <div className="flex-1">
          <p className="font-black text-white">{building.name}</p>
          <p className="text-xs" style={{ color: building.col }}>
            {building.subj} · 3 Floors · AI-Generated Questions
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Difficulty legend */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl p-3"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
          {FLOOR_META.map((m, i) => (
            <div key={i} className="text-center py-2 px-1 rounded-xl"
              style={{ background:`${m.col}15` }}>
              <p className="font-black text-xs" style={{ color: m.col }}>
                {i === 0 ? '🟢 Easy' : i === 1 ? '🟡 Medium' : '🔴 Boss'}
              </p>
              <p className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>Floor {i + 1}</p>
            </div>
          ))}
        </div>

        {/* Floors */}
        {FLOOR_META.map((meta, f) => {
          const unlocked = f === 0 || floorCleared(f - 1)
          const done     = floorCleared(f)
          const cleared  = floorProgress(f)

          return (
            <motion.div key={f}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: f * 0.08 }}
              className="rounded-2xl overflow-hidden"
              style={{ border:`1px solid ${unlocked ? meta.col + '44' : 'rgba(255,255,255,0.06)'}` }}>

              {/* Floor header */}
              <div className="px-4 py-3 flex items-center gap-3"
                style={{ background: unlocked ? `${meta.col}15` : 'rgba(255,255,255,0.03)' }}>
                <span className="text-2xl">{done ? '✅' : unlocked ? '🔓' : '🔒'}</span>
                <div className="flex-1">
                  <p className="font-black text-sm" style={{ color: unlocked ? meta.col : 'rgba(255,255,255,0.25)' }}>
                    {meta.label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width:`${(cleared/GAME.ROOMS_PER_FLOOR)*100}%`, background: meta.col }} />
                    </div>
                    <span className="text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>{cleared}/{GAME.ROOMS_PER_FLOOR}</span>
                  </div>
                </div>
                {!unlocked && <p className="text-xs" style={{ color:'#475569' }}>Clear Floor {f} first</p>}
              </div>

              {/* Room grid */}
              {unlocked && (
                <div className="p-3 grid grid-cols-4 gap-2">
                  {Array(GAME.ROOMS_PER_FLOOR).fill(null).map((_, r) => {
                    const stars  = player.getRoomStars(cityId, building.id, f, r)
                    const cleared = stars > 0
                    const isBoss = f === GAME.FLOORS_PER_BUILDING - 1 && r === GAME.ROOMS_PER_FLOOR - 1

                    return (
                      <button key={r}
                        onClick={() => onEnterRoom(f, r)}
                        className="aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all"
                        style={{
                          background: cleared ? `${meta.col}28` : isBoss ? 'rgba(255,50,50,0.1)' : 'rgba(255,255,255,0.06)',
                          border: `2px solid ${cleared ? meta.col : isBoss ? 'rgba(255,80,80,0.35)' : 'rgba(255,255,255,0.08)'}`,
                          boxShadow: isBoss && !cleared ? '0 0 12px rgba(255,50,50,0.2)' : '',
                        }}>
                        <span style={{ fontSize:'1rem' }}>{cleared ? '⭐' : isBoss ? '👹' : '🚪'}</span>
                        <span style={{ fontSize:'0.65rem', fontWeight:900, color: cleared ? meta.col : isBoss ? '#ff5555' : 'rgba(255,255,255,0.4)' }}>
                          {isBoss ? 'BOSS' : `R${r + 1}`}
                        </span>
                        {cleared && (
                          <div className="flex gap-0.5">
                            {[1,2,3].map(s => (
                              <span key={s} style={{ fontSize:'0.4rem', color: s <= stars ? '#FFD93D' : 'rgba(255,255,255,0.2)' }}>
                                {s <= stars ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )
        })}

        {/* Total stars for this building */}
        {(() => {
          const totalStars = Array(GAME.FLOORS_PER_BUILDING).fill(null).reduce((sum, _, f) =>
            sum + Array(GAME.ROOMS_PER_FLOOR).fill(null).reduce((s2, _, r) =>
              s2 + player.getRoomStars(cityId, building.id, f, r), 0), 0)
          const maxStars = GAME.FLOORS_PER_BUILDING * GAME.ROOMS_PER_FLOOR * 3
          if (totalStars === 0) return null
          return (
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background:'rgba(255,215,61,0.08)', border:'1px solid rgba(255,215,61,0.2)' }}>
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-black text-sm" style={{ color:'#FFD93D' }}>Building Progress</p>
                <p className="text-xs" style={{ color:'rgba(255,255,255,0.5)' }}>{totalStars} / {maxStars} total stars collected</p>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
