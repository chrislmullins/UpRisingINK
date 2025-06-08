
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, LogIn } from 'lucide-react';

const AppHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleProfile = () => {
    // Navigate to appropriate portal based on role
    switch (user?.role) {
      case 'owner':
      case 'manager':
        navigate('/admin-portal');
        break;
      case 'artist':
        navigate('/artist-portal');
        break;
      case 'client':
        navigate('/client-portal');
        break;
      default:
        navigate('/');
    }
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <header className="bg-tattoo-gray border-b border-tattoo-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold gradient-text">UpRising.ink</h1>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                <span className="text-gray-300">Welcome, </span>
                <span className="font-semibold">{user.profile.full_name || user.email}</span>
                <span className="text-tattoo-primary ml-2 capitalize">({user.role})</span>
              </div>
              
              <Button
                onClick={handleProfile}
                variant="ghost"
                size="sm"
                className="text-white hover:text-tattoo-primary"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-white hover:text-red-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleLogin}
              variant="ghost"
              size="sm"
              className="text-white hover:text-tattoo-primary"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
