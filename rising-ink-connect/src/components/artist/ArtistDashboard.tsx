import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MessageSquare, User, Settings, Upload, Image } from 'lucide-react';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

type ArtistPortalView = 'dashboard' | 'scheduling' | 'messaging' | 'payments' | 'clients' | 'portfolio' | 'profile';

interface ArtistDashboardProps {
  artist: Artist;
  onNavigate: (view: ArtistPortalView) => void;
}

const ArtistDashboard: React.FC<ArtistDashboardProps> = ({ artist, onNavigate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todaysAppointments, setTodaysAppointments] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeClients: 0,
    artworkInProgress: 0,
    pendingConsultations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      const app = getApp();
      const db = getFirestore(app);
      // Get artist record
      const artistsRef = collection(db, 'artists');
      const artistQuery = query(artistsRef, where('profile_id', '==', user?.id));
      const artistSnapshot = await getDocs(artistQuery);
      if (artistSnapshot.empty) return;
      const artistId = artistSnapshot.docs[0].id;

      // Fetch today's appointments
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);
      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('artist_id', '==', artistId),
        where('appointment_date', '>=', todayStart.toISOString()),
        where('appointment_date', '<', todayEnd.toISOString()),
        orderBy('appointment_date', 'asc')
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      setTodaysAppointments(appointmentsSnapshot.docs.map(doc => {
        const apt = doc.data();
        return {
          id: doc.id,
          time: new Date(apt.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          client: apt.client_name || 'Unknown Client',
          type: apt.status === 'confirmed' ? 'Appointment' : 'Consultation'
        };
      }));

      // Fetch unread messages
      const messagesRef = collection(db, 'messages');
      const messagesQuery = query(
        messagesRef,
        where('recipient_id', '==', user?.id),
        where('read_at', '==', null),
        orderBy('created_at', 'desc')
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      setUnreadMessages(messagesSnapshot.docs.map(doc => {
        const msg = doc.data();
        return {
          id: doc.id,
          client: msg.sender_name || 'Unknown User',
          preview: (msg.content || '').substring(0, 50) + '...',
          time: msg.created_at ? new Date(msg.created_at).toLocaleString() : ''
        };
      }));

      // Fetch stats
      const allAppointmentsQuery = query(appointmentsRef, where('artist_id', '==', artistId));
      const allAppointmentsSnapshot = await getDocs(allAppointmentsQuery);
      const clientIds = new Set(allAppointmentsSnapshot.docs.map(doc => doc.data().client_id));
      const activeClients = clientIds.size;

      const artworkRef = collection(db, 'artwork');
      const artworkQuery = query(artworkRef, where('artist_id', '==', artistId));
      const artworkSnapshot = await getDocs(artworkQuery);
      const inProgressArtwork = artworkSnapshot.docs.filter(doc => doc.data().status === 'in_progress').length;

      const pendingAppointmentsQuery = query(appointmentsRef, where('artist_id', '==', artistId), where('status', '==', 'pending'));
      const pendingAppointmentsSnapshot = await getDocs(pendingAppointmentsQuery);
      setStats({
        activeClients,
        artworkInProgress: inProgressArtwork,
        pendingConsultations: pendingAppointmentsSnapshot.size
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tattoo-dark">
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {artist.name}</h1>
          <p className="text-gray-300">Manage your tattoo business from your dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Active Clients</p>
                  <p className="text-2xl font-bold text-white">{stats.activeClients}</p>
                </div>
                <User className="w-8 h-8 text-tattoo-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Artwork in Progress</p>
                  <p className="text-2xl font-bold text-white">{stats.artworkInProgress}</p>
                </div>
                <Image className="w-8 h-8 text-tattoo-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Pending Consultations</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingConsultations}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-tattoo-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Today's Appointments
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('scheduling')}
                  className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                >
                  View Calendar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysAppointments.length > 0 ? (
                  todaysAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-tattoo-dark rounded-lg">
                      <div>
                        <p className="text-white font-medium">{appointment.time}</p>
                        <p className="text-gray-300 text-sm">{appointment.client}</p>
                      </div>
                      <span className="text-tattoo-primary text-sm bg-tattoo-primary/10 px-2 py-1 rounded">
                        {appointment.type}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No appointments scheduled for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Recent Messages
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigate('messaging')}
                  className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unreadMessages.length > 0 ? (
                  unreadMessages.map((message) => (
                    <div key={message.id} className="p-3 bg-tattoo-dark rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium">{message.client}</p>
                        <span className="text-gray-400 text-xs">{message.time}</span>
                      </div>
                      <p className="text-gray-300 text-sm truncate">{message.preview}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No new messages</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8 bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Button 
                onClick={() => onNavigate('scheduling')}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex flex-col h-20 space-y-2"
              >
                <Calendar className="w-6 h-6" />
                <span className="text-sm">Schedule</span>
              </Button>

              <Button 
                onClick={() => onNavigate('messaging')}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex flex-col h-20 space-y-2"
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm">Messages</span>
              </Button>

              <Button 
                onClick={() => onNavigate('clients')}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex flex-col h-20 space-y-2"
              >
                <User className="w-6 h-6" />
                <span className="text-sm">Clients</span>
              </Button>

              <Button 
                onClick={() => onNavigate('portfolio')}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex flex-col h-20 space-y-2"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">Portfolio</span>
              </Button>

              <Button 
                onClick={() => onNavigate('payments')}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex flex-col h-20 space-y-2"
              >
                <Image className="w-6 h-6" />
                <span className="text-sm">Payments</span>
              </Button>

              <Button 
                onClick={() => onNavigate('profile')}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex flex-col h-20 space-y-2"
              >
                <Settings className="w-6 h-6" />
                <span className="text-sm">Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArtistDashboard;
