import React, { useState, useEffect } from 'react';
import AppHeader from '@/components/common/AppHeader';
import ArtistDashboard from '@/components/artist/ArtistDashboard';
import SchedulingManagement from '@/components/artist/SchedulingManagement';
import MessagingSystem from '@/components/artist/MessagingSystem';
import PaymentManagement from '@/components/artist/PaymentManagement';
import ClientManagement from '@/components/artist/ClientManagement';
import PortfolioManagement from '@/components/artist/PortfolioManagement';
import ProfileEditor from '@/components/artist/ProfileEditor';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

type ArtistPortalView = 'dashboard' | 'scheduling' | 'messaging' | 'payments' | 'clients' | 'portfolio' | 'profile';

interface Artist {
  id: string;
  name: string;
  email: string;
  bio: string;
  profileImage: string;
  specializations: string[];
  socialMedia: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  workingHours: {
    [key: string]: { start: string; end: string; available: boolean };
  };
}

const ArtistPortal = () => {
  const [currentView, setCurrentView] = useState<ArtistPortalView>('dashboard');
  const [actualArtistId, setActualArtistId] = useState<string>('1'); // Default fallback
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist>({
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@uprising.ink',
    bio: 'Professional tattoo artist specializing in traditional and neo-traditional styles with over 8 years of experience.',
    profileImage: '/placeholder.svg',
    specializations: ['Traditional', 'Neo-Traditional', 'Black & Gray'],
    socialMedia: {
      instagram: '@sarahchen_tattoo',
      website: 'www.sarahchentattoo.com'
    },
    workingHours: {
      monday: { start: '10:00', end: '18:00', available: true },
      tuesday: { start: '10:00', end: '18:00', available: true },
      wednesday: { start: '10:00', end: '18:00', available: true },
      thursday: { start: '10:00', end: '18:00', available: true },
      friday: { start: '10:00', end: '18:00', available: true },
      saturday: { start: '12:00', end: '16:00', available: true },
      sunday: { start: '12:00', end: '16:00', available: false }
    }
  });

  useEffect(() => {
    fetchActualArtistId();
  }, [user]);

  const fetchActualArtistId = async () => {
    if (!user?.id) return;

    try {
      // Firestore equivalent: find artist where profile_id == user.id
      const q = query(collection(db, 'artists'), where('profile_id', '==', user.id));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const artistDoc = querySnapshot.docs[0];
        setActualArtistId(artistDoc.id);
        console.log('Using actual artist ID:', artistDoc.id);
      } else {
        console.error('No artist found for profile_id:', user.id);
      }
    } catch (error) {
      console.error('Error in fetchActualArtistId:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'scheduling':
        return (
          <SchedulingManagement 
            artistId={actualArtistId}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'messaging':
        return (
          <MessagingSystem 
            artistId={actualArtistId}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'payments':
        return (
          <PaymentManagement 
            artistId={actualArtistId}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'clients':
        return (
          <ClientManagement 
            artistId={actualArtistId}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'portfolio':
        return (
          <PortfolioManagement 
            artistId={actualArtistId}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'profile':
        return (
          <ProfileEditor 
            artist={artist}
            onSave={setArtist}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      default:
        return (
          <ArtistDashboard 
            artist={artist}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  return (
    <ProtectedRoute requiredRoles={['artist']}>
      <div className="min-h-screen bg-tattoo-dark">
        <AppHeader />
        {renderCurrentView()}
      </div>
    </ProtectedRoute>
  );
};

export default ArtistPortal;
