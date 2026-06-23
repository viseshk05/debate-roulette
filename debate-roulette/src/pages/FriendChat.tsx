import { useEffect, useState, useRef } from 'react'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

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
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const chatId = getChatId(user?.uid || '', friendId)

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

      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-900">
        <button onClick={onBack} className="text-gray-500 hover:text-white transition">
          ←
        </button>
        <img
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(friendUsername)}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile,twinkle&eyes=happy,wink`}
          className="w-8 h-8 rounded-full bg-gray-800"
        />
        <div>
          <p className="font-semibold text-sm">{friendUsername}</p>
          <p className="text-gray-600 text-xs">Friend</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-700 text-sm mt-8">
            <p className="text-2xl mb-2">👋</p>
            <p>Start a conversation with {friendUsername}</p>
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                msg.senderId === user?.uid
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-100 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-4 border-t border-gray-900">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={`Message ${friendUsername}...`}
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || sending}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white px-4 py-3 rounded-xl transition text-sm font-medium"
        >
          Send
        </button>
      </div>

    </div>
  )
}