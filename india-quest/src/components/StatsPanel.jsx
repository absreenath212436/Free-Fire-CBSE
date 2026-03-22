// src/components/StatsPanel.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getStorageStats, getTotalQuestions, clearAllStorage } from '../services/storage.js'
import { GAME } from '../config.js'

export default function StatsPanel({ onClose }) {
  const [stats, setStats]   = useState([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const s = await getStorageStats()
    const t = await getTotalQuestions()
    setStats(s); setTotal(t); setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Group by subject+class
  const grouped = stats.reduce((acc, s) => {
    const k = `${s.subject} · Class ${s.cls}`
    if (!acc[k]) acc[k] = []
    acc[k].push(s)
    return acc
  }, {})

  const handleClear = async () => {
    if (!confirm('This will delete ALL cached questions. Are you sure?')) return
    await clearAllStorage()
    load()
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#080c18' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-10"
        style={{ background: 'rgba(0,0,0,0.92)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={onClose} className="text-white/60 text-xl font-black">←</button>
        <div className="flex-1">
          <p className="font-black text-white">📊 Question Bank</p>
          <p className="text-xs" style={{ color: '#6BCB77' }}>
            {total.toLocaleString()} questions cached · Grows with each session
          </p>
        </div>
        <button onClick={load} className="text-sm px-3 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
          ↺
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <p style={{ color: '#64748b' }}>Loading stats...</p>
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <p className="text-4xl">🗺️</p>
            <p className="font-black text-white">No questions yet!</p>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Enter a building and start solving puzzles.<br />
              Claude AI will generate questions automatically.
            </p>
          </div>
        ) : (
          <>
            {/* Summary card */}
            <div className="rounded-2xl p-4 grid grid-cols-3 gap-3 text-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <p className="text-2xl font-black" style={{ color: '#FFD93D' }}>{total.toLocaleString()}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>Total questions</p>
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color: '#6BCB77' }}>{Object.keys(grouped).length}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>Subject pools</p>
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color: '#a78bfa' }}>
                  {stats.reduce((s, r) => s + r.used, 0).toLocaleString()}
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>Questions seen</p>
              </div>
            </div>

            {/* Per-subject breakdown */}
            {Object.entries(grouped).map(([key, rows]) => (
              <motion.div key={key}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <p className="font-black text-white text-sm">{key}</p>
                </div>
                <div className="p-3 grid grid-cols-3 gap-2">
                  {[1,2,3].map(d => {
                    const row = rows.find(r => r.diff === d)
                    const col = GAME.DIFFICULTY[d]?.color || '#fff'
                    const lbl = d===1?'Easy':d===2?'Medium':'Boss'
                    if (!row) return (
                      <div key={d} className="rounded-xl p-3 text-center"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs font-black" style={{ color: 'rgba(255,255,255,0.25)' }}>{lbl}</p>
                        <p className="text-xs" style={{ color: '#475569' }}>No questions yet</p>
                      </div>
                    )
                    const pct = row.total > 0 ? Math.round((row.used / row.total) * 100) : 0
                    return (
                      <div key={d} className="rounded-xl p-3"
                        style={{ background: `${col}14`, border: `1px solid ${col}30` }}>
                        <p className="text-xs font-black mb-1" style={{ color: col }}>{lbl}</p>
                        <p className="text-xl font-black text-white">{row.total}</p>
                        <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background:'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full" style={{ width:`${pct}%`, background: col }} />
                        </div>
                        <p className="text-xs mt-1" style={{ color: '#64748b' }}>{row.used} seen ({pct}%)</p>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}

            {/* Info */}
            <div className="rounded-2xl p-4 text-center space-y-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-black" style={{ color: '#6BCB77' }}>How questions work</p>
              <p className="text-xs" style={{ color: '#64748b' }}>
                Claude AI generates 15 questions per topic call, covering each CBSE chapter.
                Questions are cached permanently and never repeat until the full pool is exhausted.
                The bank grows every session!
              </p>
            </div>

            {/* Danger zone */}
            <button onClick={handleClear}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all"
              style={{ background: 'rgba(231,76,60,0.1)', color: '#E74C3C', border: '1px solid rgba(231,76,60,0.2)' }}>
              🗑️ Clear all cached questions (reset)
            </button>
          </>
        )}
      </div>
    </div>
  )
}
