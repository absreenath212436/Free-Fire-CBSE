// src/hooks/usePlayer.js
// ─────────────────────────────────────────────────────────────
// Zustand store for player state — persists to IndexedDB
// ─────────────────────────────────────────────────────────────
import { create } from 'zustand'
import { GAME } from '../config.js'
import { loadPlayer, savePlayer } from '../services/storage.js'

const DEFAULT_PLAYER = {
  name: 'Hero',
  avatar: '🧒',
  cls: 1,
  level: 1,
  xp: 0,
  hp: GAME.MAX_HP,
  coins: 150,
  completedRooms: {},  // { 'cityId_buildingId_floor_room': stars }
  createdAt: null,
}

export const usePlayer = create((set, get) => ({
  ...DEFAULT_PLAYER,
  loaded: false,

  // Load saved player from IndexedDB on app start
  loadFromStorage: async () => {
    const saved = await loadPlayer()
    if (saved) {
      set({ ...saved, loaded: true })
    } else {
      set({ loaded: true })
    }
  },

  // Called from intro screen
  initPlayer: async (name, avatar, cls) => {
    const player = { ...DEFAULT_PLAYER, name, avatar, cls, createdAt: Date.now() }
    set(player)
    await savePlayer(player)
  },

  // Complete a puzzle room
  completeRoom: async (cityId, buildingId, floor, room, stars, hpAfter, coinsAfter, xpAfter) => {
    const key = `${cityId}_${buildingId}_${floor}_${room}`
    const current = get()
    const existingStars = current.completedRooms[key] || 0
    const newHp = Math.min(GAME.MAX_HP, hpAfter + GAME.HP_REGEN_ROOM)
    const newCoins = coinsAfter + GAME.COINS_BONUS_ROOM
    const newXp = xpAfter + GAME.XP_PER_ROOM
    const newLevel = Math.floor(newXp / GAME.XP_PER_LEVEL) + 1
    const newCompletedRooms = {
      ...current.completedRooms,
      [key]: Math.max(existingStars, stars),
    }
    const updates = {
      hp: newHp,
      coins: newCoins,
      xp: newXp,
      level: newLevel,
      completedRooms: newCompletedRooms,
    }
    set(updates)
    await savePlayer({ ...current, ...updates })
  },

  // Check if a room is cleared
  isRoomCleared: (cityId, buildingId, floor, room) => {
    const key = `${cityId}_${buildingId}_${floor}_${room}`
    return get().completedRooms[key] > 0
  },

  // Check if entire floor is cleared
  isFloorCleared: (cityId, buildingId, floor) => {
    const { completedRooms } = get()
    return Array(GAME.ROOMS_PER_FLOOR)
      .fill(null)
      .every((_, r) => completedRooms[`${cityId}_${buildingId}_${floor}_${r}`] > 0)
  },

  // Get star count for a room
  getRoomStars: (cityId, buildingId, floor, room) => {
    return get().completedRooms[`${cityId}_${buildingId}_${floor}_${room}`] || 0
  },

  // Total rooms cleared across all cities
  getTotalCleared: () => {
    return Object.keys(get().completedRooms).filter((k) => get().completedRooms[k] > 0).length
  },

  // XP progress within current level
  getXpProgress: () => {
    const { xp } = get()
    return (xp % GAME.XP_PER_LEVEL) / GAME.XP_PER_LEVEL
  },
}))
