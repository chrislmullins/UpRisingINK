import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MessageSquare, Palette, Clock, ArrowRight, User, Settings, ChevronLeft, ChevronRight, Instagram } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, updateDoc, limit } from 'firebase/firestore';

type ClientPortalView = 'dashboard' | 'artist-discovery' | 'artist-detail' | 'messaging' | 'calendar' | 'artwork-log' | 'profile';

interface Client {
  id: string;
  name: string;
  email: string;
  selectedArtistId?: string;
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

interface ClientDashboardProps {
  client: Client;
  onNavigate: (view: ClientPortalView) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ client, onNavigate }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [currentArtistIndex, setCurrentArtistIndex] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [artworkInProgress, setArtworkInProgress] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [client.id, client.selectedArtistId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (!client.selectedArtistId) {
        // Fetch available artists
        const artistsQuery = query(collection(db, 'artists'), where('is_available', '==', true));
        const artistsSnap = await getDocs(artistsQuery);
        const formattedArtists = await Promise.all(artistsSnap.docs.map(async (artistDoc) => {
          const artistData = artistDoc.data();
          // Fetch profile for artist name and image
          let name = 'Unknown Artist';
          let profileImage = '/placeholder.svg';
          if (artistData.profile_id) {
            const profileSnap = await getDoc(doc(db, 'profiles', artistData.profile_id));
            if (profileSnap.exists()) {
              const profile = profileSnap.data();
              name = profile.full_name || name;
              profileImage = profile.profile_image || profileImage;
            }
          }
          return {
            id: artistDoc.id,
            name,
            bio: artistData.bio || 'Passionate tattoo artist dedicated to creating unique, meaningful artwork.',
            profileImage,
            socialMedia: { instagram: artistData.instagram_handle },
            gallery: artistData.portfolio_images?.length ? artistData.portfolio_images : ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg']
          };
        }));
        setArtists(formattedArtists);
      } else {
        // Fetch appointments for selected artist
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('client_id', '==', client.id),
          where('artist_id', '==', client.selectedArtistId),
          where('appointment_date', '>=', new Date().toISOString()),
          orderBy('appointment_date', 'asc'),
          limit(2)
        );
        const appointmentsSnap = await getDocs(appointmentsQuery);
        const formattedAppointments = await Promise.all(appointmentsSnap.docs.map(async (aptDoc) => {
          const apt = aptDoc.data();
          // Fetch artist name
          let artistName = '';
          if (apt.artist_id) {
            const artistSnap = await getDoc(doc(db, 'artists', apt.artist_id));
            if (artistSnap.exists()) {
              const artistData = artistSnap.data();
              if (artistData.profile_id) {
                const profileSnap = await getDoc(doc(db, 'profiles', artistData.profile_id));
                if (profileSnap.exists()) {
                  artistName = profileSnap.data().full_name;
                }
              }
            }
          }
          return {
            id: aptDoc.id,
            date: new Date(apt.appointment_date).toLocaleDateString(),
            time: new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: apt.description || 'Appointment',
            artist: artistName
          };
        }));
        setUpcomingAppointments(formattedAppointments);
        // Fetch artwork in progress
        const artworkQuery = query(
          collection(db, 'artwork'),
          where('client_id', '==', client.id),
          where('artist_id', '==', client.selectedArtistId),
          where('status', '!=', 'completed')
        );
        const artworkSnap = await getDocs(artworkQuery);
        const formattedArtwork = await Promise.all(artworkSnap.docs.map(async (artDoc) => {
          const art = artDoc.data();
          // Fetch artist name
          let artistName = '';
          if (art.artist_id) {
            const artistSnap = await getDoc(doc(db, 'artists', art.artist_id));
            if (artistSnap.exists()) {
              const artistData = artistSnap.data();
              if (artistData.profile_id) {
                const profileSnap = await getDoc(doc(db, 'profiles', artistData.profile_id));
                if (profileSnap.exists()) {
                  artistName = profileSnap.data().full_name;
                }
              }
            }
          }
          return {
            id: artDoc.id,
            name: art.title,
            status: art.status,
            artist: artistName,
            progress: art.status === 'in_progress' ? 50 : 25
          };
        }));
        setArtworkInProgress(formattedArtwork);
        // Fetch recent messages
        // Get artist profile_id
        const artistSnap = await getDoc(doc(db, 'artists', client.selectedArtistId));
        let artistProfileId = '';
        if (artistSnap.exists()) {
          artistProfileId = artistSnap.data().profile_id;
        }
        // Query messages between client and artist
        const messagesQuery = query(
          collection(db, 'messages'),
          where('sender_id', 'in', [artistProfileId, client.id]),
          where('recipient_id', 'in', [artistProfileId, client.id]),
          orderBy('created_at', 'desc'),
          limit(3)
        );
        const messagesSnap = await getDocs(messagesQuery);
        const formattedMessages = await Promise.all(messagesSnap.docs.map(async (msgDoc) => {
          const msg = msgDoc.data();
          // Fetch sender name
          let from = 'Unknown';
          if (msg.sender_id) {
            const profileSnap = await getDoc(doc(db, 'profiles', msg.sender_id));
            if (profileSnap.exists()) {
              from = profileSnap.data().full_name;
            }
          }
          return {
            id: msgDoc.id,
            from,
            preview: msg.content.length > 60 ? msg.content.substring(0, 60) + '...' : msg.content,
            time: new Date(msg.created_at).toLocaleDateString(),
            unread: !msg.read_at
          };
        }));
        setRecentMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArtist = async (artist: Artist) => {
    try {
      await updateDoc(doc(db, 'clients', client.id), { preferred_artist_id: artist.id });
      toast({
        title: 'Success',
        description: `You've selected ${artist.name} as your artist!`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error selecting artist:', error);
      toast({
        title: 'Error',
        description: 'Failed to select artist. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handlePrevious = () => {
    setCurrentArtistIndex((prev) => (prev > 0 ? prev - 1 : artists.length - 1));
  };

  const handleNext = () => {
    setCurrentArtistIndex((prev) => (prev < artists.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  // Show artist selection if no artist is selected
  if (!client.selectedArtistId) {
    return (
      <div className="min-h-screen bg-tattoo-dark">
        {/* Header */}
        <div className="bg-tattoo-gray border-b border-tattoo-primary">
          <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Welcome, {client.name}!</h1>
                <p className="text-gray-300 mt-1">Choose your artist to get started</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => onNavigate('profile')}
                  variant="outline"
                  size="sm"
                  className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Select Your Artist</h2>
            <p className="text-gray-300">Browse through our talented artists and choose the perfect match for your vision</p>
          </div>

          {artists.length > 0 ? (
            <div className="relative">
              {/* Navigation Arrows */}
              {artists.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-tattoo-dark border-tattoo-primary"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-tattoo-dark border-tattoo-primary"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Artist Card */}
              <Card className="mx-8 bg-tattoo-gray border-tattoo-primary">
                <CardHeader className="text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-tattoo-primary">
                    <img
                      src={artists[currentArtistIndex].profileImage}
                      alt={artists[currentArtistIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-2xl text-white">{artists[currentArtistIndex].name}</CardTitle>
                  <CardDescription className="text-gray-300 text-base max-w-md mx-auto">
                    {artists[currentArtistIndex].bio}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Gallery Preview */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Portfolio Preview</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {artists[currentArtistIndex].gallery.slice(0, 3).map((image, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Social Media */}
                  {artists[currentArtistIndex].socialMedia.instagram && (
                    <div className="mb-6 text-center">
                      <a
                        href={`https://instagram.com/${artists[currentArtistIndex].socialMedia.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-tattoo-primary hover:text-white transition-colors"
                      >
                        <Instagram className="w-4 h-4 mr-2" />
                        {artists[currentArtistIndex].socialMedia.instagram}
                      </a>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="text-center">
                    <Button
                      onClick={() => handleSelectArtist(artists[currentArtistIndex])}
                      className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                      size="lg"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Choose This Artist
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Artist Indicator */}
              {artists.length > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {artists.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentArtistIndex ? 'bg-tattoo-primary' : 'bg-gray-600'
                      }`}
                      onClick={() => setCurrentArtistIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-white">
              <p>No artists available at the moment. Please check back later.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show regular dashboard if artist is selected
  return (
    <div className="min-h-screen bg-tattoo-dark">
      {/* Header */}
      <div className="bg-tattoo-gray border-b border-tattoo-primary">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Welcome back, {client.name}</h1>
              <p className="text-gray-300 mt-1">Your tattoo journey continues here</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => onNavigate('profile')}
                variant="outline"
                size="sm"
                className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <div className="flex items-center space-x-2 text-tattoo-primary">
                <User className="w-5 h-5" />
                <span className="text-sm">Client Portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          
          {/* Appointments Card */}
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-tattoo-primary" />
                  <CardTitle className="text-white">Appointments</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('calendar')}
                  className="text-tattoo-primary hover:text-white"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="border-l-2 border-tattoo-primary pl-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">{appointment.type}</p>
                          <p className="text-gray-300 text-sm">{appointment.artist}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-tattoo-primary text-sm">{appointment.date}</p>
                          <p className="text-gray-400 text-xs">{appointment.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No upcoming appointments</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('calendar')}
                className="w-full mt-4 border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                View All Appointments
              </Button>
            </CardContent>
          </Card>

          {/* Artwork Status Card */}
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-tattoo-primary" />
                  <CardTitle className="text-white">Artwork Status</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('artwork-log')}
                  className="text-tattoo-primary hover:text-white"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {artworkInProgress.length > 0 ? (
                  artworkInProgress.map((artwork) => (
                    <div key={artwork.id}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium">{artwork.name}</p>
                          <p className="text-gray-300 text-sm">{artwork.status}</p>
                        </div>
                        <span className="text-tattoo-primary text-sm">{artwork.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-tattoo-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${artwork.progress}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No artwork in progress</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('artwork-log')}
                className="w-full mt-4 border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                View Artwork Log
              </Button>
            </CardContent>
          </Card>

          {/* Recent Messages Card */}
          <Card className="bg-tattoo-gray border-tattoo-primary lg:col-span-2 xl:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-tattoo-primary" />
                  <CardTitle className="text-white">Recent Messages</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('messaging')}
                  className="text-tattoo-primary hover:text-white"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMessages.length > 0 ? (
                  recentMessages.map((message) => (
                    <div key={message.id} className="border-l-2 border-tattoo-primary pl-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-white font-medium text-sm">{message.from}</p>
                            {message.unread && (
                              <div className="w-2 h-2 bg-tattoo-primary rounded-full" />
                            )}
                          </div>
                          <p className="text-gray-300 text-sm line-clamp-2">{message.preview}</p>
                        </div>
                        <span className="text-gray-400 text-xs flex-shrink-0 ml-2">
                          {message.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No recent messages</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('messaging')}
                className="w-full mt-4 border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                Open Messages
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              onClick={() => onNavigate('messaging')}
              className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 h-auto p-4"
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Send Message</div>
                <div className="text-sm opacity-80">Contact your artist</div>
              </div>
            </Button>
            
            <Button
              onClick={() => onNavigate('calendar')}
              variant="outline"
              className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark h-auto p-4"
            >
              <Calendar className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Schedule Appointment</div>
                <div className="text-sm opacity-80">Book your next session</div>
              </div>
            </Button>
            
            <Button
              onClick={() => onNavigate('artwork-log')}
              variant="outline"
              className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark h-auto p-4"
            >
              <Palette className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">View Artwork</div>
                <div className="text-sm opacity-80">Track your progress</div>
              </div>
            </Button>

            <Button
              onClick={() => onNavigate('profile')}
              variant="outline"
              className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark h-auto p-4"
            >
              <Settings className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Edit Profile</div>
                <div className="text-sm opacity-80">Update your information</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
