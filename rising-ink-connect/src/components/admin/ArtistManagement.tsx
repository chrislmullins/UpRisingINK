import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, Plus, Eye, Mail, Phone } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';
import CreateUserForm from './CreateUserForm';
import { db } from '@/firebase';
import { collection, getDocs, getDoc, query, where, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface Artist {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
  profileImage: string;
  phone?: string;
}

interface ArtistManagementProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    profileImage: string;
  };
  onBack: () => void;
}

const ArtistManagement: React.FC<ArtistManagementProps> = ({ currentUser, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchArtists = async () => {
    try {
      setLoading(true);
      
      // First, fetch profiles with artist role
      const profilesQuery = query(collection(db, 'profiles'), where('role', '==', 'artist'));
      const profilesSnap = await getDocs(profilesQuery);

      if (profilesSnap.empty) {
        console.log('No artist profiles found');
        setArtists([]);
        return;
      }

      console.log('Fetched artist profiles:', profilesSnap.docs);

      // Then fetch artist details for each profile
      const formattedArtists: Artist[] = [];
      
      for (const profileDoc of profilesSnap.docs) {
        const profile = profileDoc.data();
        const artistDoc = await getDoc(doc(db, 'artists', profileDoc.id));
        const data = artistDoc.data() as { is_available?: boolean };

        formattedArtists.push({
          id: profileDoc.id,
          name: profile.full_name || 'No name set',
          email: profile.email,
          status: artistDoc.exists() && data.is_available ? 'active' : 'inactive',
          joinDate: new Date(profile.created_at).toLocaleDateString(),
          profileImage: profile.profile_image || '/placeholder.svg',
          phone: undefined // Remove phone since it's not available in artists table
        });
      }

      setArtists(formattedArtists);
    } catch (error: any) {
      console.error('Error fetching artists:', error);
      toast({
        title: "Error",
        description: "Failed to fetch artists",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserCreated = () => {
    console.log('User created, refreshing artist list...');
    fetchArtists();
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
                variant="ghost"
                className="bg-transparent hover:bg-tattoo-primary/10 text-white"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-white mt-2">
                Manage Artists
              </h1>
              <p className="text-gray-300 mt-1">
                View, add, and manage the artists on the UpRising.ink platform.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <img 
                src={currentUser.profileImage} 
                alt={currentUser.name}
                className="w-12 h-12 rounded-full border-2 border-tattoo-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Add New */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Search artists..."
              className="bg-tattoo-dark border-gray-600 text-white pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
          >
            <Plus className="mr-2 w-4 h-4" />
            Add New Artist
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-gray-300 py-8">
            Loading artists...
          </div>
        )}

        {/* No Artists State */}
        {!loading && filteredArtists.length === 0 && (
          <div className="text-center text-gray-300 py-8">
            {searchTerm ? 'No artists found matching your search.' : 'No artists found. Add your first artist to get started.'}
          </div>
        )}

        {/* Artist List */}
        {!loading && filteredArtists.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredArtists.map(artist => (
              <Card key={artist.id} className="bg-tattoo-gray border-tattoo-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{artist.name}</CardTitle>
                    <Badge 
                      variant="secondary"
                      className={
                        artist.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : artist.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }
                    >
                      {artist.status === 'active' ? 'Active' : artist.status === 'pending' ? 'Pending' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-300">
                      <a href="#" className="hover:underline">View Profile</a>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-300">{artist.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-300">
                      {artist.phone || 'No phone added'}
                    </p>
                  </div>
                  <p className="text-sm text-gray-300">
                    Join Date: {artist.joinDate}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create User Form Modal */}
      {showCreateForm && (
        <CreateUserForm
          onClose={() => setShowCreateForm(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
};

export default ArtistManagement;
