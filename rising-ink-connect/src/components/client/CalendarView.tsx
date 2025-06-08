import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Clock, User, MessageSquare } from 'lucide-react';
import { db } from '@/firebase';
import { collection, getDocs, getDoc, query, where, orderBy, doc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  artist: string;
  status: 'confirmed' | 'pending' | 'completed';
  duration: string;
}

interface CalendarViewProps {
  clientId: string;
  onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ clientId, onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);

  const fetchAppointments = async () => {
    try {
      // First get the client record from Firestore
      const clientsQuery = query(collection(db, 'clients'), where('profile_id', '==', user?.id));
      const clientsSnap = await getDocs(clientsQuery);
      if (clientsSnap.empty) return;
      const clientDoc = clientsSnap.docs[0];
      // Then fetch appointments for this client
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('client_id', '==', clientDoc.id),
        orderBy('appointment_date', 'asc')
      );
      const appointmentsSnap = await getDocs(appointmentsQuery);
      const formattedAppointments = await Promise.all(appointmentsSnap.docs.map(async (aptDoc) => {
        const apt = aptDoc.data();
        // Fetch artist name
        let artistName = 'Unknown Artist';
        if (apt.artist_id) {
          const artistSnap = await getDoc(doc(db, 'artists', apt.artist_id));
          if (artistSnap.exists()) {
            const artistData = artistSnap.data();
            if (artistData.profile_id) {
              const profileSnap = await getDoc(doc(db, 'profiles', artistData.profile_id));
              if (profileSnap.exists()) {
                artistName = (profileSnap.data() as { full_name?: string }).full_name || artistName;
              }
            }
          }
        }
        return {
          id: aptDoc.id,
          date: apt.appointment_date.toDate().toISOString().split('T')[0],
          time: apt.appointment_date.toDate().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          type: apt.description || 'Appointment',
          artist: artistName,
          status: apt.status as 'confirmed' | 'pending' | 'completed',
          duration: `${apt.duration_hours || 1} hour${apt.duration_hours !== 1 ? 's' : ''}`
        };
      }));
      setAppointments(formattedAppointments);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
  };

  const hasAppointmentOnDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.some(apt => apt.date === dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'completed': return 'text-gray-400';
      default: return 'text-white';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-400/10 border-green-400/30';
      case 'pending': return 'bg-yellow-400/10 border-yellow-400/30';
      case 'completed': return 'bg-gray-400/10 border-gray-400/30';
      default: return 'bg-gray-400/10 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-white">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tattoo-dark">
      {/* Header */}
      <div className="bg-tattoo-gray border-b border-tattoo-primary">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-tattoo-primary hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-white">Appointments & Calendar</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Calendar */}
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <CardTitle className="text-white">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-tattoo-primary/30 bg-tattoo-dark text-white"
                modifiers={{
                  hasAppointment: (date) => hasAppointmentOnDate(date)
                }}
                modifiersStyles={{
                  hasAppointment: {
                    backgroundColor: '#D4AF37',
                    color: '#0A0A0A',
                    fontWeight: 'bold'
                  }
                }}
              />
              <div className="mt-4 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-tattoo-primary rounded"></div>
                  <span>Days with appointments</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments for Selected Date */}
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <CardTitle className="text-white">
                {selectedDate ? selectedDate.toDateString() : 'Select a Date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate && (
                <div className="space-y-4">
                  {getAppointmentsForDate(selectedDate).length > 0 ? (
                    getAppointmentsForDate(selectedDate).map((appointment) => (
                      <div
                        key={appointment.id}
                        className={`p-4 rounded-lg border ${getStatusBg(appointment.status)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-white font-medium">{appointment.type}</h3>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(appointment.status)}`}>
                                {appointment.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-300">
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{appointment.time} ({appointment.duration})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>{appointment.artist}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Discuss
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No appointments scheduled for this date</p>
                      <Button
                        className="mt-4 bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                      >
                        Request Appointment
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Appointments List */}
        <Card className="mt-6 bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <CardTitle className="text-white">All Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-4 rounded-lg border ${getStatusBg(appointment.status)}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0">
                          <div className="min-w-0">
                            <h3 className="text-white font-medium">{appointment.type}</h3>
                            <p className="text-gray-300 text-sm">{appointment.artist}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0">
                            <div className="text-center sm:text-left">
                              <p className="text-tattoo-primary font-medium">{appointment.date}</p>
                              <p className="text-gray-300 text-sm">{appointment.time}</p>
                            </div>
                            <div className="text-center sm:text-left">
                              <p className="text-gray-300 text-sm">Duration</p>
                              <p className="text-white text-sm">{appointment.duration}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 md:gap-2">
                        <span className={`text-xs px-3 py-1 rounded text-center ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark w-full sm:w-auto"
                        >
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No appointments found</p>
                  <Button
                    className="mt-4 bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                  >
                    Book Your First Appointment
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
