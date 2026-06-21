export type Badge = {
  respectful: number
  insightful: number
  funny: number
  greatListener: number
  knowledgeable: number
}

export type User = {
  id: string
  username: string
  country: string
  interests: string[]
  favoriteInterest: string
  badges: Badge
  friends: string[]
  pendingFriendRequests: string[]
  createdAt: Date
  isOnline: boolean
  lastSeen: Date
}

export type MatchMode = 'random' | 'topic'

export type QueueEntry = {
  id: string
  userId: string
  mode: MatchMode
  interests: string[]
  topicId: string | null
  side: 'A' | 'B' | null
  status: 'waiting' | 'matched'
  joinedAt: Date
}

export type Topic = {
  id: string
  title: string
  sideA: string
  sideB: string
  category: string
  isActive: boolean
  matchCount: number
}

export type ConversationStatus = 'active' | 'ended'

export type Conversation = {
  id: string
  participants: string[]
  mode: MatchMode
  topicId: string | null
  sharedInterests: string[]
  status: ConversationStatus
  startedAt: Date
  endedAt: Date | null
}

export type Message = {
  id: string
  senderId: string
  text: string
  timestamp: Date
}

export type BadgeType = 'respectful' | 'insightful' | 'funny' | 'greatListener' | 'knowledgeable'

export type ConversationReview = {
  userId: string
  addedFriend: boolean
  badges: BadgeType[]
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined'

export type FriendRequest = {
  id: string
  fromUserId: string
  toUserId: string
  conversationId: string
  status: FriendRequestStatus
  createdAt: Date
}
