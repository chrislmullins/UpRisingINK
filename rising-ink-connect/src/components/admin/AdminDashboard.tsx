import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, MessageSquare, Settings, TrendingUp } from 'lucide-react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface AdminDashboardProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage: string;
  };
  onNavigate: (view: 'dashboard' | 'artists' | 'clients' | 'users' | 'my-artist-hub' | 'background-image') => void;
}

interface StatsData {
  totalArtists: number;
  totalClients: number;
  upcomingAppointments: number;
  unreadMessages: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onNavigate }) => {
  const [stats, setStats] = useState<StatsData>({
    totalArtists: 0,
    totalClients: 0,
    upcomingAppointments: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total artists count
        const artistCount = (await getDocs(collection(db, 'artists'))).size;
        
        // Fetch total clients count
        const clientCount = (await getDocs(collection(db, 'clients'))).size;
        
        // Fetch upcoming appointments count (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const appointmentSnapshot = await getDocs(collection(db, 'appointments'));
        const appointmentCount = appointmentSnapshot.docs.filter(doc => {
          const data = doc.data();
          const appointmentDate = data.appointment_date.toDate();
          return appointmentDate >= new Date() && appointmentDate <= thirtyDaysFromNow && ['pending', 'confirmed'].includes(data.status);
        }).length;
        
        // Fetch unread messages count (messages without read_at)
        const messageSnapshot = await getDocs(collection(db, 'messages'));
        const messageCount = messageSnapshot.docs.filter(doc => !doc.data().read_at).length;
        
        setStats({
          totalArtists: artistCount || 0,
          totalClients: clientCount || 0,
          upcomingAppointments: appointmentCount || 0,
          unreadMessages: messageCount || 0,
        });
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <div className="text-center text-gray-300">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-300 flex items-center">
              <Users className="mr-2 text-tattoo-primary" />
              Artists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.totalArtists}</p>
            <p className="text-sm text-gray-400">Total artists</p>
          </CardContent>
        </Card>
        
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-300 flex items-center">
              <Users className="mr-2 text-tattoo-primary" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.totalClients}</p>
            <p className="text-sm text-gray-400">Registered clients</p>
          </CardContent>
        </Card>
        
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-300 flex items-center">
              <Calendar className="mr-2 text-tattoo-primary" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.upcomingAppointments}</p>
            <p className="text-sm text-gray-400">Upcoming appointments</p>
          </CardContent>
        </Card>
        
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-gray-300 flex items-center">
              <MessageSquare className="mr-2 text-tattoo-primary" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">{stats.unreadMessages}</p>
            <p className="text-sm text-gray-400">Unread messages</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <CardTitle className="text-xl text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => onNavigate('artists')}
              className="w-full bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex items-center justify-start"
            >
              <Users className="mr-2" />
              Manage Artists
            </Button>
            
            <Button 
              onClick={() => onNavigate('clients')}
              className="w-full bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex items-center justify-start"
            >
              <Users className="mr-2" />
              Manage Clients
            </Button>
            
            <Button 
              onClick={() => onNavigate('users')}
              className="w-full bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex items-center justify-start"
            >
              <Users className="mr-2" />
              Manage Users
            </Button>
            
            <Button 
              onClick={() => onNavigate('my-artist-hub')}
              className="w-full bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex items-center justify-start"
            >
              <Settings className="mr-2" />
              My Artist Hub
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <CardTitle className="text-xl text-white">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-tattoo-primary mx-auto" />
                <p className="text-gray-300 mt-4">Performance metrics visualization will appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
