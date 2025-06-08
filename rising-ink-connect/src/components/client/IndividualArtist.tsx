
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Instagram, MessageSquare, ExternalLink } from 'lucide-react';

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

interface IndividualArtistProps {
  artist: Artist | null;
  onSelectArtist: (artist: Artist) => void;
  onBack: () => void;
}

const IndividualArtist: React.FC<IndividualArtistProps> = ({ artist, onSelectArtist, onBack }) => {
  if (!artist) return null;

  return (
    <div className="min-h-screen bg-tattoo-dark">
      {/* Header */}
      <div className="bg-tattoo-gray border-b border-tattoo-primary">
        <div className="max-w-6xl mx-auto p-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-tattoo-primary hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Artist Discovery
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Artist Profile Section */}
        <Card className="mb-8 bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-tattoo-primary flex-shrink-0">
                <img
                  src={artist.profileImage}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center md:text-left flex-1">
                <CardTitle className="text-3xl text-white mb-2">{artist.name}</CardTitle>
                <CardDescription className="text-gray-300 text-lg mb-4 max-w-2xl">
                  {artist.bio}
                </CardDescription>
                
                {/* Social Media Links */}
                <div className="flex justify-center md:justify-start space-x-4 mb-4">
                  {artist.socialMedia.instagram && (
                    <a
                      href={`https://instagram.com/${artist.socialMedia.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-tattoo-primary hover:text-white transition-colors"
                    >
                      <Instagram className="w-5 h-5 mr-2" />
                      {artist.socialMedia.instagram}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => onSelectArtist(artist)}
                  className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                  size="lg"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Start Consultation
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Portfolio Gallery */}
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Portfolio Gallery</CardTitle>
            <CardDescription className="text-gray-300">
              Explore {artist.name}'s work and artistic style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artist.gallery.map((image, index) => (
                <div
                  key={index}
                  className="group aspect-square rounded-lg overflow-hidden border border-tattoo-primary/30 hover:border-tattoo-primary transition-colors cursor-pointer"
                >
                  <img
                    src={image}
                    alt={`Portfolio piece ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
            
            {/* Call to Action for Specific Artwork */}
            <div className="mt-8 text-center">
              <p className="text-gray-300 mb-4">
                Interested in a specific piece or style? Click on any artwork above and then:
              </p>
              <Button
                onClick={() => onSelectArtist(artist)}
                variant="outline"
                className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                Discuss This Artwork
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IndividualArtist;
