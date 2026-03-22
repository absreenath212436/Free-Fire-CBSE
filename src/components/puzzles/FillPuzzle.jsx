// src/components/puzzles/FillPuzzle.jsx
import { useState } from 'react'
export default function FillPuzzle({ q, onCorrect, onWrong }) {
  const [sel, setSel] = useState(null)
  const [res, setRes] = useState(null)
  const parts = (q.sentence || '').split('___')
  const submit = (opt) => {
    if (res) return
    setSel(opt)
    if (opt === q.answer) { setRes('ok'); setTimeout(onCorrect, 700) }
    else { setRes('no'); setTimeout(() => { setRes(null); setSel(null); onWrong() }, 900) }
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="game-card p-5">
        <p className="text-white font-black text-lg text-center leading-relaxed">
          {parts[0]}
          <span className="inline-block min-w-20 text-center mx-1 px-2 pb-0.5 font-black"
            style={{ borderBottom: `3px solid ${res==='ok'?'#6BCB77':res==='no'?'#E74C3C':'rgba(255,255,255,0.3)'}`, color: sel ? (res==='ok'?'#6BCB77':'#E74C3C') : 'rgba(255,255,255,0.35)' }}>
            {sel || '___'}
          </span>
          {parts[1]}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(q.opts || []).map((opt, i) => (
          <button key={i} onClick={() => submit(opt)}
            className={`answer-btn ${sel===opt ? (opt===q.answer?'correct':'wrong') : ''}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
