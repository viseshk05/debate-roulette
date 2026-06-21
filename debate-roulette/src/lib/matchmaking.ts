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
  topicId: string,
  oppositeSide: 'A' | 'B',
  onMatch: (partnerId: string) => void
) {
  const q = query(
    collection(db, 'matchQueue'),
    where('topicId', '==', topicId),
    where('side', '==', oppositeSide),
    where('status', '==', 'waiting')
  )

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const others = snapshot.docs.filter(d => d.id !== userId)
    if (others.length > 0) {
      const partner = others[0]
      onMatch(partner.data().userId)
    }
  })

  return unsubscribe
}