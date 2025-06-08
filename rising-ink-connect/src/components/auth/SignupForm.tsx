
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { CheckCircle, Mail, ExternalLink } from 'lucide-react'

interface SignupFormProps {
  title: string
  onSwitchToLogin?: () => void
}

const SignupForm: React.FC<SignupFormProps> = ({ title, onSwitchToLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Always assign 'client' role for frontend signups
      await signUp(email, password, fullName, 'client')
      setShowVerificationDialog(true)
      
      // Reset form
      setEmail('')
      setPassword('')
      setFullName('')
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setLoading(false)
    }
  }

  const handleEmailNavigation = () => {
    // Get email domain to suggest the appropriate email provider
    const emailDomain = email.split('@')[1]?.toLowerCase()
    let emailUrl = 'https://mail.google.com'
    
    if (emailDomain?.includes('outlook') || emailDomain?.includes('hotmail') || emailDomain?.includes('live')) {
      emailUrl = 'https://outlook.live.com'
    } else if (emailDomain?.includes('yahoo')) {
      emailUrl = 'https://mail.yahoo.com'
    } else if (emailDomain?.includes('icloud')) {
      emailUrl = 'https://www.icloud.com/mail'
    }
    
    window.open(emailUrl, '_blank')
  }

  return (
    <>
      <Card className="w-full max-w-md bg-tattoo-gray border-tattoo-primary">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">{title}</CardTitle>
          <p className="text-center text-gray-300 text-sm">
            Create your client account to book appointments
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-tattoo-dark border-gray-600 text-white"
              />
            </div>

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
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Client Account'}
            </Button>

            {onSwitchToLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-tattoo-primary hover:underline text-sm"
                >
                  Already have an account? Sign in
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Email Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="bg-tattoo-gray border-tattoo-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white flex items-center justify-center">
              <CheckCircle className="mr-2 text-tattoo-primary" />
              Account Created Successfully!
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-6 p-4">
            <Mail className="h-20 w-20 text-tattoo-primary mx-auto" />
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">
                Please verify your email
              </h3>
              <p className="text-gray-300">
                We've sent a verification email to:
              </p>
              <p className="text-white font-semibold text-lg bg-tattoo-dark p-2 rounded">
                {email}
              </p>
              <p className="text-gray-300 text-sm">
                Click the verification link in your email to activate your account and start booking appointments.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleEmailNavigation}
                className="w-full bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
              >
                <ExternalLink className="mr-2 w-4 h-4" />
                Open Email Account
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={() => setShowVerificationDialog(false)}
                  variant="outline"
                  className="flex-1 border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                >
                  Continue Later
                </Button>
                {onSwitchToLogin && (
                  <Button
                    onClick={() => {
                      setShowVerificationDialog(false)
                      onSwitchToLogin()
                    }}
                    variant="outline"
                    className="flex-1 border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                  >
                    Sign In Instead
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SignupForm
