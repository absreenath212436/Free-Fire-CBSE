// src/components/puzzles/MathPuzzle.jsx
import { useState } from 'react'
export default function MathPuzzle({ q, onCorrect, onWrong }) {
  const [sel, setSel] = useState(null)
  const [res, setRes] = useState(null)
  const submit = (opt) => {
    if (res) return; setSel(opt)
    if (opt === q.missing) { setRes('ok'); setTimeout(onCorrect, 700) }
    else { setRes('no'); setTimeout(() => { setRes(null); setSel(null); onWrong() }, 900) }
  }
  return (
    <div className="flex flex-col items-center gap-6">
      {q.hint && <div className="game-card px-4 py-2 text-xs text-center w-full" style={{ color: '#94a3b8' }}>💡 {q.hint}</div>}
      <div className="game-card p-6 w-full text-center">
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: '2rem', fontWeight: 900, color: res === 'ok' ? '#6BCB77' : res === 'no' ? '#E74C3C' : 'white' }}>
          {(q.equation || '').replace('___', sel !== null ? String(sel) : '??')}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {(q.opts || []).map((opt, i) => (
          <button key={i} onClick={() => submit(opt)}
            className={`answer-btn py-5 text-2xl ${sel === opt ? (opt === q.missing ? 'correct' : 'wrong') : ''}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
