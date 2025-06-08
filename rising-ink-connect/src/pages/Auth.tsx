
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  // Redirect authenticated users to appropriate portal
  useEffect(() => {
    if (user && !loading) {
      switch (user.role) {
        case 'owner':
        case 'manager':
          navigate('/admin-portal')
          break
        case 'artist':
          navigate('/artist-portal')
          break
        case 'client':
          navigate('/client-portal')
          break
        default:
          navigate('/')
      }
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tattoo-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm 
            title="Sign In" 
            onSwitchToSignup={() => setIsLogin(false)}
          />
        ) : (
          <SignupForm 
            title="Create Account" 
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  )
}

export default Auth
