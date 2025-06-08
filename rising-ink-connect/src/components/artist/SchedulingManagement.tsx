
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Clock, User, Plus } from 'lucide-react';

interface Appointment {
  id: string;
  date: string;
  time: string;
  client: string;
  type: string;
  duration: string;
  status: 'confirmed' | 'pending' | 'completed';
}

interface SchedulingManagementProps {
  artistId: string;
  onBack: () => void;
}

const SchedulingManagement: React.FC<SchedulingManagementProps> = ({ artistId, onBack }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'availability'>('calendar');

  // Mock data
  const appointments: Appointment[] = [
    {
      id: '1',
      date: '2024-01-15',
      time: '10:00',
      client: 'John Doe',
      type: 'Consultation',
      duration: '1 hour',
      status: 'confirmed'
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '14:00',
      client: 'Jane Smith',
      type: 'Tattoo Session',
      duration: '3 hours',
      status: 'confirmed'
    }
  ];

  const workingHours = {
    monday: { start: '10:00', end: '18:00', available: true },
    tuesday: { start: '10:00', end: '18:00', available: true },
    wednesday: { start: '10:00', end: '18:00', available: true },
    thursday: { start: '10:00', end: '18:00', available: true },
    friday: { start: '10:00', end: '18:00', available: true },
    saturday: { start: '12:00', end: '16:00', available: true },
    sunday: { start: '12:00', end: '16:00', available: false }
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
  };

  const hasAppointmentOnDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.some(apt => apt.date === dateString);
  };

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
              <h1 className="text-2xl font-bold text-white">Scheduling & Availability</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={view === 'calendar' ? 'default' : 'outline'}
                onClick={() => setView('calendar')}
                className={view === 'calendar' ? 'bg-tattoo-primary text-tattoo-dark' : 'border-tattoo-primary text-tattoo-primary'}
              >
                Calendar
              </Button>
              <Button
                variant={view === 'availability' ? 'default' : 'outline'}
                onClick={() => setView('availability')}
                className={view === 'availability' ? 'bg-tattoo-primary text-tattoo-dark' : 'border-tattoo-primary text-tattoo-primary'}
              >
                Set Availability
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {view === 'calendar' ? (
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

            {/* Day View */}
            <Card className="bg-tattoo-gray border-tattoo-primary">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  {selectedDate ? selectedDate.toDateString() : 'Select a Date'}
                  <Button 
                    size="sm"
                    className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Appointment
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate && (
                  <div className="space-y-4">
                    {getAppointmentsForDate(selectedDate).length > 0 ? (
                      getAppointmentsForDate(selectedDate).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-4 rounded-lg border border-tattoo-primary/30 bg-tattoo-dark"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-white font-medium">{appointment.type}</h3>
                              <div className="space-y-1 text-sm text-gray-300 mt-2">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{appointment.time} ({appointment.duration})</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4" />
                                  <span>{appointment.client}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <span className="text-xs px-2 py-1 rounded bg-green-400/10 text-green-400">
                                {appointment.status.toUpperCase()}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400">No appointments scheduled for this date</p>
                        <Button
                          className="mt-4 bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Appointment
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Availability Settings */
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <CardTitle className="text-white">Set Working Hours & Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-4 bg-tattoo-dark rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-20">
                        <span className="text-white font-medium capitalize">{day}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={hours.available}
                          className="rounded border-tattoo-primary"
                        />
                        <span className="text-gray-300">Available</span>
                      </div>
                    </div>
                    {hours.available && (
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300 text-sm">From:</span>
                          <input 
                            type="time" 
                            value={hours.start}
                            className="bg-tattoo-gray border border-tattoo-primary rounded px-2 py-1 text-white text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300 text-sm">To:</span>
                          <input 
                            type="time" 
                            value={hours.end}
                            className="bg-tattoo-gray border border-tattoo-primary rounded px-2 py-1 text-white text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90">
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SchedulingManagement;
