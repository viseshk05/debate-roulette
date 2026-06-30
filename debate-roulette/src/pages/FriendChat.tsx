import { useEffect, useState, useRef } from 'react'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker, { Theme } from 'emoji-picker-react'

type Message = {
  id: string
  senderId: string
  text: string
  timestamp: any
}

function getChatId(uid1: string, uid2: string) {
  return [uid1, uid2].sort().join('_')
}

export default function FriendChat({
  friendId,
  friendUsername,
  onBack,
}: {
  friendId: string
  friendUsername: string
  onBack: () => void
}) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const chatId = getChatId(user?.uid || '', friendId)
  const friendAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(friendUsername)}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&eyes=happy,wink`

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
    const q = query(
      collection(db, 'friendChats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    )
    let isFirst = true
    const unsub = onSnapshot(q, (snap) => {
      const newMessages = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message))
      if (!isFirst) {
        const lastMsg = newMessages[newMessages.length - 1]
        if (lastMsg && lastMsg.senderId !== user?.uid) playPopSound()
      }
      isFirst = false
      setMessages(newMessages)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    })
    return unsub
  }, [chatId])

  const sendMessage = async () => {
    if (!text.trim() || !user || sending) return
    setSending(true)
    try {
      await addDoc(collection(db, 'friendChats', chatId, 'messages'), {
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

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-indigo-600 opacity-5 blur-3xl rounded-full" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 border-b border-white/5 backdrop-blur-sm bg-gray-950/80">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition flex-shrink-0"
        >
          ←
        </button>
        <div className="relative">
          <img
            src={friendAvatar}
            className="w-9 h-9 rounded-full bg-gray-800 border-2 border-indigo-500/30"
          />
        </div>
        <div>
          <p className="font-semibold text-sm">{friendUsername}</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            <p className="text-indigo-400 text-xs">Friend</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-2">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center mt-16 gap-3"
          >
            <img src={friendAvatar} className="w-16 h-16 rounded-full bg-gray-800 border-2 border-indigo-500/20" />
            <p className="text-gray-400 text-sm font-medium">{friendUsername}</p>
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
              >
                {!isMe && (
                  <div className="w-6 flex-shrink-0">
                    {showAvatar && (
                      <img src={friendAvatar} className="w-6 h-6 rounded-full bg-gray-800" />
                    )}
                  </div>
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

      {/* Input */}
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
          placeholder={`Message ${friendUsername}...`}
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

    </div>
  )
}