// src/services/storage.js
// ─────────────────────────────────────────────────────────────
// Persistent question pool storage using IndexedDB (idb-keyval)
// Falls back to localStorage if IndexedDB unavailable
// ─────────────────────────────────────────────────────────────
import { get, set, del, keys } from 'idb-keyval'
import { STORAGE } from '../config.js'

// ── Key builders ──────────────────────────────────────────────
export const poolKey  = (subject, cls, diff) => `${STORAGE.POOL_PREFIX}${subject}:${cls}:${diff}`
export const usedKey  = (subject, cls, diff) => `${STORAGE.USED_PREFIX}${subject}:${cls}:${diff}`
export const topicKey = (subject, cls, diff) => `${STORAGE.TOPIC_IDX_PREFIX}${subject}:${cls}:${diff}`

// ── Pool helpers ──────────────────────────────────────────────

/** Load the question pool for a subject/class/difficulty */
export async function loadPool(subject, cls, diff) {
  try {
    return (await get(poolKey(subject, cls, diff))) || []
  } catch {
    try {
      const raw = localStorage.getItem(poolKey(subject, cls, diff))
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  }
}

/** Save/append questions to the pool */
export async function savePool(subject, cls, diff, pool) {
  try {
    await set(poolKey(subject, cls, diff), pool)
  } catch {
    try { localStorage.setItem(poolKey(subject, cls, diff), JSON.stringify(pool)) } catch {}
  }
}

/** Append new questions without overwriting existing pool */
export async function appendPool(subject, cls, diff, newQuestions) {
  const existing = await loadPool(subject, cls, diff)
  await savePool(subject, cls, diff, [...existing, ...newQuestions])
}

// ── Used-index tracking ───────────────────────────────────────

export async function loadUsed(subject, cls, diff) {
  try {
    const arr = (await get(usedKey(subject, cls, diff))) || []
    return new Set(arr)
  } catch { return new Set() }
}

export async function saveUsed(subject, cls, diff, usedSet) {
  try {
    await set(usedKey(subject, cls, diff), [...usedSet])
  } catch {
    try { localStorage.setItem(usedKey(subject, cls, diff), JSON.stringify([...usedSet])) } catch {}
  }
}

export async function resetUsed(subject, cls, diff) {
  await saveUsed(subject, cls, diff, new Set())
}

// ── Topic index (which topic to generate next) ────────────────

export async function loadTopicIdx(subject, cls, diff) {
  try { return (await get(topicKey(subject, cls, diff))) || 0 } catch { return 0 }
}

export async function saveTopicIdx(subject, cls, diff, idx) {
  try { await set(topicKey(subject, cls, diff), idx) } catch {}
}

// ── Player data ───────────────────────────────────────────────

export async function loadPlayer() {
  try { return (await get(STORAGE.PLAYER)) || null } catch {
    try { const r = localStorage.getItem(STORAGE.PLAYER); return r ? JSON.parse(r) : null } catch { return null }
  }
}

export async function savePlayer(playerData) {
  try { await set(STORAGE.PLAYER, playerData) } catch {
    try { localStorage.setItem(STORAGE.PLAYER, JSON.stringify(playerData)) } catch {}
  }
}

// ── Stats for UI ──────────────────────────────────────────────

export async function getStorageStats() {
  const stats = []
  try {
    const allKeys = await keys()
    for (const k of allKeys) {
      if (String(k).startsWith(STORAGE.POOL_PREFIX)) {
        const parts = String(k).replace(STORAGE.POOL_PREFIX, '').split(':')
        const [subject, cls, diff] = parts
        const pool = await get(k) || []
        const used = (await get(usedKey(subject, parseInt(cls), parseInt(diff)))) || []
        stats.push({
          subject, cls: parseInt(cls), diff: parseInt(diff),
          total: pool.length, used: used.length,
          unseen: pool.length - used.length,
        })
      }
    }
  } catch {}
  return stats
}

export async function getTotalQuestions() {
  const stats = await getStorageStats()
  return stats.reduce((sum, s) => sum + s.total, 0)
}

export async function clearAllStorage() {
  try {
    const allKeys = await keys()
    for (const k of allKeys) {
      if (String(k).startsWith('iq:')) await del(k)
    }
  } catch {}
}
