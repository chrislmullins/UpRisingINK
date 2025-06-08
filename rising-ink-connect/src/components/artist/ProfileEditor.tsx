import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, User, Eye, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import imageCompression from 'browser-image-compression';
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface Artist {
  id: string;
  name: string;
  email: string;
  bio: string;
  profileImage: string;
  specializations: string[];
  socialMedia: {
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  workingHours: {
    [key: string]: { start: string; end: string; available: boolean };
  };
}

interface ProfileEditorProps {
  artist: Artist;
  onSave: (artist: Artist) => void;
  onBack: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ artist, onSave, onBack }) => {
  const [editedArtist, setEditedArtist] = useState<Artist>(artist);
  const [isEditing, setIsEditing] = useState(false);
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save changes",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);

      console.log('Saving artist profile for user:', user.id);

      // Update profiles table first
      await updateDoc(doc(db, 'profiles', user.id), {
        full_name: editedArtist.name,
        email: editedArtist.email,
        updated_at: new Date().toISOString()
      });

      console.log('Profile updated successfully');

      // Get the artist record ID first
      const artistDoc = await getDoc(doc(db, 'artists', user.id));

      if (!artistDoc.exists()) {
        throw new Error('Artist record not found');
      }

      const artistData = artistDoc.data();

      console.log('Found artist record:', artistData.id);

      // Update artists table with comprehensive data
      await updateDoc(doc(db, 'artists', artistData.id), {
        bio: editedArtist.bio || '',
        specializations: editedArtist.specializations.filter(spec => spec.trim()),
        instagram_handle: editedArtist.socialMedia.instagram || null,
        facebook_url: editedArtist.socialMedia.facebook || null,
        website_url: editedArtist.socialMedia.website || null,
        is_available: true,
        updated_at: new Date().toISOString()
      });

      console.log('Artist profile updated successfully');

      // Update local state
      onSave(editedArtist);
      setIsEditing(false);
      setView('preview');

      toast({
        title: "Success",
        description: "Profile updated successfully! Your changes are now visible to clients."
      });

    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: `Failed to save profile: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (10MB limit before compression)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 10MB",
          variant: "destructive"
        });
        return;
      }

      console.log('Starting image compression for profile picture');
      
      // Compress and resize image for profile picture
      const compressionOptions = {
        maxSizeMB: 1, // Max 1MB after compression
        maxWidthOrHeight: 400, // Profile pictures don't need to be huge
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
        initialQuality: 0.8
      };

      const compressedFile = await imageCompression(file, compressionOptions);
      
      console.log('Original file size:', file.size / 1024 / 1024, 'MB');
      console.log('Compressed file size:', compressedFile.size / 1024 / 1024, 'MB');

      const fileExt = 'jpg';
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;
      const filePath = fileName;
      const firebaseStorageRef = storageRef(storage, `profile-images/${filePath}`);
      try {
        await uploadBytes(firebaseStorageRef, compressedFile);
        const publicUrl = await getDownloadURL(firebaseStorageRef);

        // Update profile in database
        await updateDoc(doc(db, 'profiles', user.id), { profile_image: publicUrl });

        // Update local state
        setEditedArtist(prev => ({
          ...prev,
          profileImage: publicUrl
        }));

        toast({
          title: "Success",
          description: "Profile picture updated successfully!"
        });

      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload Error",
          description: `Failed to upload image: ${uploadError.message}`,
          variant: "destructive"
        });
        return;
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while uploading",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSpecializationChange = (index: number, value: string) => {
    const newSpecs = [...editedArtist.specializations];
    newSpecs[index] = value;
    setEditedArtist({ ...editedArtist, specializations: newSpecs });
  };

  const addSpecialization = () => {
    setEditedArtist({
      ...editedArtist,
      specializations: [...editedArtist.specializations, '']
    });
  };

  const removeSpecialization = (index: number) => {
    const newSpecs = editedArtist.specializations.filter((_, i) => i !== index);
    setEditedArtist({ ...editedArtist, specializations: newSpecs });
  };

  return (
    <div className="min-h-screen bg-tattoo-dark">
      {/* Header */}
      <div className="bg-tattoo-gray border-b border-tattoo-primary">
        <div className="max-w-4xl mx-auto p-4">
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
              <h1 className="text-2xl font-bold text-white">Artist Profile</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={view === 'edit' ? 'default' : 'outline'}
                onClick={() => setView('edit')}
                size="sm"
                className={view === 'edit' ? 'bg-tattoo-primary text-tattoo-dark' : 'border-tattoo-primary text-tattoo-primary'}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button
                variant={view === 'preview' ? 'default' : 'outline'}
                onClick={() => setView('preview')}
                size="sm"
                className={view === 'preview' ? 'bg-tattoo-primary text-tattoo-dark' : 'border-tattoo-primary text-tattoo-primary'}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {view === 'edit' ? (
          <div className="space-y-6">
            {/* Profile Picture & Basic Info */}
            <Card className="bg-tattoo-gray border-tattoo-primary">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-tattoo-dark rounded-full flex items-center justify-center border-2 border-tattoo-primary overflow-hidden">
                      {editedArtist.profileImage && editedArtist.profileImage !== '/placeholder.svg' ? (
                        <img 
                          src={editedArtist.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          style={{ objectPosition: 'center' }}
                        />
                      ) : (
                        <User className="w-12 h-12 text-tattoo-primary" />
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-image-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="profile-image-upload">
                        <Button
                          size="sm"
                          className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 rounded-full w-8 h-8 p-0 cursor-pointer"
                          disabled={uploading}
                          asChild
                        >
                          <span>
                            <Upload className="w-4 h-4" />
                          </span>
                        </Button>
                      </label>
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="text-white text-xs">Uploading...</div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Artist Name
                      </label>
                      <Input
                        value={editedArtist.name}
                        onChange={(e) => setEditedArtist({ ...editedArtist, name: e.target.value })}
                        className="bg-tattoo-dark border-tattoo-primary text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Email
                      </label>
                      <Input
                        value={editedArtist.email}
                        onChange={(e) => setEditedArtist({ ...editedArtist, email: e.target.value })}
                        className="bg-tattoo-dark border-tattoo-primary text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Biography
                  </label>
                  <textarea
                    value={editedArtist.bio}
                    onChange={(e) => setEditedArtist({ ...editedArtist, bio: e.target.value })}
                    rows={4}
                    className="w-full bg-tattoo-dark border border-tattoo-primary rounded-md px-3 py-2 text-white placeholder-gray-400 resize-none"
                    placeholder="Tell potential clients about your experience, style, and passion for tattooing..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Specializations */}
            <Card className="bg-tattoo-gray border-tattoo-primary">
              <CardHeader>
                <CardTitle className="text-white">Specializations & Styles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {editedArtist.specializations.map((spec, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={spec}
                        onChange={(e) => handleSpecializationChange(index, e.target.value)}
                        placeholder="e.g., Traditional, Realism, Black & Gray"
                        className="bg-tattoo-dark border-tattoo-primary text-white flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpecialization(index)}
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addSpecialization}
                    className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                  >
                    Add Specialization
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Media & Links */}
            <Card className="bg-tattoo-gray border-tattoo-primary">
              <CardHeader>
                <CardTitle className="text-white">Social Media & Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Instagram Handle
                  </label>
                  <Input
                    value={editedArtist.socialMedia.instagram || ''}
                    onChange={(e) => setEditedArtist({
                      ...editedArtist,
                      socialMedia: { ...editedArtist.socialMedia, instagram: e.target.value }
                    })}
                    placeholder="@username"
                    className="bg-tattoo-dark border-tattoo-primary text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Facebook Page
                  </label>
                  <Input
                    value={editedArtist.socialMedia.facebook || ''}
                    onChange={(e) => setEditedArtist({
                      ...editedArtist,
                      socialMedia: { ...editedArtist.socialMedia, facebook: e.target.value }
                    })}
                    placeholder="facebook.com/yourpage"
                    className="bg-tattoo-dark border-tattoo-primary text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Personal Website
                  </label>
                  <Input
                    value={editedArtist.socialMedia.website || ''}
                    onChange={(e) => setEditedArtist({
                      ...editedArtist,
                      socialMedia: { ...editedArtist.socialMedia, website: e.target.value }
                    })}
                    placeholder="www.yourwebsite.com"
                    className="bg-tattoo-dark border-tattoo-primary text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <CardTitle className="text-white">Public Profile Preview</CardTitle>
              <p className="text-gray-300 text-sm">This is how your profile will appear to potential clients</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-tattoo-dark rounded-full flex items-center justify-center border-2 border-tattoo-primary overflow-hidden">
                    {editedArtist.profileImage && editedArtist.profileImage !== '/placeholder.svg' ? (
                      <img 
                        src={editedArtist.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                      />
                    ) : (
                      <User className="w-12 h-12 text-tattoo-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{editedArtist.name}</h2>
                    <p className="text-gray-300">{editedArtist.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editedArtist.specializations.filter(spec => spec.trim()).map((spec, index) => (
                        <span key={index} className="bg-tattoo-primary/20 text-tattoo-primary text-xs px-2 py-1 rounded">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-white font-medium mb-2">About</h3>
                  <p className="text-gray-300">{editedArtist.bio}</p>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-white font-medium mb-2">Connect</h3>
                  <div className="space-y-2">
                    {editedArtist.socialMedia.instagram && (
                      <p className="text-gray-300">
                        <span className="text-tattoo-primary">Instagram:</span> {editedArtist.socialMedia.instagram}
                      </p>
                    )}
                    {editedArtist.socialMedia.facebook && (
                      <p className="text-gray-300">
                        <span className="text-tattoo-primary">Facebook:</span> {editedArtist.socialMedia.facebook}
                      </p>
                    )}
                    {editedArtist.socialMedia.website && (
                      <p className="text-gray-300">
                        <span className="text-tattoo-primary">Website:</span> {editedArtist.socialMedia.website}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-tattoo-primary/30">
                  <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90">
                    Choose This Artist
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

export default ProfileEditor;
