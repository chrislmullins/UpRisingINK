
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare } from 'lucide-react';

const HeroSection = () => {
  const [backgroundImage, setBackgroundImage] = useState<string>('');

  useEffect(() => {
    // Load background image from localStorage (set by admin)
    const savedImage = localStorage.getItem('hero-background-image');
    if (savedImage) {
      setBackgroundImage(savedImage);
    }
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image or Gradient */}
      {backgroundImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
      ) : (
        <div className="absolute inset-0 tattoo-gradient">
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      )}
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-tattoo-primary rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-tattoo-primary rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-tattoo-primary rotate-45"></div>
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Welcome to{' '}
            <span className="gradient-text">UpRising.Ink</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Where Art Meets Skin. Professional tattoo artistry with a complete digital experience for artists and clients.
          </p>
          <p className="text-lg text-gray-400 mb-12">
            Uprising Ink Tattoo Studio L.L.C. - Powered by Multraverse.ai
          </p>
        </div>

        <div className="animate-slide-in flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 px-8 py-4 text-lg font-semibold"
          >
            <Calendar className="mr-2" size={20} />
            Book Your Session
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark px-8 py-4 text-lg"
          >
            <MessageSquare className="mr-2" size={20} />
            View Gallery
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
