import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion, runTransaction, deleteField } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import type { User } from '../types'
import FriendChat from './FriendChat'
import { motion, AnimatePresence } from 'framer-motion'

const BADGE_INFO = {
  respectful: { emoji: '🤝', label: 'Respectful' },
  insightful: { emoji: '💡', label: 'Insightful' },
  funny: { emoji: '😄', label: 'Funny' },
  greatListener: { emoji: '👂', label: 'Great Listener' },
  knowledgeable: { emoji: '📚', label: 'Knowledgeable' },
}

function Avatar({ username, size = 80 }: { username: string; size?: number }) {
  return (
    <img
      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&eyes=happy,wink`}
      alt={username}
      width={size}
      height={size}
      className="rounded-full bg-gray-800"
    />
  )
}

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), ms)
    ),
  ])
}

export default function Profile({ onBack }: { onBack: () => void }) {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [friends, setFriends] = useState<User[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'profile' | 'friends' | 'requests'>('profile')
  const [activeChat, setActiveChat] = useState<{ id: string; username: string } | null>(null)

  // Username editing state
  const [editingUsername, setEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [savingUsername, setSavingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState('')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (!snap.exists()) return
      const data = snap.data() as User
      setProfile(data)

      if (data.friends?.length > 0) {
        const uniqueFriendIds = [...new Set(data.friends)]
        const friendDocs = await Promise.all(
          uniqueFriendIds.map(id => getDoc(doc(db, 'users', id)))
        )
        setFriends(friendDocs.filter(d => d.exists()).map(d => d.data() as User))
      }

      if (data.pendingFriendRequests?.length > 0) {
        const uniqueRequestIds = [...new Set(data.pendingFriendRequests)]
        const requests = await Promise.all(
          uniqueRequestIds.map(async (fromId: string) => {
            const fromSnap = await getDoc(doc(db, 'users', fromId))
            return fromSnap.exists() ? { id: fromId, ...fromSnap.data() } : null
          })
        )
        setPendingRequests(requests.filter(Boolean))
      }

      setLoading(false)
    }
    load()
  }, [user])

  // Debounced username availability check when editing
  useEffect(() => {
    if (!editingUsername) return
    const trimmed = newUsername.trim().toLowerCase()

    // If unchanged from current username, no need to check
    if (trimmed === profile?.username.toLowerCase()) {
      setUsernameAvailable(true)
      setCheckingUsername(false)
      return
    }

    if (trimmed.length < 3) {
      setUsernameAvailable(null)
      setCheckingUsername(false)
      return
    }

    setCheckingUsername(true)
    let cancelled = false
    const timeout = setTimeout(async () => {
      try {
        const snap = await withTimeout(
          getDoc(doc(db, 'usernames', trimmed)),
          8000,
          'TIMEOUT'
        )
        if (!cancelled) setUsernameAvailable(!snap.exists())
      } catch (e) {
        if (!cancelled) setUsernameAvailable(null)
      } finally {
        if (!cancelled) setCheckingUsername(false)
      }
    }, 500)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [newUsername, editingUsername, profile?.username])

  const startEditingUsername = () => {
    setNewUsername(profile?.username || '')
    setUsernameError('')
    setUsernameAvailable(null)
    setEditingUsername(true)
  }

  const cancelEditingUsername = () => {
    setEditingUsername(false)
    setNewUsername('')
    setUsernameError('')
    setUsernameAvailable(null)
  }

  const saveUsername = async () => {
    if (!user || !profile) return
    const trimmed = newUsername.trim()
    const newKey = trimmed.toLowerCase()
    const oldKey = profile.username.toLowerCase()

    if (!trimmed) { setUsernameError('Username cannot be empty'); return }
    if (trimmed.length < 3) { setUsernameError('Username must be at least 3 characters'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setUsernameError('Only letters, numbers, and underscores allowed'); return }

    // No actual change
    if (newKey === oldKey) {
      setEditingUsername(false)
      return
    }

    if (usernameAvailable === false) { setUsernameError('This username is already taken'); return }

    setSavingUsername(true)
    setUsernameError('')

    try {
      await withTimeout(
        runTransaction(db, async (transaction) => {
          const newUsernameRef = doc(db, 'usernames', newKey)
          const newUsernameSnap = await transaction.get(newUsernameRef)

          if (newUsernameSnap.exists()) {
            throw new Error('USERNAME_TAKEN')
          }

          // Claim new username, release old one, update profile
          transaction.set(newUsernameRef, { uid: user.uid, createdAt: new Date() })
          transaction.delete(doc(db, 'usernames', oldKey))
          transaction.update(doc(db, 'users', user.uid), { username: trimmed })
        }),
        10000,
        'TIMEOUT'
      )

      setProfile(prev => prev ? { ...prev, username: trimmed } : prev)
      setEditingUsername(false)
    } catch (err: any) {
      if (err.message === 'USERNAME_TAKEN') {
        setUsernameError('This username was just taken. Please choose another.')
        setUsernameAvailable(false)
      } else if (err.message === 'TIMEOUT') {
        setUsernameError('Taking too long — check your connection and try again.')
      } else {
        setUsernameError('Something went wrong. Please try again.')
      }
    } finally {
      setSavingUsername(false)
    }
  }

  const acceptFriend = async (fromId: string) => {
    if (!user || !profile) return
    if (profile.friends?.includes(fromId)) {
      setPendingRequests(prev => prev.filter(r => r.id !== fromId))
      return
    }
    await updateDoc(doc(db, 'users', user.uid), {
      friends: arrayUnion(fromId),
      pendingFriendRequests: arrayRemove(fromId),
    })
    const fromSnap = await getDoc(doc(db, 'users', fromId))
    if (fromSnap.exists()) {
      await updateDoc(doc(db, 'users', fromId), { friends: arrayUnion(user.uid) })
      if (!friends.find(f => f.id === fromId)) {
        setFriends(prev => [...prev, fromSnap.data() as User])
      }
    }
    setPendingRequests(prev => prev.filter(r => r.id !== fromId))
    setProfile(prev => prev ? {
      ...prev,
      friends: [...new Set([...(prev.friends || []), fromId])],
      pendingFriendRequests: prev.pendingFriendRequests.filter(id => id !== fromId)
    } : prev)
  }

  const declineFriend = async (fromId: string) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), { pendingFriendRequests: arrayRemove(fromId) })
    setPendingRequests(prev => prev.filter(r => r.id !== fromId))
  }

  const unfriend = async (friendId: string) => {
    if (!user) return
    await updateDoc(doc(db, 'users', user.uid), { friends: arrayRemove(friendId) })
    await updateDoc(doc(db, 'users', friendId), { friends: arrayRemove(user.uid) })
    setFriends(prev => prev.filter(f => f.id !== friendId))
  }

  if (activeChat) {
    return (
      <FriendChat
        friendId={activeChat.id}
        friendUsername={activeChat.username}
        onBack={() => setActiveChat(null)}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-3xl"
        >
          🎲
        </motion.div>
      </div>
    )
  }

  if (!profile) return null

  const totalBadges = Object.values(profile.badges || {}).reduce((a, b) => a + b, 0)

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
        <h1 className="font-bold text-lg">Profile</h1>
      </div>

      {/* Avatar + Info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col items-center pt-8 pb-6 px-6 border-b border-white/5"
      >
        <div className="relative mb-4">
          <Avatar username={profile.username} size={90} />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-950 flex items-center justify-center">
            <span className="text-xs">✓</span>
          </div>
        </div>

        {/* Username — editable */}
        <AnimatePresence mode="wait">
          {!editingUsername ? (
            <motion.div
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <h2 className="text-xl font-bold">{profile.username}</h2>
              <button
                onClick={startEditingUsername}
                className="text-gray-600 hover:text-indigo-400 transition text-sm"
                title="Edit username"
              >
                ✏️
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-xs"
            >
              <div className="relative">
                <input
                  type="text"
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  autoFocus
                  className={`w-full bg-gray-900 border rounded-xl px-4 py-2 pr-9 text-white text-center placeholder-gray-600 focus:outline-none transition text-sm ${
                    usernameAvailable === false
                      ? 'border-red-500/50 focus:border-red-500'
                      : usernameAvailable === true
                      ? 'border-green-500/50 focus:border-green-500'
                      : 'border-gray-800 focus:border-indigo-500'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername && (
                    <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-indigo-500 rounded-full animate-spin" />
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <span className="text-green-400 text-xs">✓</span>
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <span className="text-red-400 text-xs">✗</span>
                  )}
                </div>
              </div>
              {usernameError && (
                <p className="text-red-400 text-xs mt-1.5 text-center">{usernameError}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={cancelEditingUsername}
                  disabled={savingUsername}
                  className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveUsername}
                  disabled={savingUsername || checkingUsername}
                  className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  {savingUsername ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-gray-500 text-sm mt-1">{profile.country}</p>

        <div className="flex items-center gap-4 mt-4">
          <div className="text-center">
            <p className="text-lg font-bold text-indigo-400">{totalBadges}</p>
            <p className="text-xs text-gray-500">Badges</p>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-center">
            <p className="text-lg font-bold text-indigo-400">{friends.length}</p>
            <p className="text-xs text-gray-500">Friends</p>
          </div>
          <div className="w-px h-8 bg-gray-800" />
          <div className="text-center">
            <p className="text-lg font-bold text-indigo-400">{profile.interests.length}</p>
            <p className="text-xs text-gray-500">Interests</p>
          </div>
        </div>

        <div className="mt-4 px-4 py-1.5 bg-indigo-900/50 text-indigo-300 rounded-full text-sm font-medium border border-indigo-500/30">
          ⭐ {profile.favoriteInterest}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="relative z-10 flex border-b border-white/5">
        {(['profile', 'friends', 'requests'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition relative ${
              tab === t ? 'text-white' : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {t === 'requests'
              ? `Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`
              : t === 'friends'
              ? `Friends${friends.length > 0 ? ` (${friends.length})` : ''}`
              : 'Profile'}
            {tab === t && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6">

        {/* Profile Tab */}
        {tab === 'profile' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-6"
          >
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Badges earned</p>
              <div className="flex flex-col gap-2">
                {Object.entries(BADGE_INFO).map(([key, info], i) => {
                  const count = profile.badges?.[key as keyof typeof profile.badges] || 0
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition ${
                        count > 0
                          ? 'bg-gray-900/80 border-white/5'
                          : 'bg-gray-900/40 border-white/5 opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{info.emoji}</span>
                        <span className="text-sm font-medium">{info.label}</span>
                      </div>
                      {count > 0 ? (
                        <span className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full">
                          ×{count}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-700">Not yet</span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(interest => (
                  <span
                    key={interest}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                      interest === profile.favoriteInterest
                        ? 'bg-indigo-900/50 text-indigo-300 border-indigo-500/30'
                        : 'bg-gray-900/80 text-gray-400 border-white/5'
                    }`}
                  >
                    {interest === profile.favoriteInterest ? '⭐ ' : ''}{interest}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full py-3 rounded-xl border border-white/5 bg-gray-900/80 text-gray-500 hover:text-red-400 hover:border-red-900/50 transition text-sm mt-2"
            >
              Log out
            </button>
          </motion.div>
        )}

        {/* Friends Tab */}
        {tab === 'friends' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {friends.length === 0 ? (
              <div className="flex flex-col items-center text-center mt-12 gap-3">
                <div className="text-4xl">🤝</div>
                <p className="text-gray-500 text-sm">No friends yet</p>
                <p className="text-gray-700 text-xs max-w-xs">
                  Have a great conversation and add someone — they show up here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {friends.map((friend, i) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 bg-gray-900/80 border border-white/5 px-4 py-3 rounded-xl"
                  >
                    <Avatar username={friend.username} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{friend.username}</p>
                      <p className="text-gray-500 text-xs">{friend.country}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setActiveChat({ id: friend.id, username: friend.username })}
                        className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition font-medium"
                      >
                        Chat
                      </button>
                      <button
                        onClick={() => unfriend(friend.id)}
                        className="text-xs bg-gray-800 hover:bg-red-900/50 hover:text-red-400 text-gray-500 px-3 py-1.5 rounded-lg transition"
                      >
                        Unfriend
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center text-center mt-12 gap-3">
                <div className="text-4xl">📭</div>
                <p className="text-gray-500 text-sm">No pending requests</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingRequests.map((req, i) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-gray-900/80 border border-white/5 px-4 py-4 rounded-xl"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar username={req.username} size={44} />
                      <div>
                        <p className="font-medium text-sm">{req.username}</p>
                        <p className="text-gray-500 text-xs">{req.country}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriend(req.id)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 rounded-lg transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineFriend(req.id)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition"
                      >
                        Decline
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  )
}