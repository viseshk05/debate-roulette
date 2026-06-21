import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const TOPICS = [
  { id: 't1', title: 'Virat Kohli vs Rohit Sharma', sideA: 'Virat Kohli', sideB: 'Rohit Sharma', category: 'Sports' },
  { id: 't2', title: 'Messi vs Ronaldo', sideA: 'Messi', sideB: 'Ronaldo', category: 'Sports' },
  { id: 't3', title: 'Android vs iPhone', sideA: 'Android', sideB: 'iPhone', category: 'Technology' },
  { id: 't4', title: 'Marvel vs DC', sideA: 'Marvel', sideB: 'DC', category: 'Entertainment' },
  { id: 't5', title: 'Interstellar vs Inception', sideA: 'Interstellar', sideB: 'Inception', category: 'Entertainment' },
  { id: 't6', title: 'Nolan vs Scorsese', sideA: 'Nolan', sideB: 'Scorsese', category: 'Entertainment' },
  { id: 't7', title: 'PC vs Console Gaming', sideA: 'PC', sideB: 'Console', category: 'Gaming' },
  { id: 't8', title: 'Football vs Cricket', sideA: 'Football', sideB: 'Cricket', category: 'Sports' },
  { id: 't9', title: 'AI is good vs bad for humanity', sideA: 'Good', sideB: 'Bad', category: 'Technology' },
  { id: 't10', title: 'Gym vs Calisthenics', sideA: 'Gym', sideB: 'Calisthenics', category: 'Lifestyle' },
]

const CATEGORIES = ['All', 'Sports', 'Entertainment', 'Technology', 'Gaming', 'Lifestyle']

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

  const topic = TOPICS.find(t => t.id === selectedTopic)

  const handleJoin = () => {
    if (!selectedTopic || !selectedSide) return
    onTopicSelect(selectedTopic, selectedSide)
  }

  const handleRandomSide = () => {
    const side = Math.random() > 0.5 ? 'A' : 'B'
    setSelectedSide(side)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-900">
        <button onClick={onBack} className="text-gray-500 hover:text-white transition">
          ←
        </button>
        <h1 className="font-bold text-lg">Choose a Topic</h1>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 px-6 py-4 overflow-x-auto">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Topic List */}
      <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-3 pb-6">
        {filtered.map(t => (
          <button
            key={t.id}
            onClick={() => { setSelectedTopic(t.id); setSelectedSide(null) }}
            className={`rounded-2xl p-5 text-left transition border ${
              selectedTopic === t.id
                ? 'border-indigo-500 bg-indigo-950'
                : 'border-gray-800 bg-gray-900 hover:border-gray-700'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">{t.category}</div>
            <div className="font-semibold mb-3">{t.title}</div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">{t.sideA}</span>
              <span className="text-gray-600 text-xs self-center">vs</span>
              <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">{t.sideB}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Side Selection Panel */}
      {selectedTopic && topic && (
        <div className="border-t border-gray-800 bg-gray-950 px-6 py-5">
          <p className="text-sm text-gray-400 mb-3">Choose your side for <span className="text-white font-medium">{topic.title}</span></p>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedSide('A')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition ${
                selectedSide === 'A'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {topic.sideA}
            </button>
            <button
              onClick={() => setSelectedSide('B')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition ${
                selectedSide === 'B'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {topic.sideB}
            </button>
            <button
              onClick={handleRandomSide}
              className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm transition"
            >
              🎲
            </button>
          </div>
          <button
            onClick={handleJoin}
            disabled={!selectedSide}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition"
          >
            Find Someone to Debate →
          </button>
        </div>
      )}

    </div>
  )
}