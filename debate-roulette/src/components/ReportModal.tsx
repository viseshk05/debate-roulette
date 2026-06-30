import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitReport, type ReportReason } from '../lib/moderation'
import { useAuth } from '../hooks/useAuth'

const REASONS: { id: ReportReason; label: string; emoji: string }[] = [
  { id: 'harassment', label: 'Harassment or bullying', emoji: '🚫' },
  { id: 'explicit', label: 'Explicit or inappropriate content', emoji: '⚠️' },
  { id: 'spam', label: 'Spam', emoji: '📢' },
  { id: 'hate_speech', label: 'Hate speech', emoji: '🛑' },
  { id: 'other', label: 'Other', emoji: '...' },
]

export default function ReportModal({
  reportedUserId,
  reportedUsername,
  conversationId,
  onClose,
}: {
  reportedUserId: string
  reportedUsername: string
  conversationId: string
  onClose: () => void
}) {
  const { user } = useAuth()
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!selectedReason || !user) return
    setSubmitting(true)
    try {
      await submitReport({
        reporterId: user.uid,
        reportedUserId,
        conversationId,
        reason: selectedReason,
        details,
      })
      setSubmitted(true)
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          {submitted ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="font-semibold mb-1">Report submitted</p>
              <p className="text-gray-500 text-sm">Thank you for helping keep this community safe.</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold mb-1">Report {reportedUsername}</h3>
              <p className="text-gray-500 text-sm mb-5">
                Your report is confidential. We review all reports.
              </p>

              <div className="flex flex-col gap-2 mb-4">
                {REASONS.map(reason => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(reason.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition text-left ${
                      selectedReason === reason.id
                        ? 'border-red-500/50 bg-red-950/30 text-white'
                        : 'border-white/5 bg-gray-800/50 text-gray-300 hover:border-white/10'
                    }`}
                  >
                    <span>{reason.emoji}</span>
                    <span className="text-sm font-medium">{reason.label}</span>
                  </button>
                ))}
              </div>

              {selectedReason === 'other' && (
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Tell us more..."
                  className="w-full bg-gray-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition mb-4 resize-none"
                  rows={3}
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedReason || submitting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-sm font-medium transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}