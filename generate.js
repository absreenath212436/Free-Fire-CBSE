// api/generate.js
// ─────────────────────────────────────────────────────────────
// Vercel Serverless Function — AI Question Generator
// Called by the frontend to generate CBSE questions
// Keeps your Anthropic API key safe on the server side
// ─────────────────────────────────────────────────────────────

const ALLOWED_SUBJECTS = ['English', 'Maths', 'EVS', 'Hindi', 'Science', 'Social', 'IndiaMap']
const ALLOWED_CLASSES = [1, 2, 3, 4, 5]
const ALLOWED_DIFFICULTIES = [1, 2, 3]

function buildPrompt(subject, classNum, difficulty, topic) {
  const age = classNum + 5
  const diffLabel =
    difficulty === 1
      ? `Easy — basic recall, recognition, simple identification. Student is ${age} years old. Use very simple language.`
      : difficulty === 2
        ? `Medium — application and understanding. Requires some thinking. Age ${age}.`
        : `Hard — analysis, synthesis, complex reasoning. Boss-level challenge. Age ${age}.`

  return `You are a CBSE curriculum expert for India. Generate exactly 15 unique quiz questions.

Subject: ${subject}
Class: ${classNum} (student age ~${age} years)
Topic: "${topic}"
Difficulty: ${diffLabel}

STRICT OUTPUT RULES:
- Return ONLY a valid JSON array. Zero markdown, zero explanation, zero extra text.
- Each question must be unique — no two questions should test the same fact.
- Cover the topic from multiple angles.
- All 5 question types below should appear in the 15 questions.

QUESTION TYPES — use EXACTLY this schema:

TYPE visual (MCQ):
{"t":"visual","question":"Clear question text?","items":["Option A","Option B","Option C","Option D"],"answer":0}
→ answer = 0-3 (index of correct item)

TYPE fill (Fill in blank):
{"t":"fill","sentence":"Complete sentence with ___ blank.","answer":"correctword","opts":["correctword","wrong1","wrong2","wrong3"]}
→ answer must be identical to one opt

TYPE match (Match pairs):
{"t":"match","pairs":[["left1","right1"],["left2","right2"],["left3","right3"],["left4","right4"]],"hint":"What to match"}
→ exactly 4 pairs, both sides concise

TYPE scramble (Word unscramble):
{"t":"scramble","word":"UPPERCASE","hint":"Clear clue describing the word"}
→ word = 3-9 UPPERCASE letters, no spaces, single word only

TYPE math_build (Equation with missing number) — Maths subject ONLY:
{"t":"math_build","equation":"___ + 7 = 15","missing":8,"opts":[6,7,8,9],"hint":"What adds to 7 to make 15?"}
→ missing = number answer; opts = array of 4 numbers including missing

For non-Maths subjects, replace math_build questions with extra visual or fill questions.

Output exactly 15 questions as a JSON array. Begin with [ and end with ].`
}

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' })
  }

  // Validate input
  const { subject, classNum, difficulty, topic } = req.body || {}

  if (!subject || !ALLOWED_SUBJECTS.includes(subject)) {
    return res.status(400).json({ error: 'Invalid subject' })
  }
  if (!classNum || !ALLOWED_CLASSES.includes(parseInt(classNum))) {
    return res.status(400).json({ error: 'Invalid class number' })
  }
  if (!difficulty || !ALLOWED_DIFFICULTIES.includes(parseInt(difficulty))) {
    return res.status(400).json({ error: 'Invalid difficulty' })
  }
  if (!topic || typeof topic !== 'string' || topic.length > 200) {
    return res.status(400).json({ error: 'Invalid topic' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY not set in environment variables')
    return res.status(500).json({ error: 'API key not configured. Set ANTHROPIC_API_KEY in Vercel dashboard.' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: buildPrompt(subject, parseInt(classNum), parseInt(difficulty), topic),
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return res.status(502).json({ error: 'AI service error', details: err })
    }

    const data = await response.json()
    const raw = data.content?.[0]?.text || '[]'

    // Parse and validate questions
    const clean = raw.replace(/```json|```/g, '').trim()
    let questions = []
    try {
      questions = JSON.parse(clean)
    } catch {
      console.error('Failed to parse AI response:', raw.slice(0, 200))
      return res.status(500).json({ error: 'Failed to parse AI response', raw: raw.slice(0, 500) })
    }

    if (!Array.isArray(questions)) {
      return res.status(500).json({ error: 'AI returned non-array response' })
    }

    // Filter valid questions
    const valid = questions.filter((q) => {
      if (!q || !q.t) return false
      if (q.t === 'visual') return q.question && Array.isArray(q.items) && q.items.length === 4 && typeof q.answer === 'number'
      if (q.t === 'fill') return q.sentence && q.answer && Array.isArray(q.opts) && q.opts.length >= 2
      if (q.t === 'match') return Array.isArray(q.pairs) && q.pairs.length >= 2
      if (q.t === 'scramble') return q.word && q.hint && /^[A-Z\u0900-\u097F]+$/.test(q.word)
      if (q.t === 'math_build') return q.equation && q.missing !== undefined && Array.isArray(q.opts)
      return false
    })

    return res.status(200).json({
      questions: valid,
      meta: {
        subject,
        classNum: parseInt(classNum),
        difficulty: parseInt(difficulty),
        topic,
        total: valid.length,
        generatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ error: 'Internal server error', message: error.message })
  }
}
