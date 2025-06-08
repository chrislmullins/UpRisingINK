import React, { useState, useEffect } from 'react';
import ClientDashboard from '@/components/client/ClientDashboard';
import ArtistDiscovery from '@/components/client/ArtistDiscovery';
import IndividualArtist from '@/components/client/IndividualArtist';
import MessagingInterface from '@/components/client/MessagingInterface';
import CalendarView from '@/components/client/CalendarView';
import ArtworkLog from '@/components/client/ArtworkLog';
import ClientProfileEditor from '@/components/client/ClientProfileEditor';
import AppHeader from '@/components/common/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

type ClientPortalView = 'dashboard' | 'artist-discovery' | 'artist-detail' | 'messaging' | 'calendar' | 'artwork-log' | 'profile';

interface Client {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  selectedArtistId?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  medicalConditions?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface Artist {
  id: string;
  name: string;
  bio: string;
  profileImage: string;
  socialMedia: {
    instagram?: string;
    twitter?: string;
  };
  gallery: string[];
}

const ClientPortal = () => {
  const [currentView, setCurrentView] = useState<ClientPortalView>('dashboard');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching client data for user:', user.id);

        // First, get the profile data
        const profileDoc = await getDoc(doc(db, 'profiles', user.id));

        if (!profileDoc.exists()) {
          console.error('Profile not found');
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const profileData = profileDoc.data();
        console.log('Profile data:', profileData);

        // Try to get existing client data with preferred artist
        const clientQuery = query(collection(db, 'clients'), where('profile_id', '==', user.id));
        const clientDocs = await getDocs(clientQuery);

        if (clientDocs.empty) {
          console.log('No client record found, creating one...');
          
          const newClientRef = doc(collection(db, 'clients'));
          await setDoc(newClientRef, {
            profile_id: user.id,
          });

          console.log('Created new client record:', newClientRef.id);
          
          const clientProfile: Client = {
            id: newClientRef.id,
            name: profileData.full_name || 'Unknown',
            email: profileData.email,
            profileImage: profileData.profile_image || '/placeholder.svg',
            selectedArtistId: null,
            phoneNumber: null,
            dateOfBirth: null,
            medicalConditions: null,
            allergies: null,
            emergencyContactName: null,
            emergencyContactPhone: null,
          };

          setClient(clientProfile);
          setCurrentView('dashboard'); // Always start with dashboard - it will show artist selection if needed
        } else {
          const clientData = clientDocs.docs[0].data();
          console.log('Found existing client data:', clientData);
          
          const clientProfile: Client = {
            id: clientDocs.docs[0].id,
            name: profileData.full_name || 'Unknown',
            email: profileData.email,
            profileImage: profileData.profile_image || '/placeholder.svg',
            selectedArtistId: clientData.preferred_artist_id,
            phoneNumber: clientData.phone_number,
            dateOfBirth: clientData.date_of_birth,
            medicalConditions: clientData.medical_conditions,
            allergies: clientData.allergies,
            emergencyContactName: clientData.emergency_contact_name,
            emergencyContactPhone: clientData.emergency_contact_phone,
          };

          setClient(clientProfile);
          setCurrentView('dashboard'); // Always start with dashboard

          console.log('Client has selected artist:', clientProfile.selectedArtistId);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [user, toast]);

  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    if (client) {
      setClient(prev => prev ? { ...prev, selectedArtistId: artist.id } : null);
    }
    setCurrentView('dashboard');
  };

  const handleViewArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setCurrentView('artist-detail');
  };

  const handleSaveProfile = async (updatedClient: Client) => {
    setClient(updatedClient);

    try {
      const clientDoc = doc(db, 'clients', updatedClient.id);
      await updateDoc(clientDoc, {
        phone_number: updatedClient.phoneNumber,
        date_of_birth: updatedClient.dateOfBirth,
        medical_conditions: updatedClient.medicalConditions,
        allergies: updatedClient.allergies,
        emergency_contact_name: updatedClient.emergencyContactName,
        emergency_contact_phone: updatedClient.emergencyContactPhone,
      });
    } catch (error) {
      console.error('Error updating client profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile changes",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-white">Error loading client profile</div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'artist-discovery':
        return (
          <ArtistDiscovery 
            onSelectArtist={handleSelectArtist}
            onViewArtist={handleViewArtist}
            onNavigate={setCurrentView}
          />
        );
      case 'artist-detail':
        return (
          <IndividualArtist 
            artist={selectedArtist}
            onSelectArtist={handleSelectArtist}
            onBack={() => setCurrentView('artist-discovery')}
          />
        );
      case 'messaging':
        return (
          <MessagingInterface 
            clientId={client.id}
            artistId={client.selectedArtistId}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            clientId={client.id}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'artwork-log':
        return (
          <ArtworkLog 
            clientId={client.id}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'profile':
        return (
          <ClientProfileEditor 
            client={client}
            onSave={handleSaveProfile}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      default:
        return (
          <ClientDashboard 
            client={client}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-tattoo-dark">
      <AppHeader />
      {renderCurrentView()}
    </div>
  );
};

export default ClientPortal;
