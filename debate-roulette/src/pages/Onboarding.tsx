import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

const INTERESTS = {
  Sports: ['Cricket', 'Football', 'Formula 1', 'Basketball', 'Tennis'],
  Entertainment: ['Movies', 'Anime', 'TV Shows', 'Music', 'Podcasts'],
  Technology: ['AI', 'Programming', 'Cybersecurity', 'Gadgets'],
  Lifestyle: ['Fitness', 'Books', 'Travel', 'Cooking', 'Photography'],
  Gaming: ['PUBG', 'Minecraft', 'Valorant', 'FIFA', 'GTA'],
}

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Brazil', 'Japan', 'South Korea', 'Other'
]

export default function Onboarding() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [username, setUsername] = useState(user?.displayName?.split(' ')[0] || '')
  const [country, setCountry] = useState('')
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [favoriteInterest, setFavoriteInterest] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : prev.length < 10
        ? [...prev, interest]
        : prev
    )
    if (favoriteInterest === interest) setFavoriteInterest('')
  }

  const handleStep1 = () => {
    if (!username.trim()) { setError('Please enter a username'); return }
    if (username.trim().length < 3) { setError('Username must be at least 3 characters'); return }
    if (!country) { setError('Please select your country'); return }
    setError('')
    setStep(2)
  }

  const handleStep2 = () => {
    if (selectedInterests.length < 3) { setError('Please select at least 3 interests'); return }
    setError('')
    setStep(3)
  }

  const handleFinish = async () => {
    if (!favoriteInterest) { setError('Please pick your favorite interest'); return }
    setSaving(true)
    try {
      await setDoc(doc(db, 'users', user!.uid), {
        id: user!.uid,
        username: username.trim(),
        country,
        interests: selectedInterests,
        favoriteInterest,
        badges: { respectful: 0, insightful: 0, funny: 0, greatListener: 0, knowledgeable: 0 },
        friends: [],
        pendingFriendRequests: [],
        createdAt: new Date(),
        isOnline: true,
        lastSeen: new Date(),
      })
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-indigo-500' : 'bg-gray-800'}`} />
          ))}
        </div>

        {/* Step 1 — Username + Country */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-1">Let's set up your profile</h2>
            <p className="text-gray-500 text-sm mb-8">This is how others will see you.</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. cricket_fanatic"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Country</label>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleStep1}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition mt-2"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Pick Interests */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-1">What are you into?</h2>
            <p className="text-gray-500 text-sm mb-6">Pick at least 3. These power your matches.</p>

            <div className="flex flex-col gap-5 max-h-96 overflow-y-auto pr-1">
              {Object.entries(INTERESTS).map(([category, items]) => (
                <div key={category}>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                          selectedInterests.includes(interest)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-gray-600 text-xs mt-3">{selectedInterests.length} selected</p>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <button
              onClick={handleStep2}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition mt-4"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3 — Favorite Interest */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-1">What's your favorite?</h2>
            <p className="text-gray-500 text-sm mb-6">Pick the one thing you could talk about forever.</p>

            <div className="flex flex-wrap gap-2">
              {selectedInterests.map(interest => (
                <button
                  key={interest}
                  onClick={() => setFavoriteInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    favoriteInterest === interest
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition mt-6 disabled:opacity-50"
            >
              {saving ? 'Setting up your profile...' : "Let's go →"}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}