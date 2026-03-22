// src/screens/IntroScreen.jsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '../hooks/usePlayer.js'

const AVATARS = ['🧒','👦','👧','🧑','🦸','🧙','🥷','🎓','👩‍🚀','🦊']

export default function IntroScreen({ onComplete }) {
  const { initPlayer } = usePlayer()
  const [step, setStep]     = useState(0) // 0=avatar+class, 1=name
  const [avatar, setAvatar] = useState('🧒')
  const [cls, setCls]       = useState(1)
  const [name, setName]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!name.trim() || loading) return
    setLoading(true)
    await initPlayer(name.trim(), avatar, cls)
    onComplete()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #0f1e3d, #040810)' }}>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="text-7xl mb-3 animate-float select-none"
      >🗺️</motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-orbitron font-black text-4xl mb-1"
        style={{ background: 'linear-gradient(135deg,#FFD93D,#FF8C42,#FF6B6B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >INDIA QUEST</motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs tracking-widest mb-1"
        style={{ color: '#4ECDC4' }}
      >AI-POWERED CBSE RPG · CLASSES 1–5</motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs mb-8"
        style={{ color: '#334155' }}
      >10,000+ Questions · 7 Subjects · Travel Across India</motion.p>

      {/* Steps */}
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div key="step0" initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }} className="w-full max-w-xs">

            {/* Avatar picker */}
            <p className="text-sm font-bold mb-3" style={{ color: '#94a3b8' }}>Choose your hero</p>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {AVATARS.map(a => (
                <button key={a} onClick={() => setAvatar(a)}
                  className="aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: avatar === a ? 'rgba(255,215,61,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${avatar === a ? '#FFD93D' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: avatar === a ? '0 0 12px rgba(255,215,61,0.3)' : 'none',
                  }}>
                  {a}
                </button>
              ))}
            </div>

            {/* Class selector */}
            <p className="text-sm font-bold mb-2" style={{ color: '#94a3b8' }}>Your class</p>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {[1,2,3,4,5].map(c => (
                <button key={c} onClick={() => setCls(c)}
                  className="py-3 rounded-xl font-black text-white text-lg transition-all active:scale-90"
                  style={{
                    background: cls === c ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(255,255,255,0.07)',
                    border: `2px solid ${cls === c ? '#764ba2' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  {c}
                </button>
              ))}
            </div>

            {/* Features list */}
            <div className="rounded-2xl p-4 mb-5 text-left space-y-1" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)' }}>
              {[
                '🗺️ Travel across India's 5 major cities',
                '🏛️ Enter subject buildings, floor by floor',
                '🧩 5 interactive puzzle types, never just MCQ',
                '🟢🟡🔴 Easy → Medium → Boss difficulty',
                '✨ AI creates 10,000+ fresh questions',
                '🔥 Earn XP, coins & stars — level up!',
              ].map(t => <p key={t} className="text-xs" style={{ color: '#64748b' }}>{t}</p>)}
            </div>

            <button onClick={() => setStep(1)} className="btn-primary w-full text-lg font-orbitron">
              NEXT →
            </button>
          </motion.div>

        ) : (
          <motion.div key="step1" initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-40 }} className="w-full max-w-xs">

            <div className="text-6xl mb-4 animate-float">{avatar}</div>

            <p className="text-sm font-bold mb-3" style={{ color: '#94a3b8' }}>Enter your hero name</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              maxLength={15}
              placeholder="Your hero name..."
              autoFocus
              className="w-full px-4 py-3 rounded-2xl text-center font-black text-xl mb-5 outline-none"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '2px solid rgba(255,255,255,0.15)',
                color: 'white',
              }}
            />

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-ghost px-5 py-4">←</button>
              <button
                onClick={handleStart}
                disabled={!name.trim() || loading}
                className="btn-success flex-1 text-lg font-orbitron"
              >
                {loading ? '⚙️ ...' : 'START QUEST 🚀'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
