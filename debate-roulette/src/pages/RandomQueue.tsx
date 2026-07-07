import { useEffect, useState, useRef } from 'react'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { joinRandomQueue, leaveQueue, listenForRandomMatch, createConversation } from '../lib/matchmaking'
import { motion, AnimatePresence } from 'framer-motion'

export default function RandomQueue({
  interests,
  onMatchFound,
  onCancel,
  onSwitchToTopics,
}: {
  interests: string[]
  onMatchFound: (conversationId: string) => void
  onCancel: () => void
  onSwitchToTopics: () => void
}) {
  const { user } = useAuth()
  const [seconds, setSeconds] = useState(0)
  const [status, setStatus] = useState<'waiting' | 'matched'>('waiting')
  const [sharedInterests, setSharedInterests] = useState<string[]>([])
  const matchedRef = useRef(false)
  const unsubscribeMatchRef = useRef<(() => void) | null>(null)
  const unsubscribeNotifRef = useRef<(() => void) | null>(null)

  const handleMatch = async (convId: string, shared: string[]) => {
    if (matchedRef.current) return
    matchedRef.current = true
    setSharedInterests(shared)
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
      await joinRandomQueue(user.uid, interests)
      unsubscribeMatchRef.current = listenForRandomMatch(
        user.uid, interests,
        async (partnerId, shared) => {
          if (matchedRef.current) return
          const convId = await createConversation(user.uid, partnerId, null, shared)
          await setDoc(doc(db, 'matchNotifications', partnerId), {
            conversationId: convId,
            sharedInterests: shared,
            timestamp: new Date(),
          })
          handleMatch(convId, shared)
        }
      )
      unsubscribeNotifRef.current = onSnapshot(
        doc(db, 'matchNotifications', user.uid),
        (snap) => {
          if (snap.exists() && !matchedRef.current) {
            handleMatch(snap.data().conversationId, snap.data().sharedInterests || [])
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
    if (seconds < 15) return 'Searching for a great match...'
    if (seconds < 40) return 'Expanding the search...'
    if (seconds < 60) return 'Good matches take time...'
    return 'Taking longer than usual...'
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

            <h2 className="text-2xl font-bold mb-2">Finding someone interesting...</h2>
            <p className="text-gray-500 text-sm mb-8">
              Matching you with someone who shares your interests
            </p>

            {/* Interests */}
            <div className="w-full bg-gray-900/80 border border-white/5 rounded-2xl p-4 mb-8">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider text-left">Matching on</p>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, i) => (
                  <motion.span
                    key={interest}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-medium"
                  >
                    {interest}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Status */}
            <motion.p
  key={statusText()}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="text-gray-400 text-sm mb-2"
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

            {/* Switch suggestion after 60s */}
            <AnimatePresence>
              {seconds >= 60 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full bg-gray-900 border border-white/5 rounded-2xl p-4 mb-6"
                >
                  <p className="text-sm text-gray-300 mb-3">
                    Not finding a match? Try Topic Mode instead.
                  </p>
                  <button
                    onClick={onSwitchToTopics}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl transition"
                  >
                    Switch to Topic Mode
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

           <button
  onClick={handleCancel}
  className="text-gray-400 hover:text-white text-sm font-medium transition px-5 py-2.5 rounded-lg border border-white/10 hover:border-white/20 hover:bg-gray-900"
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
            <h2 className="text-2xl font-bold mb-2">Found someone!</h2>
            {sharedInterests.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-3 mb-4">
                {sharedInterests.map(i => (
                  <span key={i} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs">
                    {i}
                  </span>
                ))}
              </div>
            )}
            <p className="text-gray-500 text-sm">Taking you to the conversation...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}