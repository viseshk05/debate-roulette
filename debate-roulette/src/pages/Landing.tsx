import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'


type AuthMode = 'landing' | 'login' | 'signup'

export default function Landing() {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail } = useAuth()
  const [mode, setMode] = useState<AuthMode>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  console.log('loading state:', loading)

  const handleGoogle = async () => {
  setError('')
  setLoading(true)
  try {
    await signInWithGoogle()
  } catch (err: any) {
    console.log('Google error:', err)
    setError(err.code + ': ' + err.message)
  } finally {
    setLoading(false)
  }
}

  const handleEmailAuth = async () => {
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('Email already in use')
      else if (err.code === 'auth/user-not-found') setError('No account found with this email')
      else if (err.code === 'auth/wrong-password') setError('Incorrect password')
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'landing') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 text-5xl">🎲</div>
          <h1 className="text-4xl font-bold mb-3">Debate Roulette</h1>
          <p className="text-gray-400 text-lg mb-2 max-w-md">
            Have real conversations with real people about things that actually matter to you.
          </p>
          <p className="text-gray-600 text-sm mb-10 max-w-sm">
            No followers. No feeds. No likes. Just ideas.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
              Continue with Google
            </button>

            <button
              onClick={() => setMode('signup')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition"
            >
              Sign up with Email
            </button>

            <button
              onClick={() => setMode('login')}
              className="text-gray-400 hover:text-white py-3 px-6 rounded-xl transition text-sm"
            >
              Already have an account? Log in
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-8 py-8 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-400">Ideas</div>
            <div className="text-gray-500 text-xs">over appearances</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-400">Respect</div>
            <div className="text-gray-500 text-xs">over competition</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-400">Connection</div>
            <div className="text-gray-500 text-xs">over engagement</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <button
          onClick={() => setMode('landing')}
          className="text-gray-500 hover:text-white text-sm mb-8 flex items-center gap-2 transition"
        >
          ← Back
        </button>

        <h2 className="text-2xl font-bold mb-1">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {mode === 'signup' ? 'Start having meaningful conversations.' : 'Good to see you again.'}
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
            className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleEmailAuth}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 mt-1"
          >
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Log In'}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 px-6 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" />
            Continue with Google
          </button>

          <button
            onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            className="text-gray-500 hover:text-white text-sm text-center py-2 transition"
          >
            {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
