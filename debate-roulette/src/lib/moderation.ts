import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

export type ReportReason = 'harassment' | 'explicit' | 'spam' | 'hate_speech' | 'other'

export async function submitReport({
  reporterId,
  reportedUserId,
  conversationId,
  reason,
  details,
}: {
  reporterId: string
  reportedUserId: string
  conversationId: string
  reason: ReportReason
  details?: string
}) {
  await addDoc(collection(db, 'reports'), {
    reporterId,
    reportedUserId,
    conversationId,
    reason,
    details: details || '',
    status: 'pending',
    createdAt: serverTimestamp(),
  })
}