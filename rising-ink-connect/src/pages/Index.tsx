
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import GallerySection from "@/components/GallerySection";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

const Index = () => {
  return (
    <div className="min-h-screen bg-tattoo-dark">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <GallerySection />
      <BookingSection />
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
