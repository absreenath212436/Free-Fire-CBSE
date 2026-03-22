// src/services/aiGenerator.js
// ─────────────────────────────────────────────────────────────
// AI Question Generator — calls /api/generate (Vercel serverless)
// Handles retries, caching, and graceful fallback to seed questions
// ─────────────────────────────────────────────────────────────
import { GENERATE_ENDPOINT, GAME } from '../config.js'
import { getTopics, getEffectiveClass } from '../data/syllabus.js'
import { loadPool, appendPool, loadUsed, saveUsed, resetUsed, loadTopicIdx, saveTopicIdx } from './storage.js'

// ── Fallback seed questions (used if API is unavailable) ──────
// These give the game enough questions to start immediately
const SEED_QUESTIONS = {
  visual: [
    { t: 'visual', question: 'Which planet is known as the Red Planet?', items: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 1 },
    { t: 'visual', question: 'What is the capital of India?', items: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'], answer: 2 },
    { t: 'visual', question: 'How many sides does a triangle have?', items: ['2', '3', '4', '5'], answer: 1 },
    { t: 'visual', question: 'Which gas do plants absorb for photosynthesis?', items: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], answer: 2 },
    { t: 'visual', question: 'What is 7 × 8?', items: ['54', '56', '48', '64'], answer: 1 },
    { t: 'visual', question: 'India gained independence on which date?', items: ['26 Jan 1947', '15 Aug 1947', '26 Jan 1950', '15 Aug 1950'], answer: 1 },
    { t: 'visual', question: 'Which is the national bird of India?', items: ['Eagle', 'Parrot', 'Peacock', 'Sparrow'], answer: 2 },
    { t: 'visual', question: 'What does a plant need to make food?', items: ['Moonlight & Water', 'Sunlight & CO₂ & Water', 'Soil & Wind', 'Rain & Shade'], answer: 1 },
  ],
  fill: [
    { t: 'fill', sentence: 'The sun rises in the ___ .', answer: 'east', opts: ['west', 'east', 'north', 'south'] },
    { t: 'fill', sentence: 'A hexagon has ___ sides.', answer: '6', opts: ['5', '6', '7', '8'] },
    { t: 'fill', sentence: 'The Ganga river flows into the ___ Bay.', answer: 'Bengal', opts: ['Bengal', 'Arabia', 'Mannar', 'Kutch'] },
    { t: 'fill', sentence: 'Photosynthesis takes place in the ___ of a plant.', answer: 'leaves', opts: ['roots', 'stem', 'leaves', 'flowers'] },
    { t: 'fill', sentence: 'Hindi is written in ___ script.', answer: 'Devanagari', opts: ['Roman', 'Devanagari', 'Persian', 'Gurmukhi'] },
  ],
  match: [
    { t: 'match', pairs: [['Taj Mahal', 'Agra'], ['Red Fort', 'Delhi'], ['Gateway of India', 'Mumbai'], ['Victoria Memorial', 'Kolkata']], hint: 'Match monument to city!' },
    { t: 'match', pairs: [['🐄 Cow', 'Milk'], ['🐝 Bee', 'Honey'], ['🐑 Sheep', 'Wool'], ['🐔 Hen', 'Eggs']], hint: 'What does each animal give us?' },
    { t: 'match', pairs: [['January', '1st Month'], ['July', '7th Month'], ['October', '10th Month'], ['December', '12th Month']], hint: 'Month positions!' },
  ],
  scramble: [
    { t: 'scramble', word: 'INDIA', hint: 'Our great nation 🇮🇳' },
    { t: 'scramble', word: 'EARTH', hint: 'Our home planet 🌍' },
    { t: 'scramble', word: 'WATER', hint: 'We drink it every day 💧' },
    { t: 'scramble', word: 'TIGER', hint: "India's national animal 🐯" },
    { t: 'scramble', word: 'LOTUS', hint: "India's national flower 🌸" },
    { t: 'scramble', word: 'MANGO', hint: 'King of fruits 🥭' },
    { t: 'scramble', word: 'CLOUD', hint: 'Floats in the sky ☁️' },
    { t: 'scramble', word: 'RIVER', hint: 'Flows into the sea 🏞️' },
  ],
  math: [
    { t: 'math_build', equation: '___ + 7 = 15', missing: 8, opts: [6, 7, 8, 9], hint: 'What + 7 = 15?' },
    { t: 'math_build', equation: '9 × ___ = 63', missing: 7, opts: [6, 7, 8, 9], hint: '9 times table' },
    { t: 'math_build', equation: '100 - ___ = 37', missing: 63, opts: [60, 63, 66, 73], hint: 'Subtract from 100' },
    { t: 'math_build', equation: '___ ÷ 8 = 9', missing: 72, opts: [64, 68, 72, 80], hint: '8 times 9 is?' },
  ],
}

function getSeedQuestions(subject, cls, diff) {
  const all = [
    ...SEED_QUESTIONS.visual,
    ...SEED_QUESTIONS.fill,
    ...SEED_QUESTIONS.match,
    ...SEED_QUESTIONS.scramble,
    ...(subject === 'Maths' ? SEED_QUESTIONS.math : SEED_QUESTIONS.visual.slice(0, 3)),
  ]
  // Shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]]
  }
  return all.slice(0, GAME.QUESTIONS_PER_BATCH)
}

// ── Core generator ────────────────────────────────────────────

let _generating = new Set() // prevent concurrent calls for same pool

export async function generateAndAppend(subject, cls, diff) {
  const lockKey = `${subject}:${cls}:${diff}`
  if (_generating.has(lockKey)) return 0
  _generating.add(lockKey)

  try {
    const effectiveCls = getEffectiveClass(subject, cls)
    const topics = getTopics(subject, effectiveCls)
    const tidx = await loadTopicIdx(subject, cls, diff)
    const topic = topics[tidx % topics.length]

    let questions = []

    try {
      const res = await fetch(GENERATE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, classNum: effectiveCls, difficulty: diff, topic }),
        signal: AbortSignal.timeout(30000), // 30s timeout
      })

      if (res.ok) {
        const data = await res.json()
        questions = data.questions || []
      }
    } catch (fetchErr) {
      console.warn(`[AI] Generation failed for ${subject}/${cls}/${diff}:`, fetchErr.message)
    }

    // Fall back to seed questions if API failed or returned nothing
    if (questions.length === 0) {
      console.info(`[AI] Using seed questions for ${subject}/${cls}/${diff}`)
      questions = getSeedQuestions(subject, cls, diff)
    }

    if (questions.length > 0) {
      await appendPool(subject, cls, diff, questions)
      await saveTopicIdx(subject, cls, diff, (tidx + 1) % topics.length)
    }

    return questions.length
  } finally {
    _generating.delete(lockKey)
  }
}

// ── Pick non-repeating question ───────────────────────────────

export async function pickQuestion(subject, cls, diff, onGenerating) {
  const effectiveCls = getEffectiveClass(subject, cls)
  let pool = await loadPool(subject, effectiveCls, diff)
  let used = await loadUsed(subject, effectiveCls, diff)

  // Empty pool — generate synchronously (blocks until ready)
  if (pool.length === 0) {
    onGenerating?.('✨ Creating questions...')
    await generateAndAppend(subject, effectiveCls, diff)
    pool = await loadPool(subject, effectiveCls, diff)
    used = new Set()
    onGenerating?.(null)
  }

  // All used — reset tracker (player has seen everything, reshuffle)
  const available = pool.map((_, i) => i).filter((i) => !used.has(i))
  if (available.length === 0) {
    await resetUsed(subject, effectiveCls, diff)
    used = new Set()
    // Trigger background generation for variety on next cycle
    generateAndAppend(subject, effectiveCls, diff).catch(() => {})
    // Return random from full pool
    const idx = Math.floor(Math.random() * pool.length)
    used.add(idx)
    await saveUsed(subject, effectiveCls, diff, used)
    return pool[idx] || null
  }

  // Pick random from unused
  const idx = available[Math.floor(Math.random() * available.length)]
  used.add(idx)
  await saveUsed(subject, effectiveCls, diff, used)

  // Trigger background generation when pool is running low
  const remaining = available.length - 1
  if (remaining < GAME.POOL_REGEN_THRESHOLD) {
    generateAndAppend(subject, effectiveCls, diff).catch(() => {})
  }

  return pool[idx] || null
}

// ── Preload first batch ───────────────────────────────────────
// Call this when a city/building is selected to warm up the pool

export async function preloadPool(subject, cls, diff) {
  const effectiveCls = getEffectiveClass(subject, cls)
  const pool = await loadPool(subject, effectiveCls, diff)
  const used = await loadUsed(subject, effectiveCls, diff)
  const unseen = pool.length - used.size
  if (unseen < GAME.POOL_REGEN_THRESHOLD) {
    generateAndAppend(subject, effectiveCls, diff).catch(() => {})
  }
}

export { getEffectiveClass }
