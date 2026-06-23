import { useEffect, useState } from 'react'
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import type { User } from '../types'
import FriendChat from './FriendChat'

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

export default function Profile({ onBack }: { onBack: () => void }) {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<User | null>(null)
  const [friends, setFriends] = useState<User[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'profile' | 'friends' | 'requests'>('profile')
  const [activeChat, setActiveChat] = useState<{ id: string; username: string } | null>(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (!snap.exists()) return
      const data = snap.data() as User
      setProfile(data)

      if (data.friends?.length > 0) {
        // Deduplicate friend IDs before fetching
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
      await updateDoc(doc(db, 'users', fromId), {
        friends: arrayUnion(user.uid),
      })
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
    await updateDoc(doc(db, 'users', user.uid), {
      pendingFriendRequests: arrayRemove(fromId),
    })
    setPendingRequests(prev => prev.filter(r => r.id !== fromId))
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
        <p className="text-gray-500">Loading profile...</p>
      </div>
    )
  }

  if (!profile) return null

  const totalBadges = Object.values(profile.badges || {}).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-900">
        <button onClick={onBack} className="text-gray-500 hover:text-white transition">
          ←
        </button>
        <h1 className="font-bold text-lg">Profile</h1>
      </div>

      {/* Avatar + Info */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-gray-900">
        <Avatar username={profile.username} size={90} />
        <h2 className="text-xl font-bold mt-4">{profile.username}</h2>
        <p className="text-gray-500 text-sm mt-1">{profile.country}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-indigo-400 text-sm font-medium">{totalBadges} badges earned</span>
        </div>
        <div className="mt-3 px-4 py-1.5 bg-indigo-900 text-indigo-300 rounded-full text-sm font-medium ring-1 ring-indigo-500">
          ⭐ {profile.favoriteInterest}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-900">
        {(['profile', 'friends', 'requests'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition ${
              tab === t
                ? 'text-white border-b-2 border-indigo-500'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {t === 'requests'
              ? `Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`
              : t === 'friends'
              ? `Friends${friends.length > 0 ? ` (${friends.length})` : ''}`
              : 'Profile'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Profile Tab */}
        {tab === 'profile' && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Badges</p>
              <div className="flex flex-col gap-2">
                {Object.entries(BADGE_INFO).map(([key, info]) => {
                  const count = profile.badges?.[key as keyof typeof profile.badges] || 0
                  return (
                    <div
                      key={key}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl bg-gray-900 ${count === 0 ? 'opacity-40' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{info.emoji}</span>
                        <span className="text-sm font-medium">{info.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${count > 0 ? 'text-indigo-400' : 'text-gray-700'}`}>
                        {count > 0 ? `×${count}` : '—'}
                      </span>
                    </div>
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
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      interest === profile.favoriteInterest
                        ? 'bg-indigo-900 text-indigo-300 ring-1 ring-indigo-500'
                        : 'bg-gray-900 text-gray-400'
                    }`}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full py-3 rounded-xl border border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-900 transition text-sm mt-2"
            >
              Log out
            </button>
          </div>
        )}

        {/* Friends Tab */}
        {tab === 'friends' && (
          <div>
            {friends.length === 0 ? (
              <div className="text-center text-gray-600 text-sm mt-8">
                <p className="text-3xl mb-3">🤝</p>
                <p>No friends yet.</p>
                <p className="mt-1">Have a great conversation and add someone!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {friends.map(friend => (
                  <button
                    key={friend.id}
                    onClick={() => setActiveChat({ id: friend.id, username: friend.username })}
                    className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 px-4 py-3 rounded-xl transition w-full text-left"
                  >
                    <Avatar username={friend.username} size={40} />
                    <div>
                      <p className="font-medium text-sm">{friend.username}</p>
                      <p className="text-gray-500 text-xs">{friend.country}</p>
                    </div>
                    <span className="ml-auto text-gray-600 text-xs">Chat →</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div>
            {pendingRequests.length === 0 ? (
              <div className="text-center text-gray-600 text-sm mt-8">
                <p className="text-3xl mb-3">📭</p>
                <p>No pending friend requests.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-gray-900 px-4 py-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar username={req.username} size={40} />
                      <div>
                        <p className="font-medium text-sm">{req.username}</p>
                        <p className="text-gray-500 text-xs">{req.country}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriend(req.id)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineFriend(req.id)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 rounded-lg transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}