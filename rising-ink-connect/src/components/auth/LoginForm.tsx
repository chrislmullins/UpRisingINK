
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

interface LoginFormProps {
  title: string
  onSwitchToSignup?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ title, onSwitchToSignup }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await signIn(email, password)
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-tattoo-gray border-tattoo-primary">
      <CardHeader>
        <CardTitle className="text-2xl text-center text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-tattoo-dark border-gray-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-tattoo-dark border-gray-600 text-white"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          {onSwitchToSignup && (
            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-tattoo-primary hover:underline text-sm"
              >
                Don't have an account? Sign up
              </button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

export default LoginForm
