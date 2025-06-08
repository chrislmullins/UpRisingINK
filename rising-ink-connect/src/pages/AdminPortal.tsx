
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminDashboard from '@/components/admin/AdminDashboard';
import ArtistManagement from '@/components/admin/ArtistManagement';
import ClientManagement from '@/components/admin/ClientManagement';
import UserManagement from '@/components/admin/UserManagement';
import OwnerArtistHub from '@/components/admin/OwnerArtistHub';
import BackgroundImageManager from '@/components/admin/BackgroundImageManager';

type AdminPortalView = 'dashboard' | 'artists' | 'clients' | 'users' | 'my-artist-hub' | 'background-image';

const AdminPortal = () => {
  const [currentView, setCurrentView] = useState<AdminPortalView>('dashboard');
  const { user } = useAuth();

  const renderCurrentView = () => {
    if (!user) return null;

    switch (currentView) {
      case 'artists':
        return (
          <ArtistManagement 
            currentUser={{
              id: user.id,
              name: user.profile.full_name,
              email: user.email,
              role: user.role,
              profileImage: user.profile.profile_image || '/placeholder.svg'
            }}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'clients':
        return (
          <ClientManagement 
            currentUser={{
              id: user.id,
              name: user.profile.full_name,
              email: user.email,
              role: user.role,
              profileImage: user.profile.profile_image || '/placeholder.svg'
            }}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'users':
        return (
          <UserManagement 
            currentUser={{
              id: user.id,
              name: user.profile.full_name,
              email: user.email,
              role: user.role,
              profileImage: user.profile.profile_image || '/placeholder.svg'
            }}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'my-artist-hub':
        return (
          <OwnerArtistHub 
            currentUser={{
              id: user.id,
              name: user.profile.full_name,
              email: user.email,
              role: user.role,
              profileImage: user.profile.profile_image || '/placeholder.svg'
            }}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'background-image':
        return (
          <BackgroundImageManager 
            onBack={() => setCurrentView('dashboard')}
          />
        );
      default:
        return (
          <AdminDashboard 
            currentUser={{
              id: user.id,
              name: user.profile.full_name,
              email: user.email,
              role: user.role,
              profileImage: user.profile.profile_image || '/placeholder.svg'
            }}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  return (
    <ProtectedRoute requiredRoles={['owner', 'manager']}>
      <div className="min-h-screen bg-tattoo-dark">
        {renderCurrentView()}
      </div>
    </ProtectedRoute>
  );
};

export default AdminPortal;
