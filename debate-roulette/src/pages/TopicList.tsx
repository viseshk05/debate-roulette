import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TOPICS } from '../lib/topics'

const CATEGORY_ICONS: Record<string, string> = {
  All: '🌐',
  Sports: '⚽',
  Entertainment: '🎬',
  Music: '🎵',
  Technology: '💻',
  Gaming: '🎮',
  Literature: '📖',
  Philosophy: '🧠',
  History: '🏛️',
  Politics: '🗳️',
  Fandom: '✨',
  Astrology: '🔮',
  Science: '🔬',
  Fiction: '📚',
  Lifestyle: '🌿',
  Career: '💼',
}

const CATEGORIES = ['All', ...Array.from(new Set(Object.values(TOPICS).map(t => t.category)))]

const TOPICS_LIST = Object.entries(TOPICS).map(([id, t]) => ({ id, ...t }))

export default function TopicList({ onBack, onTopicSelect }: {
  onBack: () => void
  onTopicSelect: (topicId: string, side: 'A' | 'B') => void
}) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = TOPICS_LIST.filter(t => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleTopicClick = (id: string) => {
    setSelectedTopic(selectedTopic === id ? null : id)
  }

  const handleJoin = (topicId: string, side: 'A' | 'B') => {
    onTopicSelect(topicId, side)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-600 opacity-5 blur-3xl rounded-full" />
      </div>

      {/* Header — normal, no scroll */}
      <div className="relative z-10 flex items-center gap-3 px-6 py-4 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition"
        >
          ←
        </button>
        <div>
          <h1 className="font-bold text-lg">Choose a Topic</h1>
          <p className="text-gray-500 text-xs">{TOPICS_LIST.length} statements to debate</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative z-10 px-6 pt-4">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search topics..."
          className="w-full bg-gray-900/80 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition"
        />
      </div>

      {/* Category Filter — this is the only scrollable row */}
      <div className="no-scrollbar relative z-10 flex gap-2 px-6 py-4 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setSelectedTopic(null) }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-white/5'
            }`}
          >
            <span>{CATEGORY_ICONS[cat] || '📌'}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Topic List */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 flex flex-col gap-3 pb-6">
        {filtered.length === 0 && (
          <p className="text-gray-600 text-sm text-center mt-8">No topics match your search.</p>
        )}
        {filtered.map((t, i) => {
          const isExpanded = selectedTopic === t.id
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
            >
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-500/50 bg-indigo-950/50 shadow-lg shadow-indigo-500/10'
                    : 'border-white/5 bg-gray-900/80 hover:border-white/10 hover:bg-gray-900'
                }`}
              >
                <button
                  onClick={() => handleTopicClick(t.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block ${
                        isExpanded ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'
                      }`}>
                        {CATEGORY_ICONS[t.category] || '📌'} {t.category}
                      </span>
                      <p className="font-semibold text-sm leading-relaxed text-white">
                        {t.title}
                      </p>
                    </div>
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-600 mt-1 flex-shrink-0"
                    >
                      ↓
                    </motion.span>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5">
                        <p className="text-xs text-gray-500 mb-3">What's your take?</p>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleJoin(t.id, 'A')}
                            className="py-3 rounded-xl font-semibold text-sm transition bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                          >
                            <span>✓</span>
                            <span>I Agree</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleJoin(t.id, 'B')}
                            className="py-3 rounded-xl font-semibold text-sm transition bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                          >
                            <span>✗</span>
                            <span>I Disagree</span>
                          </motion.button>
                        </div>
                        <button
                          onClick={() => handleJoin(t.id, Math.random() > 0.5 ? 'A' : 'B')}
                          className="w-full py-2 rounded-xl text-xs text-gray-500 hover:text-gray-300 bg-gray-800/50 hover:bg-gray-800 transition border border-white/5"
                        >
                          🎲 Surprise me — pick a random side
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}