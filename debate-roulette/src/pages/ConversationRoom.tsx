import { useEffect, useState, useRef } from 'react'
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import EmojiPicker from 'emoji-picker-react'
import { Theme } from 'emoji-picker-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TOPICS, SUGGESTIONS } from '../lib/topics'

type Message = {
  id: string
  senderId: string
  text: string
  timestamp: any
}

export default function ConversationRoom({
  conversationId,
  onEnd,
}: {
  conversationId: string
  onEnd: (partnerId: string, partnerUsername: string) => void
}) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [partnerUsername, setPartnerUsername] = useState('...')
  const [partnerAvatar, setPartnerAvatar] = useState('')
  const [topicId, setTopicId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [duration, setDuration] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const partnerUsernameRef = useRef('')
  const partnerIdRef = useRef('')
  const endedRef = useRef(false)
  const userIdRef = useRef<string>('')

  useEffect(() => {
    if (user?.uid) userIdRef.current = user.uid
  }, [user?.uid])

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setDuration(d => d + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const playPopSound = () => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext()
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)
      oscillator.frequency.setValueAtTime(800, ctx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.1)
    } catch (e) {}
  }

  useEffect(() => {
    if (!user?.uid) return
    userIdRef.current = user.uid
    const loadConversation = async () => {
      const snap = await getDoc(doc(db, 'conversations', conversationId))
      if (!snap.exists()) return
      const data = snap.data()
      setTopicId(data.topicId)
      const pid = data.participants.find((p: string) => p !== userIdRef.current)
      if (pid) {
        partnerIdRef.current = pid
        const partnerSnap = await getDoc(doc(db, 'users', pid))
        if (partnerSnap.exists()) {
          const username = partnerSnap.data().username
          setPartnerUsername(username)
          setPartnerAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&eyes=happy,wink`)
          partnerUsernameRef.current = username
        }
      }
    }
    loadConversation()
  }, [conversationId, user?.uid])

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'conversations', conversationId), async (snap) => {
      if (snap.exists() && snap.data().status === 'ended' && !endedRef.current) {
        endedRef.current = true
        const data = snap.data()
        const pid = data.participants.find((p: string) => p !== userIdRef.current)
        let username = partnerUsernameRef.current
        if (!username && pid) {
          const partnerSnap = await getDoc(doc(db, 'users', pid))
          if (partnerSnap.exists()) username = partnerSnap.data().username
        }
        onEnd(pid || partnerIdRef.current, username)
      }
    })
    return unsub
  }, [conversationId])

  useEffect(() => {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc')
    )
    let isFirst = true
    const unsub = onSnapshot(q, (snap) => {
      const newMessages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message))
      if (!isFirst) {
        const lastMsg = newMessages[newMessages.length - 1]
        if (lastMsg && lastMsg.senderId !== userIdRef.current) playPopSound()
      }
      isFirst = false
      setMessages(newMessages)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })
    return unsub
  }, [conversationId])

  const sendMessage = async () => {
    if (!text.trim() || !user || sending) return
    setSending(true)
    setShowEmoji(false)
    try {
      await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
        senderId: user.uid,
        text: text.trim(),
        timestamp: serverTimestamp(),
      })
      setText('')
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  const deleteMessage = async (messageId: string) => {
    await deleteDoc(doc(db, 'conversations', conversationId, 'messages', messageId))
  }

  const handleEnd = async () => {
    await updateDoc(doc(db, 'conversations', conversationId), {
      status: 'ended',
      endedAt: serverTimestamp(),
    })
  }

  const topic = topicId ? TOPICS[topicId] : null
  const suggestions = topicId ? SUGGESTIONS[topicId] : []

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-600 opacity-5 blur-3xl rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/5 backdrop-blur-sm bg-gray-950/80">
        <div className="flex items-center gap-3">
          {partnerAvatar && (
            <div className="relative">
              <img
                src={partnerAvatar}
                className="w-9 h-9 rounded-full bg-gray-800 border-2 border-indigo-500/50"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950" />
            </div>
          )}
          <div>
            <div className="font-semibold text-sm">{partnerUsername}</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-green-400 text-xs">Connected · {formatDuration(duration)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {topic && (
            <div className="hidden sm:block max-w-xs">
              <p className="text-xs text-gray-500 truncate">{topic.title}</p>
            </div>
          )}
          <button
            onClick={() => setShowEndConfirm(true)}
            className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition"
          >
            End
          </button>
        </div>
      </div>

      {/* Topic banner */}
      {topic && (
        <div className="relative z-10 bg-indigo-950/50 border-b border-indigo-500/20 px-4 py-2.5 flex items-center gap-2">
          <span className="text-indigo-400 text-xs font-medium uppercase tracking-wider">Topic</span>
          <span className="text-white text-xs flex-1 truncate">{topic.title}</span>
        </div>
      )}

      {/* Messages */}
      <div
        className="relative z-10 flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2"
        onClick={() => setShowEmoji(false)}
      >
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center mt-16 gap-3"
          >
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-2xl">
              👋
            </div>
            <p className="text-gray-500 text-sm">You're connected with {partnerUsername}</p>
            <p className="text-gray-700 text-xs">Say hello to start the conversation</p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => {
            const isMe = msg.senderId === user?.uid
            const prevMsg = messages[i - 1]
            const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId)
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setHoveredMsg(msg.id)}
                onMouseLeave={() => setHoveredMsg(null)}
              >
                {/* Partner avatar */}
                {!isMe && (
                  <div className="w-6 flex-shrink-0">
                    {showAvatar && partnerAvatar && (
                      <img src={partnerAvatar} className="w-6 h-6 rounded-full bg-gray-800" />
                    )}
                  </div>
                )}

                {/* Delete button */}
                {isMe && hoveredMsg === msg.id && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => deleteMessage(msg.id)}
                    className="text-gray-700 hover:text-red-400 text-xs transition mb-1"
                  >
                    🗑️
                  </motion.button>
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/20'
                      : 'bg-gray-800/80 text-gray-100 rounded-bl-sm border border-white/5'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && messages.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative z-10 px-4 pb-2"
          >
            <p className="text-gray-600 text-xs mb-2 font-medium">💬 Conversation starters</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setText(s); inputRef.current?.focus() }}
                  className="whitespace-nowrap text-xs bg-gray-900 hover:bg-indigo-950 hover:text-indigo-300 hover:border-indigo-500/50 text-gray-400 px-3 py-2 rounded-xl transition border border-gray-800"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="relative z-10 px-4 pb-2">
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={(emojiData) => {
              setText(prev => prev + emojiData.emoji)
              inputRef.current?.focus()
            }}
            width="100%"
            height={320}
          />
        </div>
      )}

      {/* Input */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-gray-950/80 backdrop-blur-sm">
        <button
          onClick={() => setShowEmoji(prev => !prev)}
          className={`text-xl transition p-1.5 rounded-lg ${showEmoji ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-white'}`}
        >
          😊
        </button>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={`Message ${partnerUsername}...`}
          className="flex-1 bg-gray-900/80 border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-gray-900 transition text-sm"
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white px-4 py-2.5 rounded-xl transition text-sm font-semibold shadow-lg shadow-indigo-500/20"
        >
          Send
        </motion.button>
      </div>

      {/* End Confirmation Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-6"
            onClick={() => setShowEndConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-1">End conversation?</h3>
              <p className="text-gray-500 text-sm mb-6">
                You've been talking for {formatDuration(duration)}. Both users will be redirected.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition"
                >
                  Keep talking
                </button>
                <button
                  onClick={() => { setShowEndConfirm(false); handleEnd() }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition"
                >
                  End it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}