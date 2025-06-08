import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Artwork {
  id: string;
  title: string;
  image_url: string;
  style_tags: string[];
  artist_name: string;
}

const GallerySection = () => {
  // Use only placeholder artwork for now
  const placeholderArtwork: Artwork[] = [
    {
      id: 'placeholder-1',
      title: 'Dragon Sleeve',
      image_url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=600&h=600&fit=crop',
      style_tags: ['Traditional', 'Japanese'],
      artist_name: 'Sample Artist'
    },
    {
      id: 'placeholder-2',
      title: 'Geometric Wolf',
      image_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&h=600&fit=crop',
      style_tags: ['Geometric', 'Modern'],
      artist_name: 'Sample Artist'
    },
    {
      id: 'placeholder-3',
      title: 'Rose Portrait',
      image_url: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=600&h=600&fit=crop',
      style_tags: ['Black & Gray', 'Realism'],
      artist_name: 'Sample Artist'
    },
    {
      id: 'placeholder-4',
      title: 'Neo-Traditional Eagle',
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=600&fit=crop',
      style_tags: ['Neo-Traditional', 'Color'],
      artist_name: 'Sample Artist'
    },
    {
      id: 'placeholder-5',
      title: 'Minimalist Design',
      image_url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&h=600&fit=crop',
      style_tags: ['Minimalist', 'Line Work'],
      artist_name: 'Sample Artist'
    },
    {
      id: 'placeholder-6',
      title: 'Watercolor Butterfly',
      image_url: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=600&h=600&fit=crop',
      style_tags: ['Watercolor', 'Nature'],
      artist_name: 'Sample Artist'
    }
  ];

  const [galleryItems] = useState<Artwork[]>(placeholderArtwork);
  const [loading] = useState(false);
  const { toast } = useToast();

  // Prevent right-click context menu and other user actions
  const handleImageProtection = (e: React.MouseEvent | React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  if (loading) {
    return (
      <section id="gallery" className="py-20 bg-tattoo-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our <span className="gradient-text">Gallery</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Explore our collection of exceptional tattoo artistry. Each piece tells a unique story and showcases the incredible talent of our artists.
            </p>
          </div>
          <div className="text-center text-white">Loading gallery...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-tattoo-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Our <span className="gradient-text">Gallery</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Explore our collection of exceptional tattoo artistry. Each piece tells a unique story and showcases the incredible talent of our artists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {galleryItems.map((item) => (
            <Card key={item.id} className="bg-tattoo-gray border-tattoo-primary/20 hover:border-tattoo-primary/50 transition-all duration-300 group overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden relative select-none">
                  {/* Protected Image Container */}
                  <div 
                    className="w-full h-full relative protected-image-container"
                    onContextMenu={handleImageProtection}
                    onDragStart={handleImageProtection}
                    onMouseDown={handleImageProtection}
                  >
                    {/* Base Image */}
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      draggable={false}
                      onContextMenu={handleImageProtection}
                      onDragStart={handleImageProtection}
                    />
                    {/* Multiple Watermark Overlays for Enhanced Protection */}
                    <div className="absolute inset-0 pointer-events-none select-none">
                      {/* Main diagonal watermark */}
                      <div 
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          background: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 100px,
                            rgba(255, 255, 255, 0.1) 100px,
                            rgba(255, 255, 255, 0.1) 101px
                          )`
                        }}
                      >
                        <div 
                          className="text-white/30 font-bold text-2xl transform rotate-45 select-none"
                          style={{
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                          }}
                        >
                          © UpRising.Ink
                        </div>
                      </div>
                      {/* Corner watermarks */}
                      <div className="absolute top-2 left-2 text-white/20 text-xs font-medium select-none">
                        © UpRising.Ink
                      </div>
                      <div className="absolute top-2 right-2 text-white/20 text-xs font-medium select-none">
                        © UpRising.Ink
                      </div>
                      <div className="absolute bottom-2 left-2 text-white/20 text-xs font-medium select-none">
                        © UpRising.Ink
                      </div>
                      <div className="absolute bottom-2 right-2 text-white/20 text-xs font-medium select-none">
                        © UpRising.Ink
                      </div>
                      {/* Center watermark */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="text-white/15 font-bold text-lg select-none"
                          style={{
                            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                          }}
                        >
                          © UpRising.Ink
                        </div>
                      </div>
                    </div>
                    {/* Invisible overlay to prevent interaction */}
                    <div 
                      className="absolute inset-0 bg-transparent cursor-default"
                      onContextMenu={handleImageProtection}
                      onDragStart={handleImageProtection}
                      onMouseDown={handleImageProtection}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="text-gray-400 text-sm">by {item.artist_name}</p>
                    </div>
                  </div>
                  {item.style_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.style_tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-tattoo-primary/20 text-tattoo-primary px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.style_tags.length > 2 && (
                        <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                          +{item.style_tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 px-8 py-4"
          >
            View Full Gallery
          </Button>
        </div>
      </div>
      <style>{`
        @media print {
          .gallery-image {
            display: none !important;
          }
        }
        /* Enhanced protection styles */
        .protected-image-container,
        .protected-image-container * {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
        }
        img {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
          pointer-events: none !important;
        }
      `}</style>
    </section>
  );
};

export default GallerySection;
