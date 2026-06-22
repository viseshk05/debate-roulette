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

export async function leaveQueue(userId: string) {
  await deleteDoc(doc(db, 'matchQueue', userId))
}

export async function createConversation(
  userId: string,
  partnerId: string,
  topicId: string,
  sharedInterests: string[]
): Promise<string> {
  const convRef = await addDoc(collection(db, 'conversations'), {
    participants: [userId, partnerId],
    mode: 'topic',
    topicId,
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
    // Filter out ourselves and anyone on the same side
    const validPartners = snapshot.docs.filter(d => {
      const data = d.data()
      return d.id !== userId && data.side === oppositeSide && data.userId !== userId
    })

    if (validPartners.length > 0) {
      const partner = validPartners[0]
      const partnerId = partner.data().userId

      // Only lower userId creates the conversation to prevent race condition
      if (userId < partnerId) {
        onMatch(partnerId)
      }
    }
  })

  return unsubscribe
}