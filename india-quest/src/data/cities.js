// src/data/cities.js
// India map city nodes with unlock requirements and metadata

export const CITIES = [
  {
    id: 'delhi',
    name: 'New Delhi',
    cls: 1,
    x: 42, y: 24,        // SVG viewBox position (0-100)
    emoji: '🕌',
    col: '#FF6B6B',
    accent: '#ff4757',
    unlock: 0,            // rooms needed to unlock
    description: 'Start your quest in the capital! Class 1 zone.',
    subjects: ['English', 'Maths', 'Hindi', 'EVS'],
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    cls: 2,
    x: 34, y: 35,
    emoji: '🏰',
    col: '#FF8C42',
    accent: '#ff6b00',
    unlock: 4,
    description: 'The Pink City awaits! Class 2 zone.',
    subjects: ['English', 'Maths', 'Hindi', 'EVS'],
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    cls: 3,
    x: 22, y: 56,
    emoji: '🌆',
    col: '#FFD93D',
    accent: '#ffc200',
    unlock: 12,
    description: 'City of dreams! Class 3 zone.',
    subjects: ['English', 'Maths', 'Hindi', 'Science'],
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    cls: 4,
    x: 38, y: 73,
    emoji: '🔬',
    col: '#6BCB77',
    accent: '#00b341',
    unlock: 24,
    description: 'Silicon Valley of India! Class 4 zone.',
    subjects: ['English', 'Maths', 'Hindi', 'Science', 'Social'],
  },
  {
    id: 'chennai',
    name: 'Chennai',
    cls: 5,
    x: 50, y: 78,
    emoji: '🏛️',
    col: '#4D96FF',
    accent: '#0070ff',
    unlock: 40,
    description: 'Gateway to South India! Class 5 zone.',
    subjects: ['English', 'Maths', 'Hindi', 'Science', 'Social'],
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    cls: 0,             // 0 = bonus/mixed
    x: 70, y: 38,
    emoji: '⭐',
    col: '#C7B8EA',
    accent: '#9b59b6',
    unlock: 60,
    description: 'Bonus zone! India Map mastery challenges.',
    subjects: ['IndiaMap', 'Social'],
  },
]

export const ROUTES = [
  ['delhi', 'jaipur'],
  ['jaipur', 'mumbai'],
  ['mumbai', 'bengaluru'],
  ['bengaluru', 'chennai'],
  ['delhi', 'kolkata'],
  ['chennai', 'kolkata'],
]

export function getCityById(id) {
  return CITIES.find((c) => c.id === id)
}
