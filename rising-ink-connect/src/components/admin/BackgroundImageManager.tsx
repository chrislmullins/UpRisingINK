
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload, Trash2, Eye } from 'lucide-react';

interface BackgroundImageManagerProps {
  onBack: () => void;
}

const BackgroundImageManager: React.FC<BackgroundImageManagerProps> = ({ onBack }) => {
  const [currentImage, setCurrentImage] = useState<string>('/placeholder.svg');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulate upload process
      const reader = new FileReader();
      reader.onload = (e) => {
        setCurrentImage(e.target?.result as string);
        localStorage.setItem('hero-background-image', e.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackgroundImage = () => {
    setCurrentImage('');
    localStorage.removeItem('hero-background-image');
  };

  const previewImage = () => {
    window.open('/', '_blank');
  };

  return (
    <div className="min-h-screen bg-tattoo-dark">
      {/* Header */}
      <div className="bg-tattoo-gray border-b border-tattoo-primary">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                onClick={onBack}
                variant="outline" 
                className="mb-4 border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-white">Background Image Management</h1>
              <p className="text-gray-300 mt-1">
                Manage the background image for the front page hero section.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Current Background Preview */}
        <Card className="bg-tattoo-gray border-tattoo-primary mb-6">
          <CardHeader>
            <CardTitle className="text-white">Current Background Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-tattoo-dark rounded-lg overflow-hidden mb-4">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt="Current background" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto mb-2" />
                    <p>No background image set (will show black background)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={previewImage}
                variant="outline"
                className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Front Page
              </Button>
              
              {currentImage && (
                <Button
                  onClick={removeBackgroundImage}
                  variant="outline"
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Image
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload New Image */}
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <CardTitle className="text-white">Upload New Background Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="background-upload" className="text-gray-300">
                  Choose Image File
                </Label>
                <Input
                  id="background-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="bg-tattoo-dark border-tattoo-primary text-white mt-2"
                />
              </div>
              
              <div className="text-sm text-gray-400">
                <p><strong>Recommended specifications:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Resolution: 1920x1080 or higher</li>
                  <li>Aspect ratio: 16:9 works best</li>
                  <li>File format: JPG, PNG, WebP</li>
                  <li>File size: Under 5MB for optimal loading</li>
                </ul>
              </div>

              {isUploading && (
                <div className="flex items-center text-tattoo-primary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tattoo-primary mr-2"></div>
                  Uploading image...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackgroundImageManager;
