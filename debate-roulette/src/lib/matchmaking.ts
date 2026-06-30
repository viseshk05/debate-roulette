import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  addDoc,
  
} from 'firebase/firestore'
import { db } from './firebase'

export async function joinTopicQueue(
  userId: string,
  topicId: string,
  side: 'A' | 'B'
): Promise<string> {
  const queueRef = doc(db, 'matchQueue', userId)
  await setDoc(queueRef, {
    userId,
    mode: 'topic',
    topicId,
    side,
    status: 'waiting',
    joinedAt: serverTimestamp(),
  })
  return userId
}

export async function joinRandomQueue(
  userId: string,
  interests: string[]
): Promise<void> {
  const queueRef = doc(db, 'matchQueue', userId)
  await setDoc(queueRef, {
    userId,
    mode: 'random',
    interests,
    topicId: null,
    side: null,
    status: 'waiting',
    joinedAt: serverTimestamp(),
  })
}

export async function leaveQueue(userId: string) {
  await deleteDoc(doc(db, 'matchQueue', userId))
}

export async function createConversation(
  userId: string,
  partnerId: string,
  topicId: string | null,
  sharedInterests: string[]
): Promise<string> {
  const convRef = await addDoc(collection(db, 'conversations'), {
    participants: [userId, partnerId],
    mode: topicId ? 'topic' : 'random',
    topicId: topicId || null,
    sharedInterests,
    status: 'active',
    startedAt: serverTimestamp(),
    endedAt: null,
  })
  return convRef.id
}

export function listenForMatch(
  userId: string,
  userSide: 'A' | 'B',
  topicId: string,
  onMatch: (partnerId: string) => void
) {
  const oppositeSide = userSide === 'A' ? 'B' : 'A'

  const q = query(
    collection(db, 'matchQueue'),
    where('topicId', '==', topicId),
    where('side', '==', oppositeSide),
    where('status', '==', 'waiting')
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const validPartners = snapshot.docs.filter(d => {
      const data = d.data()
      return d.id !== userId && data.side === oppositeSide && data.userId !== userId
    })

    if (validPartners.length > 0) {
      const partner = validPartners[0]
      const partnerId = partner.data().userId
      if (userId < partnerId) {
        onMatch(partnerId)
      }
    }
  })

  return unsubscribe
}

export function listenForRandomMatch(
  userId: string,
  userInterests: string[],
  onMatch: (partnerId: string, sharedInterests: string[]) => void
) {
  const q = query(
    collection(db, 'matchQueue'),
    where('mode', '==', 'random'),
    where('status', '==', 'waiting')
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const others = snapshot.docs.filter(d => d.id !== userId && d.data().userId !== userId)

    if (others.length === 0) return

    // Score each potential match by shared interests
    const scored = others.map(d => {
      const data = d.data()
      const theirInterests: string[] = data.interests || []
      const shared = userInterests.filter(i => theirInterests.includes(i))
      return { partnerId: data.userId, shared, score: shared.length }
    })

    // Only consider matches with at least 1 shared interest
    const validMatches = scored.filter(m => m.score > 0)

    if (validMatches.length === 0) return

    // Pick the best match
    const best = validMatches.sort((a, b) => b.score - a.score)[0]

    // Only lower userId creates the conversation
    if (userId < best.partnerId) {
      onMatch(best.partnerId, best.shared)
    }
  })

  return unsubscribe
}