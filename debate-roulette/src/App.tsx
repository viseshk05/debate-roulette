import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './lib/firebase'
import { useAuth } from './hooks/useAuth'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'

function App() {
  const { user, loading } = useAuth()
  const [profileExists, setProfileExists] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) { setProfileExists(null); return }
    const check = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid))
      setProfileExists(snap.exists())
    }
    check()
  }, [user])

  if (loading || (user && profileExists === null)) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) return <Landing />
  if (!profileExists) return <Onboarding />

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome back 👋</h1>
        <p className="text-gray-400">{user.email}</p>
      </div>
    </div>
  )
}

export default App