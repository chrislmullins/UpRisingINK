
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, List, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AppointmentBooking from '@/components/appointments/AppointmentBooking';
import AppointmentList from '@/components/appointments/AppointmentList';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';

interface AppointmentsPageProps {
  onBack: () => void;
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [showBooking, setShowBooking] = useState(false);
  const { user } = useAuth();

  const getUserRole = (): 'client' | 'artist' | 'admin' => {
    if (user?.role === 'owner' || user?.role === 'manager') return 'admin';
    if (user?.role === 'artist') return 'artist';
    return 'client';
  };

  const userRole = getUserRole();

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
              <h1 className="text-2xl font-bold text-white">Appointments</h1>
            </div>
            {userRole === 'client' && (
              <Button
                onClick={() => setShowBooking(!showBooking)}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {showBooking && userRole === 'client' && (
          <div className="mb-6">
            <AppointmentBooking 
              onBookingComplete={() => setShowBooking(false)}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-tattoo-gray">
            <TabsTrigger 
              value="list" 
              className="data-[state=active]:bg-tattoo-primary data-[state=active]:text-tattoo-dark"
            >
              <List className="w-4 h-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger 
              value="calendar"
              className="data-[state=active]:bg-tattoo-primary data-[state=active]:text-tattoo-dark"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <AppointmentList 
              userRole={userRole}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <AppointmentCalendar 
              userRole={userRole}
              onNewAppointment={userRole === 'client' ? () => setShowBooking(true) : undefined}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AppointmentsPage;
