// src/components/puzzles/ScramblePuzzle.jsx
import { useState, useEffect, useCallback } from 'react'
export default function ScramblePuzzle({ q, onCorrect, onWrong }) {
  const word = (q.word || 'ABC').toUpperCase()
  const makeBank = useCallback(() => {
    const arr = word.split('').map((l, i) => ({ l, id: i, used: false }))
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    if (arr.map(x => x.l).join('') === word && arr.length > 1) return makeBank()
    return arr
  }, [word])

  const [slots, setSlots] = useState(() => Array(word.length).fill(null))
  const [bank, setBank] = useState(() => makeBank())
  const [shake, setShake] = useState(false)

  useEffect(() => { setSlots(Array(word.length).fill(null)); setBank(makeBank()) }, [q])

  const clickLetter = (item) => {
    if (item.used) return
    const fi = slots.findIndex(s => s === null)
    if (fi === -1) return
    const ns = [...slots]; ns[fi] = item
    setSlots(ns)
    setBank(b => b.map(bi => bi.id === item.id ? { ...bi, used: true } : bi))
    if (fi === word.length - 1) {
      const formed = [...ns.slice(0, fi), item].map(s => s.l).join('')
      if (formed === word) setTimeout(onCorrect, 400)
      else {
        setShake(true)
        setTimeout(() => { setSlots(Array(word.length).fill(null)); setBank(makeBank()); setShake(false); onWrong() }, 800)
      }
    }
  }

  const removeSlot = (i) => {
    const item = slots[i]; if (!item) return
    const ns = [...slots]; ns[i] = null; setSlots(ns)
    setBank(b => b.map(bi => bi.id === item.id ? { ...bi, used: false } : bi))
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="game-card px-5 py-2 text-sm text-center" style={{ color: '#94a3b8' }}>💡 {q.hint}</div>
      <p className="text-xs" style={{ color: '#475569' }}>Tap letters to build the word — tap a slot to remove</p>
      {/* Answer slots */}
      <div className={`flex gap-2 justify-center flex-wrap ${shake ? 'animate-shake' : ''}`}>
        {slots.map((s, i) => (
          <button key={i} onClick={() => removeSlot(i)}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black text-white transition-all"
            style={{ background: s ? 'rgba(255,215,61,0.18)' : 'rgba(255,255,255,0.05)', border: `2px ${s ? 'solid' : 'dashed'} ${s ? '#FFD93D' : 'rgba(255,255,255,0.2)'}` }}>
            {s?.l || ''}
          </button>
        ))}
      </div>
      {/* Letter bank */}
      <div className="flex flex-wrap gap-2 justify-center">
        {bank.map(item => (
          <button key={item.id} onClick={() => clickLetter(item)} disabled={item.used}
            className="w-12 h-12 rounded-xl font-black text-xl transition-all active:scale-90"
            style={{ background: item.used ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg,#FFD93D,#FF8C42)', color: item.used ? 'transparent' : '#000', border: item.used ? '2px dashed rgba(255,255,255,0.1)' : 'none', cursor: item.used ? 'default' : 'pointer' }}>
            {item.used ? '' : item.l}
          </button>
        ))}
      </div>
    </div>
  )
}
