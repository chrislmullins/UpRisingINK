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
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface Client {
  id: string;
  name: string;
  email: string;
  profileImage: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  medicalConditions?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

interface ClientProfileEditorProps {
  client: Client;
  onSave: (client: Client) => void;
  onBack: () => void;
}

const ClientProfileEditor: React.FC<ClientProfileEditorProps> = ({ client, onSave, onBack }) => {
  const [editedClient, setEditedClient] = useState<Client>(client);
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

      // Update profiles table
      const profileRef = doc(db, 'profiles', user.id);
      await setDoc(profileRef, {
        full_name: editedClient.name,
        email: editedClient.email,
        updated_at: new Date().toISOString()
      }, { merge: true });

      // Update clients table
      const clientRef = doc(db, 'clients', user.id);
      await setDoc(clientRef, {
        phone_number: editedClient.phoneNumber,
        date_of_birth: editedClient.dateOfBirth,
        medical_conditions: editedClient.medicalConditions,
        allergies: editedClient.allergies,
        emergency_contact_name: editedClient.emergencyContactName,
        emergency_contact_phone: editedClient.emergencyContactPhone,
        updated_at: new Date().toISOString()
      }, { merge: true });

      // Update local state
      onSave(editedClient);
      setView('preview');

      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });

    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving",
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

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image must be less than 10MB",
          variant: "destructive"
        });
        return;
      }

      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 400,
        useWebWorker: true,
        fileType: 'image/jpeg' as const,
        initialQuality: 0.8
      };

      const compressedFile = await imageCompression(file, compressionOptions);
      
      const fileExt = 'jpg';
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;
      const filePath = fileName;
      const firebaseStorageRef = storageRef(storage, `profile-images/${filePath}`);
      try {
        await uploadBytes(firebaseStorageRef, compressedFile);
        const publicUrl = await getDownloadURL(firebaseStorageRef);

        const profileRef = doc(db, 'profiles', user.id);
        await updateDoc(profileRef, { profile_image: publicUrl });

        setEditedClient(prev => ({
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
              <h1 className="text-2xl font-bold text-white">Client Profile</h1>
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
                      {editedClient.profileImage && editedClient.profileImage !== '/placeholder.svg' ? (
                        <img 
                          src={editedClient.profileImage} 
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
                        Full Name
                      </label>
                      <Input
                        value={editedClient.name}
                        onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                        className="bg-tattoo-dark border-tattoo-primary text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Email
                      </label>
                      <Input
                        value={editedClient.email}
                        onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                        className="bg-tattoo-dark border-tattoo-primary text-white"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-tattoo-gray border-tattoo-primary">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={editedClient.phoneNumber || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, phoneNumber: e.target.value })}
                    placeholder="(555) 123-4567"
                    className="bg-tattoo-dark border-tattoo-primary text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={editedClient.dateOfBirth || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, dateOfBirth: e.target.value })}
                    className="bg-tattoo-dark border-tattoo-primary text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="bg-tattoo-gray border-tattoo-primary">
              <CardHeader>
                <CardTitle className="text-white">Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Medical Conditions
                  </label>
                  <textarea
                    value={editedClient.medicalConditions || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, medicalConditions: e.target.value })}
                    rows={3}
                    className="w-full bg-tattoo-dark border border-tattoo-primary rounded-md px-3 py-2 text-white placeholder-gray-400 resize-none"
                    placeholder="Any medical conditions we should be aware of..."
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Allergies
                  </label>
                  <textarea
                    value={editedClient.allergies || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, allergies: e.target.value })}
                    rows={2}
                    className="w-full bg-tattoo-dark border border-tattoo-primary rounded-md px-3 py-2 text-white placeholder-gray-400 resize-none"
                    placeholder="Any known allergies..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-tattoo-gray border-tattoo-primary">
              <CardHeader>
                <CardTitle className="text-white">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Emergency Contact Name
                  </label>
                  <Input
                    value={editedClient.emergencyContactName || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, emergencyContactName: e.target.value })}
                    placeholder="Emergency contact full name"
                    className="bg-tattoo-dark border-tattoo-primary text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Emergency Contact Phone
                  </label>
                  <Input
                    value={editedClient.emergencyContactPhone || ''}
                    onChange={(e) => setEditedClient({ ...editedClient, emergencyContactPhone: e.target.value })}
                    placeholder="(555) 123-4567"
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
              <CardTitle className="text-white">Client Profile</CardTitle>
              <p className="text-gray-300 text-sm">Your profile information</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-tattoo-dark rounded-full flex items-center justify-center border-2 border-tattoo-primary overflow-hidden">
                    {editedClient.profileImage && editedClient.profileImage !== '/placeholder.svg' ? (
                      <img 
                        src={editedClient.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                      />
                    ) : (
                      <User className="w-12 h-12 text-tattoo-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{editedClient.name}</h2>
                    <p className="text-gray-300">{editedClient.email}</p>
                    {editedClient.phoneNumber && (
                      <p className="text-gray-300">{editedClient.phoneNumber}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                {(editedClient.dateOfBirth || editedClient.phoneNumber) && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Contact Information</h3>
                    <div className="space-y-1">
                      {editedClient.phoneNumber && (
                        <p className="text-gray-300">
                          <span className="text-tattoo-primary">Phone:</span> {editedClient.phoneNumber}
                        </p>
                      )}
                      {editedClient.dateOfBirth && (
                        <p className="text-gray-300">
                          <span className="text-tattoo-primary">Date of Birth:</span> {new Date(editedClient.dateOfBirth).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Medical Info */}
                {(editedClient.medicalConditions || editedClient.allergies) && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Medical Information</h3>
                    <div className="space-y-2">
                      {editedClient.medicalConditions && (
                        <div>
                          <span className="text-tattoo-primary">Medical Conditions:</span>
                          <p className="text-gray-300">{editedClient.medicalConditions}</p>
                        </div>
                      )}
                      {editedClient.allergies && (
                        <div>
                          <span className="text-tattoo-primary">Allergies:</span>
                          <p className="text-gray-300">{editedClient.allergies}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {(editedClient.emergencyContactName || editedClient.emergencyContactPhone) && (
                  <div>
                    <h3 className="text-white font-medium mb-2">Emergency Contact</h3>
                    <div className="space-y-1">
                      {editedClient.emergencyContactName && (
                        <p className="text-gray-300">
                          <span className="text-tattoo-primary">Name:</span> {editedClient.emergencyContactName}
                        </p>
                      )}
                      {editedClient.emergencyContactPhone && (
                        <p className="text-gray-300">
                          <span className="text-tattoo-primary">Phone:</span> {editedClient.emergencyContactPhone}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientProfileEditor;
