import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TOPICS = [
  { id: 't1', title: 'Virat Kohli is a better Test captain than Rohit Sharma', category: 'Sports' },
  { id: 't2', title: 'Messi is the greatest footballer of all time', category: 'Sports' },
  { id: 't3', title: 'Cricket is more skillful than Football', category: 'Sports' },
  { id: 't4', title: 'LeBron James is better than Michael Jordan', category: 'Sports' },
  { id: 't5', title: 'T20 is ruining Test cricket', category: 'Sports' },
  { id: 't6', title: 'Marvel has better storytelling than DC', category: 'Entertainment' },
  { id: 't7', title: 'Interstellar is a better film than Inception', category: 'Entertainment' },
  { id: 't8', title: 'Nolan is a better director than Scorsese', category: 'Entertainment' },
  { id: 't9', title: 'Anime has better storytelling than Western shows', category: 'Entertainment' },
  { id: 't10', title: 'TV shows are a better format than movies for storytelling', category: 'Entertainment' },
  { id: 't11', title: 'Android gives more value than iPhone', category: 'Technology' },
  { id: 't12', title: 'AI will do more good than harm for humanity', category: 'Technology' },
  { id: 't13', title: 'Remote work is more productive than office work', category: 'Technology' },
  { id: 't14', title: 'Social media does more harm than good to society', category: 'Technology' },
  { id: 't15', title: 'Electric cars are ready to replace petrol cars today', category: 'Technology' },
  { id: 't16', title: 'PC gaming is superior to console gaming', category: 'Gaming' },
  { id: 't17', title: 'PUBG is a better game than Free Fire', category: 'Gaming' },
  { id: 't18', title: 'Single player games are better than multiplayer', category: 'Gaming' },
  { id: 't19', title: 'Minecraft has more creative value than Roblox', category: 'Gaming' },
  { id: 't20', title: 'Calisthenics builds better functional fitness than gym', category: 'Lifestyle' },
  { id: 't21', title: 'Being an early bird is better than being a night owl', category: 'Lifestyle' },
  { id: 't22', title: 'A vegetarian diet is healthier than a non-vegetarian one', category: 'Lifestyle' },
  { id: 't23', title: 'Books are a better learning tool than podcasts', category: 'Lifestyle' },
  { id: 't24', title: 'City life is better than village life in the modern era', category: 'Lifestyle' },
  { id: 't25', title: 'Kendrick Lamar is a better artist than Drake', category: 'Music' },
  { id: 't26', title: 'Hip Hop has more cultural depth than Rock', category: 'Music' },
  { id: 't27', title: 'Spotify is a better music platform than YouTube Music', category: 'Music' },
  { id: 't28', title: 'Live music is a better experience than studio albums', category: 'Music' },
  { id: 't29', title: 'A college degree is still worth it in 2025', category: 'Career' },
  { id: 't30', title: 'Job security is more important than startup risk at 25', category: 'Career' },
  { id: 't31', title: 'You should follow your passion even if it pays less', category: 'Career' },
  { id: 't32', title: 'Being an entrepreneur is better than being an employee', category: 'Career' },
]

const CATEGORY_ICONS: Record<string, string> = {
  All: '🌐',
  Sports: '⚽',
  Entertainment: '🎬',
  Technology: '💻',
  Gaming: '🎮',
  Lifestyle: '🌿',
  Music: '🎵',
  Career: '💼',
}

const CATEGORIES = ['All', 'Sports', 'Entertainment', 'Technology', 'Gaming', 'Lifestyle', 'Music', 'Career']

type Side = 'A' | 'B' | null

export default function TopicList({ onBack, onTopicSelect }: {
  onBack: () => void
  onTopicSelect: (topicId: string, side: 'A' | 'B') => void
}) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedSide, setSelectedSide] = useState<Side>(null)

  const filtered = TOPICS.filter(t =>
    selectedCategory === 'All' || t.category === selectedCategory
  )

  const handleTopicClick = (id: string) => {
    if (selectedTopic === id) {
      setSelectedTopic(null)
      setSelectedSide(null)
    } else {
      setSelectedTopic(id)
      setSelectedSide(null)
    }
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

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-6 py-4 border-b border-white/5">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition"
        >
          ←
        </button>
        <div>
          <h1 className="font-bold text-lg">Choose a Topic</h1>
          <p className="text-gray-500 text-xs">Pick a statement and take your stance</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="relative z-10 flex gap-2 px-6 py-4 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setSelectedCategory(cat); setSelectedTopic(null); setSelectedSide(null) }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-white/5'
            }`}
          >
            <span>{CATEGORY_ICONS[cat]}</span>
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Topic List */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 flex flex-col gap-3 pb-6">
        {filtered.map((t, i) => {
          const isExpanded = selectedTopic === t.id
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-500/50 bg-indigo-950/50 shadow-lg shadow-indigo-500/10'
                    : 'border-white/5 bg-gray-900/80 hover:border-white/10 hover:bg-gray-900'
                }`}
              >
                {/* Topic Header — always visible */}
                <button
                  onClick={() => handleTopicClick(t.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block ${
                        isExpanded ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-800 text-gray-500'
                      }`}>
                        {CATEGORY_ICONS[t.category]} {t.category}
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

                {/* Inline side selection — expands when topic clicked */}
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