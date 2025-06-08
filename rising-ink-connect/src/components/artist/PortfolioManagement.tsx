import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Edit, Upload, Image as ImageIcon, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";
import { doc, updateDoc, setDoc, getDoc, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';

interface PortfolioImage {
  id: string;
  title: string;
  description: string;
  style_tags: string[];
  completion_date: string;
  image_url: string;
  is_public: boolean;
  is_portfolio_piece: boolean;
}

interface PortfolioManagementProps {
  artistId: string;
  onBack: () => void;
}

const PortfolioManagement: React.FC<PortfolioManagementProps> = ({ artistId, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'upload'>('grid');
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actualArtistId, setActualArtistId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state for upload
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    style_tags: [] as string[],
    is_public: true,
    is_portfolio_piece: true
  });

  const styles = ['all', 'Traditional', 'Neo-Traditional', 'Black & Gray', 'Geometric', 'Realism', 'Watercolor', 'Minimalist'];

  useEffect(() => {
    fetchActualArtistId();
  }, [user]);

  useEffect(() => {
    if (actualArtistId) {
      fetchArtwork();
    }
  }, [actualArtistId]);

  const fetchActualArtistId = async () => {
    if (!user?.id) {
      console.log('No user found');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching artist profile for user:', user.id);
      
      const artistDoc = doc(db, 'artists', user.id);
      const artistSnap = await getDoc(artistDoc);

      if (!artistSnap.exists()) {
        console.error('Artist profile not found');
        toast({
          title: "Error",
          description: "Artist profile not found. Please contact support.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Found artist ID:', artistSnap.id);
      setActualArtistId(artistSnap.id);
    } catch (error: any) {
      console.error('Error in fetchActualArtistId:', error);
      setLoading(false);
    }
  };

  const fetchArtwork = async () => {
    if (!actualArtistId) return;

    try {
      setLoading(true);
      console.log('Fetching artwork for artist:', actualArtistId);
      
      const artworkQuery = query(
        collection(db, 'artworks'),
        where('artist_id', '==', actualArtistId),
        orderBy('created_at', 'desc')
      );
      const artworkSnap = await getDocs(artworkQuery);

      const formattedArtwork = artworkSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioImage[];

      setPortfolioImages(formattedArtwork);
      console.log('Portfolio images set:', formattedArtwork);
    } catch (error: any) {
      console.error('Error fetching artwork:', error);
      toast({
        title: "Error",
        description: `Failed to load portfolio: ${error.message}`,
        variant: "destructive"
      });
      setPortfolioImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!actualArtistId) {
      toast({
        title: "Error",
        description: "Artist profile not found",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to upload images",
          variant: "destructive"
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive"
        });
        return;
      }

      // Validate form fields
      if (!uploadForm.title.trim()) {
        toast({
          title: "Error",
          description: "Please enter a title for your artwork",
          variant: "destructive"
        });
        return;
      }

      console.log('Starting image compression...');
      
      // Compress image to save storage space
      const compressionOptions = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: file.type,
        initialQuality: 0.8
      };

      toast({
        title: "Processing",
        description: "Compressing image for optimal storage..."
      });

      const compressedFile = await imageCompression(file, compressionOptions);
      
      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');

      // Create unique filename
      const fileExt = file.type.split('/')[1] || 'jpg';
      const fileName = `${actualArtistId}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `artwork/${fileName}`;
      const firebaseStorageRef = storageRef(storage, `artwork-images/${filePath}`);
      try {
        await uploadBytes(firebaseStorageRef, compressedFile);
        const publicUrl = await getDownloadURL(firebaseStorageRef);

        // Save artwork to database
        const artworkData = {
          artist_id: actualArtistId,
          title: uploadForm.title.trim(),
          description: uploadForm.description.trim(),
          image_url: publicUrl,
          style_tags: uploadForm.style_tags.filter(tag => tag.trim()),
          is_public: uploadForm.is_public,
          is_portfolio_piece: uploadForm.is_portfolio_piece,
          status: 'completed' as const
        };

        console.log('Saving artwork data:', artworkData);

        const newArtworkRef = doc(collection(db, 'artworks'));
        await setDoc(newArtworkRef, { ...artworkData, imageUrl: publicUrl });

        toast({
          title: "Success",
          description: "Artwork uploaded successfully!"
        });

        // Reset form and refresh data
        setUploadForm({
          title: '',
          description: '',
          style_tags: [],
          is_public: true,
          is_portfolio_piece: true
        });
        
        if (event.target) {
          event.target.value = '';
        }
        
        setView('grid');
        await fetchArtwork();
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload Error",
          description: `Failed to upload image: ${uploadError.message}`,
          variant: "destructive"
        });
        return;
      }
    } catch (error: any) {
      console.error('Error uploading artwork:', error);
      toast({
        title: "Error",
        description: `Upload failed: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const filteredImages = portfolioImages.filter(image => {
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = selectedStyle === 'all' || image.style_tags.includes(selectedStyle);
    return matchesSearch && matchesStyle;
  });

  const toggleArtworkVisibility = async (artworkId: string, currentPublicStatus: boolean) => {
    try {
      const artworkDoc = doc(db, 'artworks', artworkId);
      await updateDoc(artworkDoc, { is_public: !currentPublicStatus });

      toast({
        title: "Success",
        description: `Artwork ${!currentPublicStatus ? 'made public' : 'made private'}`
      });

      fetchArtwork();
    } catch (error: any) {
      console.error('Error updating artwork:', error);
      toast({
        title: "Error",
        description: "Failed to update artwork visibility",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-white">Loading portfolio...</div>
      </div>
    );
  }

  if (!actualArtistId) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg mb-4">Artist profile not found</p>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tattoo-dark">
      {/* Header */}
      <div className="bg-tattoo-gray border-b border-tattoo-primary">
        <div className="max-w-7xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => {
                  if (view === 'upload') {
                    setView('grid');
                  } else {
                    onBack();
                  }
                }}
                className="text-tattoo-primary hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {view === 'upload' ? 'Back to Portfolio' : 'Back to Dashboard'}
              </Button>
              <h1 className="text-2xl font-bold text-white">
                {view === 'upload' ? 'Upload New Artwork' : 'Portfolio Management'}
              </h1>
            </div>
            {view === 'grid' && (
              <Button
                onClick={() => setView('upload')}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload New Artwork
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {view === 'grid' ? (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search artwork..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-tattoo-gray border-tattoo-primary text-white w-64"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {styles.map((style) => (
                  <Button
                    key={style}
                    variant={selectedStyle === style ? 'default' : 'outline'}
                    onClick={() => setSelectedStyle(style)}
                    size="sm"
                    className={selectedStyle === style ? 'bg-tattoo-primary text-tattoo-dark' : 'border-tattoo-primary text-tattoo-primary'}
                  >
                    {style === 'all' ? 'All Styles' : style}
                  </Button>
                ))}
              </div>
            </div>

            {/* Portfolio Grid */}
            {filteredImages.length === 0 ? (
              <div className="text-center text-gray-300 py-12">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg mb-2">No artwork found</p>
                <p className="mb-4">Upload your first piece to get started!</p>
                <Button
                  onClick={() => setView('upload')}
                  className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload New Artwork
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image) => (
                  <Card key={image.id} className="bg-tattoo-gray border-tattoo-primary hover:border-tattoo-primary/70 transition-colors overflow-hidden">
                    <div className="relative">
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={image.image_url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button
                          size="sm"
                          variant={image.is_public ? 'default' : 'outline'}
                          onClick={() => toggleArtworkVisibility(image.id, image.is_public)}
                          className={image.is_public 
                            ? 'bg-green-500 text-white hover:bg-green-600 h-8 px-2 text-xs'
                            : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white h-8 px-2 text-xs'
                          }
                        >
                          {image.is_public ? 'Public' : 'Private'}
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="text-white font-medium text-sm truncate">{image.title}</h3>
                        <p className="text-gray-300 text-xs line-clamp-2">{image.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {image.style_tags.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-tattoo-primary/20 text-tattoo-primary px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {image.style_tags.length > 2 && (
                            <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                              +{image.style_tags.length - 2} more
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-xs">{image.completion_date}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Stats */}
            <Card className="mt-8 bg-tattoo-gray border-tattoo-primary">
              <CardHeader>
                <CardTitle className="text-white">Portfolio Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-tattoo-primary">{portfolioImages.length}</p>
                    <p className="text-gray-300 text-sm">Total Artworks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{portfolioImages.filter(img => img.is_public).length}</p>
                    <p className="text-gray-300 text-sm">Public</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{portfolioImages.filter(img => !img.is_public).length}</p>
                    <p className="text-gray-300 text-sm">Private</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{portfolioImages.filter(img => img.is_portfolio_piece).length}</p>
                    <p className="text-gray-300 text-sm">Portfolio Pieces</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Upload Form */
          <Card className="bg-tattoo-gray border-tattoo-primary max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white">Upload New Artwork</CardTitle>
              <p className="text-gray-300 text-sm">Images will be automatically compressed to optimize storage</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form Fields First */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Title *
                  </label>
                  <Input
                    placeholder="Enter artwork title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="bg-tattoo-dark border-tattoo-primary text-white"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Style Tags
                  </label>
                  <select 
                    value={uploadForm.style_tags[0] || ''}
                    onChange={(e) => setUploadForm({...uploadForm, style_tags: e.target.value ? [e.target.value] : []})}
                    className="w-full bg-tattoo-dark border border-tattoo-primary rounded-md px-3 py-2 text-white"
                    disabled={uploading}
                  >
                    <option value="">Select primary style</option>
                    {styles.slice(1).map((style) => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe your artwork..."
                  rows={4}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  className="w-full bg-tattoo-dark border border-tattoo-primary rounded-md px-3 py-2 text-white placeholder-gray-400 resize-none"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isPublic"
                    checked={uploadForm.is_public}
                    onChange={(e) => setUploadForm({...uploadForm, is_public: e.target.checked})}
                    className="rounded border-tattoo-primary"
                    disabled={uploading}
                  />
                  <label htmlFor="isPublic" className="text-gray-300 text-sm">
                    Make this artwork public in gallery
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="isPortfolio"
                    checked={uploadForm.is_portfolio_piece}
                    onChange={(e) => setUploadForm({...uploadForm, is_portfolio_piece: e.target.checked})}
                    className="rounded border-tattoo-primary"
                    disabled={uploading}
                  />
                  <label htmlFor="isPortfolio" className="text-gray-300 text-sm">
                    Include in my portfolio showcase
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Artwork Image *
                </label>
                <div className="border-2 border-dashed border-tattoo-primary rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Click to upload high quality photos</p>
                  <p className="text-gray-400 text-sm">Images will be compressed automatically. Max 10MB original size.</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="artwork-upload"
                    disabled={uploading || !uploadForm.title.trim()}
                  />
                  <label htmlFor="artwork-upload">
                    <Button 
                      className="mt-4 bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                      disabled={uploading || !uploadForm.title.trim()}
                      asChild
                    >
                      <span>
                        {uploading ? 'Processing...' : 'Choose Photo'}
                      </span>
                    </Button>
                  </label>
                  {!uploadForm.title.trim() && (
                    <p className="text-red-400 text-xs mt-2">Please enter a title first</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  onClick={() => setView('grid')}
                  variant="outline"
                  className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark flex-1"
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PortfolioManagement;
