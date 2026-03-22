// src/config.js
// ─────────────────────────────────────────────────────────────
// Central config for India Quest
// Change game balance here — no hunting through components
// ─────────────────────────────────────────────────────────────

export const GAME = {
  // Player stats
  MAX_HP: 100,
  HP_LOSS_WRONG: 15,      // HP lost per wrong answer
  HP_REGEN_ROOM: 8,       // HP recovered after completing a room
  
  // Rewards
  COINS_PER_CORRECT: 25,
  COINS_BONUS_ROOM: 50,   // bonus coins on room completion
  XP_PER_CORRECT: 20,
  XP_PER_ROOM: 60,
  XP_PER_LEVEL: 300,
  
  // Rooms
  ROOMS_PER_FLOOR: 4,
  FLOORS_PER_BUILDING: 3,
  QUESTIONS_NORMAL: 3,    // questions per normal room
  QUESTIONS_BOSS: 5,      // questions for boss room (floor 3, room 4)
  BOSS_TIMER_SEC: 25,     // countdown for boss room questions
  
  // Question pool management
  POOL_REGEN_THRESHOLD: 20,  // generate more when unused pool drops below this
  QUESTIONS_PER_BATCH: 15,   // questions per AI generation call
  
  // Difficulty labels
  DIFFICULTY: {
    1: { label: '🟢 EASY',   color: '#6BCB77', desc: 'Foundational' },
    2: { label: '🟡 MEDIUM', color: '#FFD93D', desc: 'Applied' },
    3: { label: '🔴 BOSS',   color: '#FF6B6B', desc: 'Challenge' },
  },
}

// API endpoint — auto-switches between local dev proxy and production
export const API_BASE = import.meta.env.DEV ? '' : ''
export const GENERATE_ENDPOINT = `${API_BASE}/api/generate`

// LocalStorage / IndexedDB key prefixes
export const STORAGE = {
  PLAYER: 'iq:player',
  POOL_PREFIX: 'iq:pool:',     // iq:pool:English:1:2
  USED_PREFIX: 'iq:used:',     // iq:used:English:1:2
  TOPIC_IDX_PREFIX: 'iq:tidx:', // iq:tidx:English:1:2
}
