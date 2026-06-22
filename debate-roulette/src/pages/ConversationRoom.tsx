import { useEffect, useState, useRef } from 'react'
import { collection, addDoc, onSnapshot, query, orderBy, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import EmojiPicker from 'emoji-picker-react'
import { Theme } from 'emoji-picker-react'

const TOPICS: Record<string, { title: string; sideA: string; sideB: string }> = {
  t1: { title: 'Virat Kohli vs Rohit Sharma', sideA: 'Virat Kohli', sideB: 'Rohit Sharma' },
  t2: { title: 'Messi vs Ronaldo', sideA: 'Messi', sideB: 'Ronaldo' },
  t3: { title: 'Android vs iPhone', sideA: 'Android', sideB: 'iPhone' },
  t4: { title: 'Marvel vs DC', sideA: 'Marvel', sideB: 'DC' },
  t5: { title: 'Interstellar vs Inception', sideA: 'Interstellar', sideB: 'Inception' },
  t6: { title: 'Nolan vs Scorsese', sideA: 'Nolan', sideB: 'Scorsese' },
  t7: { title: 'PC vs Console Gaming', sideA: 'PC', sideB: 'Console' },
  t8: { title: 'Football vs Cricket', sideA: 'Football', sideB: 'Cricket' },
  t9: { title: 'AI is good vs bad for humanity', sideA: 'Good', sideB: 'Bad' },
  t10: { title: 'Gym vs Calisthenics', sideA: 'Gym', sideB: 'Calisthenics' },
}

const SUGGESTIONS: Record<string, string[]> = {
  t1: ['Who has the better ODI record?', 'Who performs better under pressure?', 'Who would you pick for a World Cup final?'],
  t2: ['Who has more natural talent?', 'Who elevated their team more?', 'Who had the better peak season?'],
  t3: ['Which has better privacy?', 'Which is better value for money?', 'Which ecosystem is more useful?'],
  t4: ['Which has better character development?', 'Which cinematic universe is more consistent?', 'Best standalone film from each?'],
  t5: ['Which had a better ending?', 'Which is more rewatchable?', 'Which had a bigger cultural impact?'],
  t6: ['Who has more artistic range?', 'Who has the better filmography?', 'Best film from each director?'],
  t7: ['Which has better exclusives?', 'Which is better for multiplayer?', 'Which offers more value long term?'],
  t8: ['Which requires more skill?', 'Which is more exciting to watch?', 'Which has a bigger global impact?'],
  t9: ['Will AI take more jobs than it creates?', 'Can AI be truly creative?', 'Should AI development be regulated?'],
  t10: ['Which builds more functional strength?', 'Which is more accessible?', 'Which is better for long term health?'],
}

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
  onEnd: () => void
}) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [partnerUsername, setPartnerUsername] = useState('...')
  const [topicId, setTopicId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const playPopSound = () => {
    const ctx = new AudioContext()
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
  }

  useEffect(() => {
    const loadConversation = async () => {
      const snap = await getDoc(doc(db, 'conversations', conversationId))
      if (!snap.exists()) return
      const data = snap.data()
      setTopicId(data.topicId)
      const partnerId = data.participants.find((p: string) => p !== user?.uid)
      if (partnerId) {
        const partnerSnap = await getDoc(doc(db, 'users', partnerId))
        if (partnerSnap.exists()) setPartnerUsername(partnerSnap.data().username)
      }
    }
    loadConversation()
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
        if (lastMsg && lastMsg.senderId !== user?.uid) {
          playPopSound()
        }
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
    onEnd()
  }

  const topic = topicId ? TOPICS[topicId] : null
  const suggestions = topicId ? SUGGESTIONS[topicId] : []

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-900">
        <div>
          <div className="font-bold">{topic?.title || 'Conversation'}</div>
          <div className="text-gray-500 text-xs mt-0.5">with {partnerUsername}</div>
        </div>
        <button
          onClick={handleEnd}
          className="text-red-500 hover:text-red-400 text-sm transition"
        >
          End
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
        onClick={() => setShowEmoji(false)}
      >
        {messages.length === 0 && (
          <div className="text-center text-gray-700 text-sm mt-8">
            You're connected! Say hello 👋
          </div>
        )}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => setHoveredMsg(msg.id)}
            onMouseLeave={() => setHoveredMsg(null)}
          >
            {msg.senderId === user?.uid && hoveredMsg === msg.id && (
              <button
                onClick={() => deleteMessage(msg.id)}
                className="text-gray-700 hover:text-red-400 text-xs transition mb-1"
                title="Delete message"
              >
                🗑️
              </button>
            )}
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

      {/* Suggestions */}
      {suggestions.length > 0 && messages.length < 3 && (
        <div className="px-4 pb-2">
          <p className="text-gray-600 text-xs mb-2">Conversation starters:</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setText(s); inputRef.current?.focus() }}
                className="whitespace-nowrap text-xs bg-gray-900 hover:bg-gray-800 text-gray-400 px-3 py-1.5 rounded-full transition border border-gray-800"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmoji && (
        <div className="px-4 pb-2">
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={(emojiData) => {
              setText(prev => prev + emojiData.emoji)
              inputRef.current?.focus()
            }}
            width="100%"
            height={350}
          />
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-4 border-t border-gray-900">
        <button
          onClick={() => setShowEmoji(prev => !prev)}
          className="text-gray-500 hover:text-white text-xl transition"
        >
          😊
        </button>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
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