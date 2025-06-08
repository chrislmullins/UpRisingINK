import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Artist {
  id: string;
  profile_id: string;
  bio: string;
  hourly_rate: number;
  profiles: {
    full_name: string;
  };
}

interface AppointmentBookingProps {
  selectedArtistId?: string;
  onBookingComplete?: () => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ 
  selectedArtistId, 
  onBookingComplete 
}) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>(selectedArtistId || '');
  const [appointmentDate, setAppointmentDate] = useState<Date>();
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [description, setDescription] = useState<string>('');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    if (selectedArtist && duration) {
      calculateEstimatedPrice();
    }
  }, [selectedArtist, duration]);

  const fetchArtists = async () => {
    try {
      const app = getApp();
      const db = getFirestore(app);
      const artistsRef = collection(db, 'artists');
      const q = query(artistsRef, where('is_available', '==', true));
      const snapshot = await getDocs(q);
      const artistsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          profile_id: data.profile_id,
          bio: data.bio,
          hourly_rate: data.hourly_rate,
          profiles: {
            full_name: data.full_name || data.profiles?.full_name || 'Unknown Artist',
          },
        };
      });
      setArtists(artistsData);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast({
        title: "Error",
        description: "Failed to load artists",
        variant: "destructive"
      });
    }
  };

  const calculateEstimatedPrice = () => {
    const artist = artists.find(a => a.id === selectedArtist);
    if (artist && artist.hourly_rate) {
      setEstimatedPrice(artist.hourly_rate * duration);
    }
  };

  const handleBookAppointment = async () => {
    if (!user || !selectedArtist || !appointmentDate || !appointmentTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const app = getApp();
      const db = getFirestore(app);
      // Get client ID
      const clientsRef = collection(db, 'clients');
      const clientQuery = query(clientsRef, where('profile_id', '==', user.id));
      const clientSnapshot = await getDocs(clientQuery);
      if (clientSnapshot.empty) throw new Error('Client not found');
      const clientId = clientSnapshot.docs[0].id;

      // Combine date and time
      const appointmentDateTime = new Date(appointmentDate);
      const [hours, minutes] = appointmentTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Add appointment to Firestore
      await addDoc(collection(db, 'appointments'), {
        client_id: clientId,
        artist_id: selectedArtist,
        appointment_date: appointmentDateTime.toISOString(),
        duration_hours: duration,
        description,
        estimated_price: estimatedPrice,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: "Appointment booked successfully!"
      });

      // Reset form
      setAppointmentDate(undefined);
      setAppointmentTime('');
      setDuration(1);
      setDescription('');
      setEstimatedPrice(0);
      if (onBookingComplete) {
        onBookingComplete();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to book appointment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  return (
    <Card className="bg-tattoo-gray border-tattoo-primary">
      <CardHeader>
        <CardTitle className="text-white">Book an Appointment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!selectedArtistId && (
          <div className="space-y-2">
            <Label htmlFor="artist" className="text-white">Select Artist</Label>
            <Select value={selectedArtist} onValueChange={setSelectedArtist}>
              <SelectTrigger className="bg-tattoo-dark border-tattoo-primary text-white">
                <SelectValue placeholder="Choose an artist" />
              </SelectTrigger>
              <SelectContent className="bg-tattoo-dark border-tattoo-primary">
                {artists.map((artist) => (
                  <SelectItem key={artist.id} value={artist.id} className="text-white">
                    {artist.profiles.full_name} - ${artist.hourly_rate}/hr
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-tattoo-dark border-tattoo-primary text-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {appointmentDate ? format(appointmentDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-tattoo-dark border-tattoo-primary">
                <Calendar
                  mode="single"
                  selected={appointmentDate}
                  onSelect={setAppointmentDate}
                  disabled={(date) => date < new Date()}
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Time</Label>
            <Select value={appointmentTime} onValueChange={setAppointmentTime}>
              <SelectTrigger className="bg-tattoo-dark border-tattoo-primary text-white">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="bg-tattoo-dark border-tattoo-primary">
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time} className="text-white">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration" className="text-white">Duration (hours)</Label>
          <Input
            id="duration"
            type="number"
            min="0.5"
            step="0.5"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
            className="bg-tattoo-dark border-tattoo-primary text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-white">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your tattoo idea, size, placement, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-tattoo-dark border-tattoo-primary text-white"
            rows={4}
          />
        </div>

        {estimatedPrice > 0 && (
          <div className="p-4 bg-tattoo-dark rounded-lg border border-tattoo-primary">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-tattoo-primary" />
              <span className="text-white font-medium">
                Estimated Price: ${estimatedPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Based on {duration} hour(s) at hourly rate
            </p>
          </div>
        )}

        <Button
          onClick={handleBookAppointment}
          disabled={loading || !selectedArtist || !appointmentDate || !appointmentTime}
          className="w-full bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AppointmentBooking;
