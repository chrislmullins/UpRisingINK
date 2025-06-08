import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface CalendarAppointment {
  id: string;
  appointment_date: string;
  status: string;
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

interface AppointmentCalendarProps {
  userRole: 'client' | 'artist' | 'admin';
  onDateSelect?: (date: Date) => void;
  onNewAppointment?: () => void;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  userRole,
  onDateSelect,
  onNewAppointment
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, [currentMonth, userRole]);

  const fetchAppointments = async () => {
    try {
      const app = getApp();
      const db = getFirestore(app);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      let appointmentsQuery = collection(db, 'appointments');
      let q = query(
        appointmentsQuery,
        where('appointment_date', '>=', monthStart.toISOString()),
        where('appointment_date', '<=', monthEnd.toISOString()),
        orderBy('appointment_date')
      );
      if (userRole === 'client') {
        const clientsRef = collection(db, 'clients');
        const clientQuery = query(clientsRef, where('profile_id', '==', user?.id));
        const clientSnapshot = await getDocs(clientQuery);
        if (!clientSnapshot.empty) {
          const clientId = clientSnapshot.docs[0].id;
          q = query(
            appointmentsQuery,
            where('client_id', '==', clientId),
            where('appointment_date', '>=', monthStart.toISOString()),
            where('appointment_date', '<=', monthEnd.toISOString()),
            orderBy('appointment_date')
          );
        }
      } else if (userRole === 'artist') {
        const artistsRef = collection(db, 'artists');
        const artistQuery = query(artistsRef, where('profile_id', '==', user?.id));
        const artistSnapshot = await getDocs(artistQuery);
        if (!artistSnapshot.empty) {
          const artistId = artistSnapshot.docs[0].id;
          q = query(
            appointmentsQuery,
            where('artist_id', '==', artistId),
            where('appointment_date', '>=', monthStart.toISOString()),
            where('appointment_date', '<=', monthEnd.toISOString()),
            orderBy('appointment_date')
          );
        }
      }
      const snapshot = await getDocs(q);
      const appointmentsData = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setAppointments(appointmentsData as CalendarAppointment[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => 
      format(new Date(apt.appointment_date), 'yyyy-MM-dd') === dateString
    );
  };

  const hasAppointmentOnDate = (date: Date) => {
    return getAppointmentsForDate(date).length > 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && onDateSelect) {
      onDateSelect(date);
    }
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar */}
      <Card className="bg-tattoo-gray border-tattoo-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Calendar</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                className="text-tattoo-primary hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-white font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                className="text-tattoo-primary hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
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

      {/* Selected Date Details */}
      <Card className="bg-tattoo-gray border-tattoo-primary">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a Date'}
            </CardTitle>
            {onNewAppointment && (
              <Button
                size="sm"
                onClick={onNewAppointment}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : selectedDate && selectedDateAppointments.length > 0 ? (
            <div className="space-y-3">
              {selectedDateAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-3 rounded-lg border border-tattoo-primary/30 bg-tattoo-dark"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-medium">
                        {userRole === 'client' 
                          ? appointment.artists?.profiles.full_name
                          : appointment.clients?.profiles.full_name
                        }
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {format(new Date(appointment.appointment_date), 'h:mm a')}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(appointment.status)} text-white text-xs`}>
                      {appointment.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedDate ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No appointments scheduled for this date</p>
              {onNewAppointment && (
                <Button
                  className="mt-4 bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                  onClick={onNewAppointment}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Schedule Appointment
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Select a date to view appointments</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentCalendar;
