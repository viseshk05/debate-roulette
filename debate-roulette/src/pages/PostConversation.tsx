import { useState } from 'react'
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

type BadgeType = 'respectful' | 'insightful' | 'funny' | 'greatListener' | 'knowledgeable'

const BADGES: { id: BadgeType; emoji: string; label: string }[] = [
  { id: 'respectful', emoji: '🤝', label: 'Respectful' },
  { id: 'insightful', emoji: '💡', label: 'Insightful' },
  { id: 'funny', emoji: '😄', label: 'Funny' },
  { id: 'greatListener', emoji: '👂', label: 'Great Listener' },
  { id: 'knowledgeable', emoji: '📚', label: 'Knowledgeable' },
]

export default function PostConversation({
  conversationId,
  partnerId,
  partnerUsername,
  onDone,
}: {
  conversationId: string
  partnerId: string
  partnerUsername: string
  onDone: () => void
}) {
  const { user } = useAuth()
  const [selectedBadges, setSelectedBadges] = useState<BadgeType[]>([])
  const [addFriend, setAddFriend] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const toggleBadge = (badge: BadgeType) => {
    setSelectedBadges(prev =>
      prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
    )
  }

  const handleSubmit = async () => {
    if (!user) return
    setSaving(true)
    try {
      // Save review
      await setDoc(doc(db, 'conversationReviews', `${conversationId}_${user.uid}`), {
        conversationId,
        reviewerId: user.uid,
        reviewedUserId: partnerId,
        badges: selectedBadges,
        addedFriend: addFriend,
        createdAt: new Date(),
      })

      // Add badges to partner's profile
      if (selectedBadges.length > 0) {
        const partnerRef = doc(db, 'users', partnerId)
        const partnerSnap = await getDoc(partnerRef)
        if (partnerSnap.exists()) {
          const currentBadges = partnerSnap.data().badges || {}
          const updatedBadges = { ...currentBadges }
          selectedBadges.forEach(badge => {
            updatedBadges[badge] = (updatedBadges[badge] || 0) + 1
          })
          await updateDoc(partnerRef, { badges: updatedBadges })
        }
      }

      // Send friend request if requested
      if (addFriend) {
        await setDoc(doc(db, 'friendRequests', `${user.uid}_${partnerId}`), {
          fromUserId: user.uid,
          toUserId: partnerId,
          conversationId,
          status: 'pending',
          createdAt: new Date(),
        })
        await updateDoc(doc(db, 'users', partnerId), {
          pendingFriendRequests: arrayUnion(user.uid),
        })
      }

      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">✨</div>
        <h2 className="text-2xl font-bold mb-2">Thanks for the conversation!</h2>
        <p className="text-gray-500 mb-2">
          {selectedBadges.length > 0 && `You gave ${partnerUsername} ${selectedBadges.length} badge${selectedBadges.length > 1 ? 's' : ''}.`}
        </p>
        {addFriend && (
          <p className="text-indigo-400 text-sm mb-6">
            Friend request sent to {partnerUsername} 🤝
          </p>
        )}
        <button
          onClick={onDone}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition mt-4"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-2xl font-bold mb-1">How was it?</h2>
          <p className="text-gray-500 text-sm">
            Your conversation with <span className="text-white font-medium">{partnerUsername}</span> has ended.
          </p>
        </div>

        {/* Badges */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3">Give {partnerUsername} a badge (optional)</p>
          <div className="flex flex-wrap gap-2">
            {BADGES.map(badge => (
              <button
                key={badge.id}
                onClick={() => toggleBadge(badge.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedBadges.includes(badge.id)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{badge.emoji}</span>
                <span>{badge.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Add Friend */}
        <button
          onClick={() => setAddFriend(prev => !prev)}
          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition mb-6 ${
            addFriend
              ? 'border-indigo-500 bg-indigo-950 text-white'
              : 'border-gray-800 bg-gray-900 text-gray-300 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🤝</span>
            <div className="text-left">
              <div className="font-medium text-sm">Add {partnerUsername} as a friend</div>
              <div className="text-xs text-gray-500">They'll need to accept before you can message</div>
            </div>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
            addFriend ? 'border-indigo-400 bg-indigo-500' : 'border-gray-600'
          }`}>
            {addFriend && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
        </button>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
          >
            {saving ? 'Saving...' : 'Submit'}
          </button>
          <button
            onClick={onDone}
            className="w-full text-gray-600 hover:text-white text-sm py-3 transition"
          >
            Skip
          </button>
        </div>

      </div>
    </div>
  )
}