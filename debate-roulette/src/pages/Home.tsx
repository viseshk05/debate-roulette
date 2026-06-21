import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import type { User } from '../types'
import TopicList from './TopicList'
import Queue from './Queue'

type Screen = 'home' | 'topics' | 'queue'

export default function Home() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [screen, setScreen] = useState<Screen>('home')
  const [queueTopic, setQueueTopic] = useState<{ topicId: string; side: 'A' | 'B' } | null>(null)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) setProfile(snap.data() as User)
    }
    fetch()
  }, [user])

  const handleTopicSelect = (topicId: string, side: 'A' | 'B') => {
    setQueueTopic({ topicId, side })
    setScreen('queue')
  }

  if (screen === 'topics') {
    return (
      <TopicList
        onBack={() => setScreen('home')}
        onTopicSelect={handleTopicSelect}
      />
    )
  }

  if (screen === 'queue' && queueTopic) {
    return (
      <Queue
        topicId={queueTopic.topicId}
        side={queueTopic.side}
        onMatchFound={(conversationId) => {
          console.log('Match found! Conversation:', conversationId)
          // Conversation room coming next
        }}
        onCancel={() => setScreen('topics')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-900">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎲</span>
          <span className="font-bold text-lg">Debate Roulette</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{profile?.username}</span>
          <button onClick={logout} className="text-gray-600 hover:text-white text-sm transition">
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-3xl font-bold mb-2">
          Ready to talk, {profile?.username}?
        </h2>
        <p className="text-gray-500 mb-10 max-w-sm">
          Pick a mode and get matched with someone who shares your interests.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={() => setScreen('topics')}
            className="bg-indigo-600 hover:bg-indigo-500 transition rounded-2xl p-6 text-left"
          >
            <div className="text-2xl mb-2">🗣️</div>
            <div className="font-bold text-lg mb-1">Topic Mode</div>
            <div className="text-indigo-200 text-sm">
              Pick a topic, choose your side, get matched with someone who disagrees.
            </div>
          </button>

          <button className="bg-gray-900 hover:bg-gray-800 transition rounded-2xl p-6 text-left border border-gray-800">
            <div className="text-2xl mb-2">🎲</div>
            <div className="font-bold text-lg mb-1">Random Conversation</div>
            <div className="text-gray-400 text-sm">
              Get matched with someone who shares your interests. No topic, just talk.
            </div>
          </button>
        </div>

        {profile && (
          <div className="mt-10 flex flex-wrap gap-2 justify-center max-w-sm">
            {profile.interests.map(interest => (
              <span
                key={interest}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  interest === profile.favoriteInterest
                    ? 'bg-indigo-900 text-indigo-300 ring-1 ring-indigo-500'
                    : 'bg-gray-900 text-gray-500'
                }`}
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}