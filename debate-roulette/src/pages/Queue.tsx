import { useEffect, useState, useRef } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { joinTopicQueue, leaveQueue, listenForMatch, createConversation } from '../lib/matchmaking'

const TOPICS: Record<string, { title: string; sideA: string; sideB: string }> = {
  t1: { title: 'Virat Kohli vs Rohit Sharma', sideA: 'Virat Kohli', sideB: 'Rohit Sharma' },
  t2: { title: 'Messi vs Ronaldo', sideA: 'Messi', sideB: 'Ronaldo' },
  t3: { title: 'Android vs iPhone', sideA: 'Android', sideB: 'iPhone' },
  t4: { title: 'Marvel vs DC', sideA: 'Marvel', sideB: 'DC' },
  t5: { title: 'Interstellar vs Inception', sideA: 'Interstellar', sideB: 'Inception' },
  t6: { title: 'Nolan vs Scorsese', sideA: 'Nolan', sideB: 'Scorsese' },
  t7: { title: 'PC vs Console Gaming', sideA: 'PC', sideB: 'Console' },
  t8: { title: 'Football vs Cricket', sideA: 'Football', sideB: 'Cricket' },
  t9: { title: 'AI is good vs bad for humanity', sideA: 'Good', sideB: 'Bad' },
  t10: { title: 'Gym vs Calisthenics', sideA: 'Gym', sideB: 'Calisthenics' },
}

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
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const topic = TOPICS[topicId]
  const mySide = side === 'A' ? topic.sideA : topic.sideB
  const oppositeSide = side === 'A' ? 'B' : 'A'

  useEffect(() => {
    if (!user) return

    const setup = async () => {
      await joinTopicQueue(user.uid, topicId, side)

      unsubscribeRef.current = listenForMatch(
        user.uid,
        topicId,
        oppositeSide,
        async (partnerId) => {
          if (status === 'matched') return
          setStatus('matched')

          unsubscribeRef.current?.()

          const convId = await createConversation(
            user.uid,
            partnerId,
            topicId,
            []
          )

          await Promise.all([
            leaveQueue(user.uid),
            leaveQueue(partnerId),
            setDoc(doc(db, 'matchNotifications', partnerId), {
              conversationId: convId,
              timestamp: new Date(),
            }),
          ])

          onMatchFound(convId)
        }
      )

      // Also listen for when SOMEONE ELSE matched us
      onSnapshot(doc(db, 'matchNotifications', user.uid), (snap) => {
        if (snap.exists() && status !== 'matched') {
          setStatus('matched')
          onMatchFound(snap.data().conversationId)
        }
      })
    }

    setup()

    const timer = setInterval(() => setSeconds(s => s + 1), 1000)

    return () => {
      clearInterval(timer)
      unsubscribeRef.current?.()
      if (status !== 'matched') leaveQueue(user!.uid)
    }
  }, [user])

  const handleCancel = async () => {
    unsubscribeRef.current?.()
    await leaveQueue(user!.uid)
    onCancel()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 text-center">

      {status === 'waiting' ? (
        <>
          <div className="text-5xl mb-6 animate-pulse">🎲</div>
          <h2 className="text-2xl font-bold mb-2">Finding your opponent...</h2>
          <p className="text-gray-500 mb-1">
            Topic: <span className="text-white">{topic.title}</span>
          </p>
          <p className="text-gray-500 mb-8">
            Your side: <span className="text-indigo-400 font-semibold">{mySide}</span>
          </p>

          <div className="text-gray-600 text-sm mb-8">
            {seconds < 10 && 'Looking for someone nearby...'}
            {seconds >= 10 && seconds < 30 && 'Searching a wider pool...'}
            {seconds >= 30 && 'Still looking — hang tight...'}
          </div>

          <div className="text-gray-700 text-xs mb-8">{seconds}s</div>

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
          <h2 className="text-2xl font-bold mb-2">Opponent found!</h2>
          <p className="text-gray-500">Taking you to the conversation...</p>
        </>
      )}

    </div>
  )
}