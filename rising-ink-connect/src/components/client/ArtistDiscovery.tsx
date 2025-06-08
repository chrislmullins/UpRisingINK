import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Instagram, MessageSquare, Home, Calendar, Palette } from 'lucide-react';
import { db } from '@/firebase';
import { collection, getDocs, getDoc, query, where, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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

type ClientPortalView = 'dashboard' | 'artist-discovery' | 'artist-detail' | 'messaging' | 'calendar' | 'artwork-log';

interface ArtistDiscoveryProps {
  onSelectArtist: (artist: Artist) => void;
  onViewArtist: (artist: Artist) => void;
  onNavigate: (view: ClientPortalView) => void;
}

const ArtistDiscovery: React.FC<ArtistDiscoveryProps> = ({ onSelectArtist, onViewArtist, onNavigate }) => {
  const [currentArtistIndex, setCurrentArtistIndex] = useState(0);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      // Fetch available artists from Firestore
      const artistsQuery = query(collection(db, 'artists'), where('is_available', '==', true));
      const artistsSnap = await getDocs(artistsQuery);
      const formattedArtists = await Promise.all(artistsSnap.docs.map(async (artistDoc) => {
        const artistData = artistDoc.data();
        let name = 'Unknown Artist';
        let profileImage = '/placeholder.svg';
        if (artistData.profile_id) {
          const profileSnap = await getDoc(doc(db, 'profiles', artistData.profile_id));
          if (profileSnap.exists()) {
            const profile = profileSnap.data() as { full_name?: string; profile_image?: string };
            name = profile.full_name || name;
            profileImage = profile.profile_image || profileImage;
          }
        }
        return {
          id: artistDoc.id,
          name,
          bio: artistData.bio || 'No bio available',
          profileImage,
          socialMedia: {
            instagram: artistData.instagram_handle
          },
          gallery: artistData.portfolio_images || ['/placeholder.svg']
        };
      }));
      setArtists(formattedArtists);
    } catch (error: any) {
      console.error('Error fetching artists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load artists. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const currentArtist = artists[currentArtistIndex];

  const handlePrevious = () => {
    setCurrentArtistIndex((prev) => (prev > 0 ? prev - 1 : artists.length - 1));
  };

  const handleNext = () => {
    setCurrentArtistIndex((prev) => (prev < artists.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-white">Loading artists...</div>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div className="min-h-screen bg-tattoo-dark">
        <div className="max-w-4xl mx-auto p-4">
          {/* Navigation Bar */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => onNavigate('dashboard')}
                variant="outline"
                className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                onClick={() => onNavigate('calendar')}
                variant="outline"
                className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button
                onClick={() => onNavigate('artwork-log')}
                variant="outline"
                className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                <Palette className="w-4 h-4 mr-2" />
                Artwork Log
              </Button>
            </div>
          </div>

          {/* No Artists Message */}
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">No Artists Available</h2>
              <p className="mb-6">Please check back later for available artists.</p>
              <Button
                onClick={() => onNavigate('dashboard')}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tattoo-dark p-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Bar */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => onNavigate('dashboard')}
              variant="outline"
              className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => onNavigate('calendar')}
              variant="outline"
              className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
            <Button
              onClick={() => onNavigate('artwork-log')}
              variant="outline"
              className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
            >
              <Palette className="w-4 h-4 mr-2" />
              Artwork Log
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Discover Your Artist
          </h1>
          <p className="text-gray-300 text-lg">
            Browse through our talented artists and find the perfect match for your vision
          </p>
        </div>

        <div className="relative">
          {/* Navigation Arrows */}
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

          {/* Artist Card */}
          <Card className="mx-8 bg-tattoo-gray border-tattoo-primary">
            <CardHeader className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-tattoo-primary">
                <img
                  src={currentArtist.profileImage}
                  alt={currentArtist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardTitle className="text-2xl text-white">{currentArtist.name}</CardTitle>
              <CardDescription className="text-gray-300 text-base max-w-md mx-auto">
                {currentArtist.bio}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Gallery Preview */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Portfolio Preview</h3>
                <div className="grid grid-cols-3 gap-2">
                  {currentArtist.gallery.slice(0, 3).map((image, index) => (
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
              {currentArtist.socialMedia.instagram && (
                <div className="mb-6 text-center">
                  <a
                    href={`https://instagram.com/${currentArtist.socialMedia.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-tattoo-primary hover:text-white transition-colors"
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    {currentArtist.socialMedia.instagram}
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => onViewArtist(currentArtist)}
                  variant="outline"
                  className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                >
                  View Full Profile
                </Button>
                <Button
                  onClick={() => onSelectArtist(currentArtist)}
                  className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Choose This Artist
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Artist Indicator */}
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
        </div>
      </div>
    </div>
  );
};

export default ArtistDiscovery;
