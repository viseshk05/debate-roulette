import { useEffect, useState, useRef } from 'react'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { joinRandomQueue, leaveQueue, listenForRandomMatch, createConversation } from '../lib/matchmaking'

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
        user.uid,
        interests,
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
            handleMatch(
              snap.data().conversationId,
              snap.data().sharedInterests || []
            )
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

  const showSwitchSuggestion = seconds >= 60 && status === 'waiting'

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 text-center">
      {status === 'waiting' ? (
        <>
          <div className="text-5xl mb-6 animate-pulse">🎲</div>
          <h2 className="text-2xl font-bold mb-2">Finding someone interesting...</h2>
          <p className="text-gray-500 mb-6 max-w-xs">
            Looking for someone who shares your interests
          </p>

          {/* User's interests */}
          <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-xs">
            {interests.map(i => (
              <span key={i} className="px-3 py-1 bg-gray-900 text-gray-400 rounded-full text-xs">
                {i}
              </span>
            ))}
          </div>

          <div className="text-gray-600 text-sm mb-2">
            {seconds < 15 && 'Searching for a great match...'}
            {seconds >= 15 && seconds < 40 && 'Expanding the search...'}
            {seconds >= 40 && seconds < 60 && 'Still looking — good matches take time...'}
            {seconds >= 60 && 'Taking longer than usual...'}
          </div>

          <div className="text-gray-700 text-xs mb-8">{seconds}s</div>

          {/* Switch to Topic Mode suggestion after 60s */}
          {showSwitchSuggestion && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 max-w-xs">
              <p className="text-sm text-gray-300 mb-3">
                Not finding a match? Topic Mode has more people waiting right now.
              </p>
              <button
                onClick={onSwitchToTopics}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl transition"
              >
                Switch to Topic Mode
              </button>
            </div>
          )}

          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-white text-sm transition"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <div className="text-5xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Found someone!</h2>
          {sharedInterests.length > 0 && (
            <p className="text-gray-400 text-sm mb-2">
              You both like: <span className="text-indigo-400 font-medium">{sharedInterests.join(', ')}</span>
            </p>
          )}
          <p className="text-gray-500 text-sm">Taking you to the conversation...</p>
        </>
      )}
    </div>
  )
}