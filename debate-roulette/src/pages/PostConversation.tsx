import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { motion } from 'framer-motion'

type BadgeType = 'respectful' | 'insightful' | 'funny' | 'greatListener' | 'knowledgeable'

const BADGES: { id: BadgeType; emoji: string; label: string; desc: string }[] = [
  { id: 'respectful', emoji: '🤝', label: 'Respectful', desc: 'Kept it civil' },
  { id: 'insightful', emoji: '💡', label: 'Insightful', desc: 'Made me think' },
  { id: 'funny', emoji: '😄', label: 'Funny', desc: 'Had good humor' },
  { id: 'greatListener', emoji: '👂', label: 'Great Listener', desc: 'Actually listened' },
  { id: 'knowledgeable', emoji: '📚', label: 'Knowledgeable', desc: 'Knew their stuff' },
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
  const [alreadyFriends, setAlreadyFriends] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fetchedPartnerUsername, setFetchedPartnerUsername] = useState(partnerUsername)
  const [partnerAvatar, setPartnerAvatar] = useState('')

  useEffect(() => {
    if (!partnerId) return
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'users', partnerId))
      if (snap.exists()) {
        const username = snap.data().username
        setFetchedPartnerUsername(username)
        setPartnerAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&eyes=happy,wink`)
      }
    }
    fetch()
  }, [partnerId])

  useEffect(() => {
    if (!user) return
    const check = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) {
        const friends = snap.data().friends || []
        if (friends.includes(partnerId)) setAlreadyFriends(true)
      }
    }
    check()
  }, [user, partnerId])

  const toggleBadge = (badge: BadgeType) => {
    setSelectedBadges(prev =>
      prev.includes(badge) ? prev.filter(b => b !== badge) : [...prev, badge]
    )
  }

  const handleSubmit = async () => {
    if (!user) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'conversationReviews', `${conversationId}_${user.uid}`), {
        conversationId,
        reviewerId: user.uid,
        reviewedUserId: partnerId,
        badges: selectedBadges,
        addedFriend: addFriend,
        createdAt: new Date(),
      })

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

      if (addFriend && !alreadyFriends) {
        const userSnap = await getDoc(doc(db, 'users', user.uid))
        const userData = userSnap.data()
        if (!userData?.friends?.includes(partnerId)) {
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
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-indigo-600 opacity-5 blur-3xl rounded-full" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
            className="text-6xl mb-6"
          >
            ✨
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">That's a wrap!</h2>
          <p className="text-gray-500 text-sm mb-1">
            Great conversation with{' '}
            <span className="text-white font-medium">{fetchedPartnerUsername}</span>.
          </p>
          {selectedBadges.length > 0 && (
            <p className="text-indigo-400 text-sm mb-1">
              You gave {selectedBadges.length} badge{selectedBadges.length > 1 ? 's' : ''} 🏅
            </p>
          )}
          {addFriend && !alreadyFriends && (
            <p className="text-green-400 text-sm mb-6">
              Friend request sent 🤝
            </p>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onDone}
            className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition shadow-lg shadow-indigo-500/20"
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-indigo-600 opacity-5 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-sm mx-auto px-6 py-10">

          {/* Partner info */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center mb-8"
          >
            {partnerAvatar && (
              <img
                src={partnerAvatar}
                className="w-16 h-16 rounded-full bg-gray-800 border-2 border-indigo-500/30 mb-4"
              />
            )}
            <h2 className="text-2xl font-bold mb-1">How was it?</h2>
            <p className="text-gray-500 text-sm">
              Your conversation with{' '}
              <span className="text-white font-medium">{fetchedPartnerUsername}</span>{' '}
              has ended.
            </p>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
              Give a badge — optional
            </p>
            <div className="grid grid-cols-1 gap-2">
              {BADGES.map((badge, i) => (
                <motion.button
                  key={badge.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleBadge(badge.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left ${
                    selectedBadges.includes(badge.id)
                      ? 'bg-indigo-950 border-indigo-500/50 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-gray-900/80 border-white/5 text-gray-300 hover:border-white/10'
                  }`}
                >
                  <span className="text-xl">{badge.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{badge.label}</p>
                    <p className="text-xs text-gray-500">{badge.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 ${
                    selectedBadges.includes(badge.id)
                      ? 'border-indigo-400 bg-indigo-500'
                      : 'border-gray-700'
                  }`}>
                    {selectedBadges.includes(badge.id) && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Friend section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            {!alreadyFriends ? (
              <button
                onClick={() => setAddFriend(prev => !prev)}
                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition ${
                  addFriend
                    ? 'border-green-500/50 bg-green-950/30 text-white'
                    : 'border-white/5 bg-gray-900/80 text-gray-300 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🤝</span>
                  <div className="text-left">
                    <p className="font-medium text-sm">Add {fetchedPartnerUsername}</p>
                    <p className="text-xs text-gray-500">Send a friend request</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                  addFriend ? 'border-green-400 bg-green-500' : 'border-gray-700'
                }`}>
                  {addFriend && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ) : (
              <div className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border border-white/5 bg-gray-900/80">
                <span className="text-xl">✅</span>
                <div className="text-sm text-gray-400">
                  Already friends with {fetchedPartnerUsername}
                </div>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-indigo-500/20"
            >
              {saving ? 'Saving...' : 'Submit & Continue'}
            </motion.button>
            <button
              onClick={onDone}
              className="w-full text-gray-600 hover:text-gray-400 text-sm py-2.5 transition"
            >
              Skip for now
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}