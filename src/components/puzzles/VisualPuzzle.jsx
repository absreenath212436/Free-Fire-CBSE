// src/components/puzzles/VisualPuzzle.jsx
import { useState } from 'react'
export default function VisualPuzzle({ q, onCorrect, onWrong }) {
  const [sel, setSel] = useState(null)
  const pick = (i) => {
    if (sel !== null) return
    setSel(i)
    if (i === q.answer) setTimeout(onCorrect, 700)
    else setTimeout(() => { setSel(null); onWrong() }, 900)
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="game-card p-5">
        <p className="text-white font-black text-lg text-center leading-snug">{q.question}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.items.map((item, i) => (
          <button key={i} onClick={() => pick(i)}
            className={`answer-btn ${sel===i ? (i===q.answer?'correct':'wrong') : ''}`}>
            {item}
          </button>
        ))}
      </div>
    </div>
  )
}
