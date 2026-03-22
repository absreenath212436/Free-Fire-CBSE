// src/data/buildings.js
// Buildings per city — each building = one subject

export const BUILDINGS = {
  delhi: [
    { id: 'lib',  name: 'Magic Library',  subj: 'English', icon: '📚', col: '#E76F51', gx: 1, gy: 1 },
    { id: 'ntem', name: 'Number Temple',  subj: 'Maths',   icon: '🔢', col: '#4ECDC4', gx: 7, gy: 1 },
    { id: 'fort', name: 'Hindi Fort',     subj: 'Hindi',   icon: '🕌', col: '#FFE66D', gx: 1, gy: 6 },
    { id: 'park', name: 'Nature Park',    subj: 'EVS',     icon: '🌿', col: '#6BCB77', gx: 7, gy: 6 },
  ],
  jaipur: [
    { id: 'tower', name: 'Word Tower',   subj: 'English', icon: '📖', col: '#E76F51', gx: 1, gy: 1 },
    { id: 'calc',  name: 'Calc Castle',  subj: 'Maths',   icon: '🧮', col: '#4ECDC4', gx: 7, gy: 1 },
    { id: 'mahl',  name: 'Hindi Mahal',  subj: 'Hindi',   icon: '🇮🇳', col: '#FFE66D', gx: 1, gy: 6 },
    { id: 'gard',  name: 'Eco Garden',   subj: 'EVS',     icon: '🌺', col: '#6BCB77', gx: 7, gy: 6 },
  ],
  mumbai: [
    { id: 'gram', name: 'Grammar Hub',   subj: 'English', icon: '📝', col: '#E76F51', gx: 1, gy: 1 },
    { id: 'math', name: 'Math Fortress', subj: 'Maths',   icon: '➗', col: '#4ECDC4', gx: 7, gy: 1 },
    { id: 'hind', name: 'Kavya Kutir',   subj: 'Hindi',   icon: '📜', col: '#FFE66D', gx: 1, gy: 6 },
    { id: 'sci',  name: 'Science Lab',   subj: 'Science', icon: '🧪', col: '#6BCB77', gx: 7, gy: 6 },
  ],
  bengaluru: [
    { id: 'lang', name: 'Language Loft', subj: 'English', icon: '🔤', col: '#E76F51', gx: 1, gy: 1 },
    { id: 'geo',  name: 'Geo Guild',     subj: 'Maths',   icon: '📐', col: '#4ECDC4', gx: 7, gy: 1 },
    { id: 'sah',  name: 'Sahitya Sadan', subj: 'Hindi',   icon: '📚', col: '#FFE66D', gx: 1, gy: 6 },
    { id: 'lab',  name: 'Bio Lab',       subj: 'Science', icon: '🔬', col: '#6BCB77', gx: 7, gy: 6 },
    { id: 'hist', name: 'History Hall',  subj: 'Social',  icon: '🗺️', col: '#C7B8EA', gx: 4, gy: 9 },
  ],
  chennai: [
    { id: 'pres', name: 'Press House',   subj: 'English', icon: '📰', col: '#E76F51', gx: 1, gy: 1 },
    { id: 'gal',  name: 'Math Galaxy',   subj: 'Maths',   icon: '🚀', col: '#4ECDC4', gx: 7, gy: 1 },
    { id: 'bhas', name: 'Bhasha Bhavan', subj: 'Hindi',   icon: '🎭', col: '#FFE66D', gx: 1, gy: 6 },
    { id: 'cosm', name: 'Cosmos Centre', subj: 'Science', icon: '🪐', col: '#6BCB77', gx: 7, gy: 6 },
    { id: 'ind',  name: 'India Museum',  subj: 'Social',  icon: '🏛️', col: '#C7B8EA', gx: 4, gy: 9 },
  ],
  kolkata: [
    { id: 'map',  name: 'Map Academy',   subj: 'IndiaMap', icon: '🗺️', col: '#C7B8EA', gx: 3, gy: 3 },
    { id: 'bon',  name: 'Bonus Arena',   subj: 'Social',   icon: '⭐', col: '#FFD93D', gx: 7, gy: 7 },
  ],
}

export function getBuildingsForCity(cityId) {
  return BUILDINGS[cityId] || []
}

export function getBuildingById(cityId, buildingId) {
  return (BUILDINGS[cityId] || []).find((b) => b.id === buildingId)
}

// Get total rooms across all cities
export function getTotalRooms() {
  return Object.values(BUILDINGS)
    .flat()
    .reduce((sum) => sum + 3 * 4, 0)  // 3 floors × 4 rooms
}
