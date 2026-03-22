// src/screens/PuzzleScreen.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { usePlayer } from '../hooks/usePlayer.js'
import { GAME } from '../config.js'
import { pickQuestion, preloadPool, getEffectiveClass } from '../services/aiGenerator.js'
import VisualPuzzle   from '../components/puzzles/VisualPuzzle.jsx'
import FillPuzzle     from '../components/puzzles/FillPuzzle.jsx'
import MatchPuzzle    from '../components/puzzles/MatchPuzzle.jsx'
import ScramblePuzzle from '../components/puzzles/ScramblePuzzle.jsx'
import MathPuzzle     from '../components/puzzles/MathPuzzle.jsx'

const PUZZLE_MAP = { visual: VisualPuzzle, fill: FillPuzzle, match: MatchPuzzle, scramble: ScramblePuzzle, math_build: MathPuzzle }
const TYPE_LABELS = { visual:'👁️ IDENTIFY', fill:'✏️ FILL IN', match:'🔗 MATCH', scramble:'🔤 UNSCRAMBLE', math_build:'🔢 SOLVE' }
const DIFF_META = GAME.DIFFICULTY

export default function PuzzleScreen({ building, cityId, floor, room, onComplete, onBack }) {
  const player  = usePlayer()
  const isBoss  = floor === 2 && room === GAME.ROOMS_PER_FLOOR - 1
  const TOTAL_Q = isBoss ? GAME.QUESTIONS_BOSS : GAME.QUESTIONS_NORMAL
  const diff    = floor + 1  // floor 0→d1, 1→d2, 2→d3
  const subject = building?.subj
  const cls     = player.cls

  // Question state
  const [q, setQ]           = useState(null)
  const [qNum, setQNum]     = useState(0)
  const [correct, setCorrect] = useState(0)
  const [errors, setErrors]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [genMsg, setGenMsg]   = useState(null)

  // Player stats (local copy, updated live)
  const [hp, setHp]       = useState(player.hp)
  const [coins, setCoins] = useState(player.coins)
  const [xp, setXp]       = useState(player.xp)

  // UI
  const [flashType, setFlashType] = useState(null) // 'correct' | 'wrong'
  const [showHint, setShowHint]   = useState(false)
  const [finished, setFinished]   = useState(false)
  const [timer, setTimer]         = useState(isBoss ? GAME.BOSS_TIMER_SEC : null)

  const timerRef    = useRef(null)
  const loadingRef  = useRef(false)

  // Preload next batch when entering
  useEffect(() => {
    preloadPool(subject, cls, diff)
  }, [])

  const loadNext = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setQ(null)
    setShowHint(false)

    const effectiveCls = getEffectiveClass(subject, cls)
    const picked = await pickQuestion(subject, effectiveCls, diff, (msg) => setGenMsg(msg))
    setGenMsg(null)
    setQ(picked || {
      t: 'visual',
      question: 'Which is the national flower of India?',
      items: ['Rose', 'Lotus', 'Sunflower', 'Jasmine'],
      answer: 1,
    })
    setLoading(false)
    if (isBoss) setTimer(GAME.BOSS_TIMER_SEC)
    loadingRef.current = false
  }, [subject, cls, diff, isBoss])

  useEffect(() => { loadNext() }, [])

  // Boss timer
  useEffect(() => {
    if (!isBoss || !timer || finished || loading) return
    timerRef.current = setTimeout(() => {
      if (timer <= 1) handleWrong()
      else setTimer(t => t - 1)
    }, 1000)
    return () => clearTimeout(timerRef.current)
  }, [timer, finished, loading])

  const handleCorrect = useCallback(() => {
    clearTimeout(timerRef.current)
    const nc = correct + 1
    setCorrect(nc)
    setCoins(c => c + GAME.COINS_PER_CORRECT)
    setXp(x => x + GAME.XP_PER_CORRECT)
    setFlashType('correct')
    // Confetti on last correct
    if (nc === TOTAL_Q) confetti({ particleCount: 80, spread: 60, origin: { y: 0.4 } })
    setTimeout(() => {
      setFlashType(null)
      if (nc >= TOTAL_Q) setFinished(true)
      else { setQNum(n => n + 1); loadNext() }
    }, 500)
  }, [correct, TOTAL_Q, loadNext])

  const handleWrong = useCallback(() => {
    clearTimeout(timerRef.current)
    const ne = errors + 1
    setErrors(ne)
    const nhp = Math.max(0, hp - GAME.HP_LOSS_WRONG)
    setHp(nhp)
    setFlashType('wrong')
    setTimeout(() => {
      setFlashType(null)
      if (nhp <= 0 || qNum + 1 >= TOTAL_Q) setFinished(true)
      else { setQNum(n => n + 1); loadNext() }
    }, 600)
  }, [errors, hp, qNum, TOTAL_Q, loadNext])

  // ── RESULTS SCREEN ──────────────────────────────────────────
  if (finished) {
    const passed = correct >= Math.ceil(TOTAL_Q * 0.5)
    const stars  = errors === 0 ? 3 : errors <= 1 ? 2 : correct > 0 ? 1 : 0
    return (
      <motion.div
        initial={{ opacity:0 }} animate={{ opacity:1 }}
        className="flex flex-col items-center justify-center min-h-screen p-6"
        style={{ background: passed ? 'radial-gradient(circle,#0f2d1a,#060d0e)' : 'radial-gradient(circle,#2d0f0f,#060d0e)' }}
      >
        <div className="text-center w-full max-w-xs">
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', delay:0.1 }}
            className="text-7xl mb-3">
            {passed ? (stars===3 ? '🏆' : stars===2 ? '🥈' : '🥉') : '💀'}
          </motion.div>
          <h2 className="font-orbitron text-2xl font-black mb-1"
            style={{ color: passed ? '#6BCB77' : '#E74C3C' }}>
            {passed ? 'ROOM CLEARED!' : 'MISSION FAILED'}
          </h2>
          <p className="text-sm mb-1" style={{ color:'#94a3b8' }}>{correct}/{TOTAL_Q} correct · {errors} errors</p>
          <p className="text-xs mb-3 px-3 py-1 rounded-full inline-block" style={{ color: DIFF_META[diff]?.color, background:`${DIFF_META[diff]?.color}18`, border:`1px solid ${DIFF_META[diff]?.color}33` }}>
            {DIFF_META[diff]?.label}
          </p>

          {passed && (
            <div className="flex justify-center gap-1 text-2xl mb-4">
              {[1,2,3].map(s => <span key={s} style={{ color: s<=stars ? '#FFD93D' : 'rgba(255,255,255,0.15)' }}>{s<=stars ? '★' : '☆'}</span>)}
            </div>
          )}

          {/* Rewards summary */}
          <div className="rounded-2xl p-4 mb-5 grid grid-cols-3 gap-3 text-center"
            style={{ background:'rgba(255,255,255,0.07)' }}>
            <div>
              <p className="text-xl font-black" style={{ color:'#FFD93D' }}>+{correct * GAME.COINS_PER_CORRECT}🪙</p>
              <p className="text-xs" style={{ color:'#64748b' }}>coins</p>
            </div>
            <div>
              <p className="text-xl font-black" style={{ color:'#a78bfa' }}>+{correct * GAME.XP_PER_CORRECT}⚡</p>
              <p className="text-xs" style={{ color:'#64748b' }}>XP</p>
            </div>
            <div>
              <p className="text-xl font-black" style={{ color:'#6BCB77' }}>{hp}❤️</p>
              <p className="text-xs" style={{ color:'#64748b' }}>HP left</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onBack} className="btn-ghost flex-1">← Back</button>
            {passed
              ? <button onClick={() => onComplete(stars, hp, coins, xp)} className="btn-success flex-1">COLLECT ✓</button>
              : <button onClick={() => {
                  setQNum(0); setCorrect(0); setErrors(0)
                  setHp(player.hp); setFinished(false)
                  loadNext()
                }} className="btn-primary flex-1">RETRY 🔄</button>
            }
          </div>
        </div>
      </motion.div>
    )
  }

  // ── PUZZLE SCREEN ───────────────────────────────────────────
  const PuzzleComp = q ? (PUZZLE_MAP[q.t] || VisualPuzzle) : null

  return (
    <div className="flex flex-col min-h-screen"
      style={{ background:`radial-gradient(ellipse at top,${building?.col}15,#06090e)` }}>

      {/* Correct/Wrong flash overlay */}
      <AnimatePresence>
        {flashType && (
          <motion.div key={flashType}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: flashType==='correct' ? 'rgba(107,203,119,0.12)' : 'rgba(231,76,60,0.18)' }}
          />
        )}
      </AnimatePresence>

      {/* Header HUD */}
      <div className="px-3 pt-3 pb-2"
        style={{ background:'rgba(0,0,0,0.88)', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-2">
          <button onClick={onBack} className="text-white/40 text-sm px-1 font-bold">✕</button>
          <span style={{ color: building?.col }}>{building?.icon}</span>
          <span className="text-xs font-bold text-white flex-1">
            {building?.name} · Floor {floor + 1}{isBoss ? ' ⚡ BOSS' : ''}
          </span>
          {/* Difficulty badge */}
          <span className={`text-xs font-black px-3 py-1 rounded-full`}
            style={{ color: DIFF_META[diff]?.color, background:`${DIFF_META[diff]?.color}18`, border:`1px solid ${DIFF_META[diff]?.color}33` }}>
            {DIFF_META[diff]?.label}
          </span>
          {/* Boss timer */}
          {isBoss && timer !== null && (
            <span className={`font-orbitron font-black text-sm px-3 py-1 rounded-lg ${timer <= 5 ? 'timer-urgent' : ''}`}
              style={{ background: timer<=5 ? 'rgba(231,76,60,0.4)' : 'rgba(255,255,255,0.1)', color: timer<=5 ? '#E74C3C' : 'white' }}>
              {timer}s
            </span>
          )}
        </div>

        {/* Question progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background:`linear-gradient(90deg,${building?.col},${building?.col}88)` }}
              animate={{ width:`${(qNum / TOTAL_Q) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="font-orbitron font-black text-xs" style={{ color: building?.col }}>
            {qNum + 1}/{TOTAL_Q}
          </span>
          {/* Hearts */}
          <div className="flex gap-0.5">
            {Array(3).fill(null).map((_, i) => (
              <span key={i} style={{ fontSize:'0.8rem' }}>{i < errors ? '💔' : '❤️'}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Question type + hint row */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs font-black px-3 py-1 rounded-full"
          style={{ color: building?.col, background:`${building?.col}18`, border:`1px solid ${building?.col}33` }}>
          {q ? (TYPE_LABELS[q.t] || '❓ PUZZLE') : '⏳ LOADING...'}
        </span>
        {q?.hint && (
          <button onClick={() => setShowHint(h => !h)}
            className="text-xs px-3 py-1 rounded-full transition-all"
            style={{ background:'rgba(255,165,0,0.1)', color:'#FFA500', border:'1px solid rgba(255,165,0,0.25)' }}>
            💡 {showHint ? 'Hide hint' : 'Hint'}
          </button>
        )}
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && q?.hint && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            className="mx-4 mb-1 px-4 py-2 rounded-xl text-xs text-center overflow-hidden"
            style={{ background:'rgba(255,165,0,0.08)', color:'#FFA500', border:'1px solid rgba(255,165,0,0.18)' }}>
            {q.hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generating message */}
      {genMsg && (
        <div className="mx-4 mb-1 px-4 py-2 rounded-xl text-xs text-center"
          style={{ background:'rgba(255,165,0,0.08)', color:'#FFA500', border:'1px solid rgba(255,165,0,0.18)' }}>
          {genMsg}
        </div>
      )}

      {/* Puzzle area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }}
              className="text-3xl">⚙️</motion.div>
            <p className="text-sm" style={{ color:'#64748b' }}>Preparing question...</p>
          </div>
        ) : PuzzleComp ? (
          <motion.div key={`q_${qNum}`} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2 }}>
            <PuzzleComp q={q} onCorrect={handleCorrect} onWrong={handleWrong} />
          </motion.div>
        ) : null}
      </div>

      {/* Footer stats bar */}
      <div className="flex items-center justify-around px-4 py-2 text-xs"
        style={{ background:'rgba(0,0,0,0.72)', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <span>❤️</span>
          <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.1)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: hp>60 ? '#6BCB77' : hp>30 ? '#FFD93D' : '#E74C3C' }}
              animate={{ width:`${(hp/GAME.MAX_HP)*100}%` }}
            />
          </div>
          <span style={{ color:'#94a3b8' }}>{hp}</span>
        </div>
        <span style={{ color:'#FFD93D' }}>🪙 {coins}</span>
        <span style={{ color:'#a78bfa' }}>⚡ {xp} XP</span>
      </div>
    </div>
  )
}
