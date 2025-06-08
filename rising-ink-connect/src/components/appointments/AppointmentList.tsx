import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, DollarSign, Edit, Trash2 } from 'lucide-react';
import { getFirestore, collection, query, where, getDocs, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface Appointment {
  id: string;
  appointment_date: string;
  duration_hours: number;
  status: AppointmentStatus;
  estimated_price: number;
  actual_price: number;
  deposit_amount: number;
  deposit_paid: boolean;
  description: string;
  notes: string;
  clients?: {
    profiles: {
      full_name: string;
    };
  };
  artists?: {
    profiles: {
      full_name: string;
    };
  };
}

interface AppointmentListProps {
  userRole: 'client' | 'artist' | 'admin';
  onEditAppointment?: (appointment: Appointment) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  userRole, 
  onEditAppointment 
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, [userRole]);

  const fetchAppointments = async () => {
    try {
      const app = getApp();
      const db = getFirestore(app);
      let appointmentsQuery = collection(db, 'appointments');
      let q = query(appointmentsQuery, orderBy('appointment_date', 'desc'));
      let filteredAppointments = [];

      if (userRole === 'client') {
        const clientsRef = collection(db, 'clients');
        const clientQuery = query(clientsRef, where('profile_id', '==', user?.id));
        const clientSnapshot = await getDocs(clientQuery);
        if (!clientSnapshot.empty) {
          const clientId = clientSnapshot.docs[0].id;
          q = query(appointmentsQuery, where('client_id', '==', clientId), orderBy('appointment_date', 'desc'));
        }
      } else if (userRole === 'artist') {
        const artistsRef = collection(db, 'artists');
        const artistQuery = query(artistsRef, where('profile_id', '==', user?.id));
        const artistSnapshot = await getDocs(artistQuery);
        if (!artistSnapshot.empty) {
          const artistId = artistSnapshot.docs[0].id;
          q = query(appointmentsQuery, where('artist_id', '==', artistId), orderBy('appointment_date', 'desc'));
        }
      }
      // Admin sees all appointments
      const snapshot = await getDocs(q);
      filteredAppointments = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setAppointments(filteredAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      const app = getApp();
      const db = getFirestore(app);
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { status: newStatus });
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus } : apt));
      toast({
        title: "Success",
        description: "Appointment status updated"
      });
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update appointment",
        variant: "destructive"
      });
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const app = getApp();
      const db = getFirestore(app);
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await deleteDoc(appointmentRef);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
      toast({
        title: "Success",
        description: "Appointment deleted"
      });
    } catch (error: any) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete appointment",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailableStatusUpdates = (currentStatus: AppointmentStatus): AppointmentStatus[] => {
    switch (currentStatus) {
      case 'pending':
        return userRole === 'artist' ? ['confirmed', 'cancelled'] : [];
      case 'confirmed':
        return userRole === 'artist' ? ['in_progress', 'cancelled'] : ['cancelled'];
      case 'in_progress':
        return userRole === 'artist' ? ['completed'] : [];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-white">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">
        {userRole === 'client' ? 'My Appointments' : 
         userRole === 'artist' ? 'Client Appointments' : 
         'All Appointments'}
      </h2>
      
      {appointments.length === 0 ? (
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">No appointments found</p>
          </CardContent>
        </Card>
      ) : (
        appointments.map((appointment) => (
          <Card key={appointment.id} className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white">
                  {userRole === 'client' 
                    ? `With ${appointment.artists?.profiles.full_name}`
                    : `${appointment.clients?.profiles.full_name}`
                  }
                </CardTitle>
                <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                  {appointment.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(appointment.appointment_date), 'PPP')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(appointment.appointment_date), 'p')} ({appointment.duration_hours}h)</span>
                  </div>
                  {userRole !== 'client' && (
                    <div className="flex items-center space-x-2 text-gray-300">
                      <User className="h-4 w-4" />
                      <span>{appointment.clients?.profiles.full_name}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <DollarSign className="h-4 w-4" />
                    <span>
                      Estimated: ${appointment.estimated_price || 0}
                      {appointment.actual_price && ` | Actual: $${appointment.actual_price}`}
                    </span>
                  </div>
                  {appointment.deposit_amount && (
                    <div className="text-sm text-gray-400">
                      Deposit: ${appointment.deposit_amount} 
                      {appointment.deposit_paid ? ' (Paid)' : ' (Pending)'}
                    </div>
                  )}
                </div>
              </div>

              {appointment.description && (
                <div className="p-3 bg-tattoo-dark rounded border border-tattoo-primary/30">
                  <p className="text-gray-300 text-sm">{appointment.description}</p>
                </div>
              )}

              {appointment.notes && (
                <div className="p-3 bg-blue-900/20 rounded border border-blue-500/30">
                  <p className="text-blue-300 text-sm">Notes: {appointment.notes}</p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {getAvailableStatusUpdates(appointment.status).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant="outline"
                    onClick={() => updateAppointmentStatus(appointment.id, status)}
                    className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                  >
                    Mark as {status.replace('_', ' ')}
                  </Button>
                ))}
                
                {onEditAppointment && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEditAppointment(appointment)}
                    className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                
                {(userRole === 'admin' || (userRole === 'client' && appointment.status === 'pending')) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteAppointment(appointment.id)}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AppointmentList;
