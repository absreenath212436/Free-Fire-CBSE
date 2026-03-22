// src/components/puzzles/MatchPuzzle.jsx
import { useState } from 'react'
export default function MatchPuzzle({ q, onCorrect, onWrong }) {
  const [shuffR] = useState(() => [...(q.pairs || [])].sort(() => Math.random() - 0.5))
  const [sel, setSel] = useState(null)
  const [matched, setMatched] = useState([])
  const [wrongAnim, setWrongAnim] = useState(false)

  const click = (side, idx) => {
    if (wrongAnim) return
    if (!sel) { setSel({ side, idx }); return }
    if (sel.side === side) { setSel({ side, idx }); return }
    const li = side === 'right' ? sel.idx : idx
    const ri = side === 'right' ? idx : sel.idx
    if (q.pairs[li] && shuffR[ri] && q.pairs[li][1] === shuffR[ri][1]) {
      const nm = [...matched, { li, ri }]
      setMatched(nm); setSel(null)
      if (nm.length === q.pairs.length) setTimeout(onCorrect, 500)
    } else {
      setWrongAnim(true); setSel(null)
      setTimeout(() => { setWrongAnim(false); onWrong() }, 900)
    }
  }

  const btnStyle = (isM, isS, isW) => ({
    padding: '12px 8px', borderRadius: 14, fontSize: '0.8rem', fontWeight: 700,
    color: 'white', cursor: 'pointer', textAlign: 'center', width: '100%',
    background: isM ? 'rgba(107,203,119,0.2)' : isW ? 'rgba(231,76,60,0.2)' : isS ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
    border: `2px solid ${isM ? '#6BCB77' : isW ? '#E74C3C' : isS ? 'white' : 'rgba(255,255,255,0.12)'}`,
    opacity: isM ? 0.6 : 1,
  })

  return (
    <div>
      <div className="game-card px-4 py-2 text-center text-xs mb-4" style={{ color: '#94a3b8' }}>💡 {q.hint || 'Match the pairs!'}</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {(q.pairs || []).map((p, i) => {
            const isM = matched.some(m => m.li === i)
            const isS = sel?.side === 'left' && sel?.idx === i
            return <button key={i} onClick={() => click('left', i)} style={btnStyle(isM, isS, false)}>{p[0]}</button>
          })}
        </div>
        <div className="flex flex-col gap-2">
          {shuffR.map((p, i) => {
            const isM = matched.some(m => m.ri === i)
            const isS = sel?.side === 'right' && sel?.idx === i
            return <button key={i} onClick={() => click('right', i)} style={btnStyle(isM, isS, wrongAnim && !isM)}>{p[1]}</button>
          })}
        </div>
      </div>
    </div>
  )
}
