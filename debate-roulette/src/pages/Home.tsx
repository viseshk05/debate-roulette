import { useEffect, useState } from 'react'
import { doc, getDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import type { User } from '../types'
import TopicList from './TopicList'
import Queue from './Queue'
import ConversationRoom from './ConversationRoom'
import PostConversation from './PostConversation'
import Profile from './Profile'
import RandomQueue from './RandomQueue'
import { motion } from 'framer-motion'

type Screen = 'home' | 'topics' | 'queue' | 'random' | 'conversation' | 'post' | 'profile'

export default function Home() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [screen, setScreen] = useState<Screen>('home')
  const [queueTopic, setQueueTopic] = useState<{ topicId: string; side: 'A' | 'B' } | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [postConv, setPostConv] = useState<{
    conversationId: string
    partnerId: string
    partnerUsername: string
  } | null>(null)
  const [hasNotification, setHasNotification] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) setProfile(snap.data() as User)
    }
    fetch()
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsubUser = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        if ((data.pendingFriendRequests || []).length > 0) {
          setHasNotification(true)
        }
      }
    })
    return () => unsubUser()
  }, [user])

  useEffect(() => {
    if (!user || !profile?.friends?.length) return
    const chatIds = profile.friends.map(friendId =>
      [user.uid, friendId].sort().join('_')
    )
    const lastSeenKey = `lastSeen_${user.uid}`
    const lastSeen = parseInt(localStorage.getItem(lastSeenKey) || '0')
    const unsubscribers: (() => void)[] = []
    chatIds.forEach(chatId => {
      const q = query(
        collection(db, 'friendChats', chatId, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(1)
      )
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const lastMsg = snap.docs[0].data()
          const msgTime = lastMsg.timestamp?.toMillis?.() || 0
          if (lastMsg.senderId !== user.uid && msgTime > lastSeen) {
            setHasNotification(true)
          }
        }
      })
      unsubscribers.push(unsub)
    })
    return () => unsubscribers.forEach(u => u())
  }, [user, profile?.friends])

  const handleTopicSelect = (topicId: string, side: 'A' | 'B') => {
    setQueueTopic({ topicId, side })
    setScreen('queue')
  }

  const handleOpenProfile = () => {
    setHasNotification(false)
    const lastSeenKey = `lastSeen_${user?.uid}`
    localStorage.setItem(lastSeenKey, Date.now().toString())
    setScreen('profile')
  }

  if (screen === 'profile') return <Profile onBack={() => setScreen('home')} />

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
        onMatchFound={(convId) => { setConversationId(convId); setScreen('conversation') }}
        onCancel={() => setScreen('topics')}
      />
    )
  }

  if (screen === 'random') {
    return (
      <RandomQueue
        interests={profile?.interests || []}
        onMatchFound={(convId) => { setConversationId(convId); setScreen('conversation') }}
        onCancel={() => setScreen('home')}
        onSwitchToTopics={() => setScreen('topics')}
      />
    )
  }

  if (screen === 'conversation' && conversationId) {
    return (
      <ConversationRoom
        conversationId={conversationId}
        onEnd={(partnerId, partnerUsername) => {
          setPostConv({ conversationId, partnerId, partnerUsername })
          setConversationId(null)
          setScreen('post')
        }}
      />
    )
  }

  if (screen === 'post' && postConv) {
    return (
      <PostConversation
        conversationId={postConv.conversationId}
        partnerId={postConv.partnerId}
        partnerUsername={postConv.partnerUsername}
        onDone={() => { setPostConv(null); setScreen('home') }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600 opacity-10 blur-3xl rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎲</span>
          <span className="font-bold text-lg tracking-tight">Debate Roulette</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-white text-sm font-medium">{profile?.username}</span>
            <span className="text-gray-500 text-xs">{profile?.country}</span>
          </div>
          <button
            onClick={handleOpenProfile}
            className="relative w-10 h-10 rounded-full overflow-visible border-2 border-gray-700 hover:border-indigo-500 transition"
          >
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.username || 'user')}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&eyes=happy,wink`}
              alt="profile"
              className="w-full h-full rounded-full"
            />
            {hasNotification && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-950 z-10 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold mb-3 tracking-tight">
            Ready to talk,{' '}
            <span className="text-indigo-400">{profile?.username}</span>?
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            Get matched with someone who shares your interests and have a real conversation.
          </p>
        </motion.div>

        {/* Mode Cards */}
        <div className="w-full max-w-lg flex flex-col gap-4">

          {/* Random — Primary */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen('random')}
            className="relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 transition-all rounded-2xl p-6 text-left group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🎲</span>
                <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full text-white">
                  Recommended
                </span>
              </div>
              <div className="font-bold text-xl mb-1">Random Conversation</div>
              <div className="text-indigo-200 text-sm leading-relaxed">
                Get matched with someone who shares your interests. No topic, just a real conversation.
              </div>
            </div>
          </motion.button>

          {/* Topic Mode — Secondary */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setScreen('topics')}
            className="relative overflow-hidden bg-gray-900 hover:bg-gray-800 transition-all rounded-2xl p-6 text-left border border-white/5 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">🗣️</span>
                <span className="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full text-gray-400">
                  32 Topics
                </span>
              </div>
              <div className="font-bold text-xl mb-1">Topic Mode</div>
              <div className="text-gray-400 text-sm leading-relaxed">
                Pick a statement, choose your stance, get matched with someone who disagrees.
              </div>
            </div>
          </motion.button>
        </div>

        {/* Interests */}
        {profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-10 w-full max-w-lg"
          >
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 text-center">
              Your interests
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {profile.interests.map((interest, i) => (
                <motion.span
                  key={interest}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.03 }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    interest === profile.favoriteInterest
                      ? 'bg-indigo-900 text-indigo-300 ring-1 ring-indigo-500'
                      : 'bg-gray-900 text-gray-500 border border-gray-800'
                  }`}
                >
                  {interest === profile.favoriteInterest ? '⭐ ' : ''}{interest}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}