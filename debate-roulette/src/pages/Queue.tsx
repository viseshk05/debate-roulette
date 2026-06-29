import { useEffect, useState, useRef } from 'react'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { joinTopicQueue, leaveQueue, listenForMatch, createConversation } from '../lib/matchmaking'
import { motion, AnimatePresence } from 'framer-motion'
import { TOPICS } from '../lib/topics'

export default function Queue({
  topicId,
  side,
  onMatchFound,
  onCancel,
}: {
  topicId: string
  side: 'A' | 'B'
  onMatchFound: (conversationId: string) => void
  onCancel: () => void
}) {
  const { user } = useAuth()
  const [seconds, setSeconds] = useState(0)
  const [status, setStatus] = useState<'waiting' | 'matched'>('waiting')
  const matchedRef = useRef(false)
  const unsubscribeMatchRef = useRef<(() => void) | null>(null)
  const unsubscribeNotifRef = useRef<(() => void) | null>(null)

  const topic = TOPICS[topicId]
  const mySide = side === 'A' ? 'Agree' : 'Disagree'
  const mySideColor = side === 'A' ? 'text-green-400' : 'text-red-400'
  const mySideBg = side === 'A' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'

  const handleMatch = async (convId: string) => {
    if (matchedRef.current) return
    matchedRef.current = true
    setStatus('matched')
    unsubscribeMatchRef.current?.()
    unsubscribeNotifRef.current?.()
    await leaveQueue(user!.uid)
    await deleteDoc(doc(db, 'matchNotifications', user!.uid)).catch(() => {})
    onMatchFound(convId)
  }

  useEffect(() => {
    if (!user) return
    const setup = async () => {
      await joinTopicQueue(user.uid, topicId, side)
      unsubscribeMatchRef.current = listenForMatch(
        user.uid, side, topicId,
        async (partnerId) => {
          if (matchedRef.current) return
          const convId = await createConversation(user.uid, partnerId, topicId, [])
          await setDoc(doc(db, 'matchNotifications', partnerId), {
            conversationId: convId,
            timestamp: new Date(),
          })
          handleMatch(convId)
        }
      )
      unsubscribeNotifRef.current = onSnapshot(
        doc(db, 'matchNotifications', user.uid),
        (snap) => {
          if (snap.exists() && !matchedRef.current) {
            handleMatch(snap.data().conversationId)
          }
        }
      )
    }
    setup()
    const timer = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => {
      clearInterval(timer)
      unsubscribeMatchRef.current?.()
      unsubscribeNotifRef.current?.()
      if (!matchedRef.current) leaveQueue(user!.uid)
    }
  }, [user])

  const handleCancel = async () => {
    matchedRef.current = true
    unsubscribeMatchRef.current?.()
    unsubscribeNotifRef.current?.()
    await leaveQueue(user!.uid)
    onCancel()
  }

  const statusText = () => {
    if (seconds < 10) return 'Looking for someone with the opposite view...'
    if (seconds < 30) return 'Expanding the search...'
    return 'Still looking — hang tight...'
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-indigo-600 opacity-5 blur-3xl rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {status === 'waiting' ? (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 flex flex-col items-center text-center max-w-sm w-full"
          >
            {/* Spinning dice */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl mb-8"
            >
              🎲
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">Finding your opponent...</h2>
            <p className="text-gray-500 text-sm mb-8">
              Looking for someone who disagrees with you
            </p>

            {/* Topic card */}
            <div className="w-full bg-gray-900/80 border border-white/5 rounded-2xl p-4 mb-4 text-left">
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Topic</p>
              <p className="text-white text-sm font-medium leading-relaxed">{topic?.title}</p>
            </div>

            {/* Your stance */}
            <div className={`w-full border rounded-2xl p-4 mb-8 text-left ${mySideBg}`}>
              <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Your stance</p>
              <p className={`text-sm font-bold ${mySideColor}`}>
                {side === 'A' ? '✓' : '✗'} I {mySide}
              </p>
            </div>

            {/* Status */}
            <motion.p
              key={statusText()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 text-sm mb-2"
            >
              {statusText()}
            </motion.p>
            <p className="text-gray-800 text-xs mb-8 font-mono">{seconds}s</p>

            {/* Progress dots */}
            <div className="flex gap-1.5 mb-8">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
                  className="w-2 h-2 rounded-full bg-indigo-500"
                />
              ))}
            </div>

            <button
              onClick={handleCancel}
              className="text-gray-600 hover:text-white text-sm transition px-4 py-2 rounded-lg hover:bg-gray-900"
            >
              Cancel search
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="matched"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-6xl mb-6"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Opponent found!</h2>
            <p className="text-gray-500 text-sm">Taking you to the debate...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}