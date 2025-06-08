import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronDown, ChevronUp, Eye, MessageSquare } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ArtworkEntry {
  id: string;
  name: string;
  category: 'completed' | 'in-progress' | 'future';
  artist: string;
  startDate?: string;
  completedDate?: string;
  progress: number;
  description: string;
  instructions: string;
  notes: string[];
  referenceImages: string[];
  estimatedCost?: string;
  actualCost?: string;
}

interface ArtworkLogProps {
  clientId: string;
  onBack: () => void;
}

const ArtworkLog: React.FC<ArtworkLogProps> = ({ clientId, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'completed' | 'in-progress' | 'future'>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [artworkEntries, setArtworkEntries] = useState<ArtworkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchArtwork();
    }
  }, [user?.id]);

  const fetchArtwork = async () => {
    try {
      const app = getApp();
      const db = getFirestore(app);
      // Get client record by profile_id
      const clientsRef = collection(db, 'clients');
      const clientQuery = query(clientsRef, where('profile_id', '==', user?.id));
      const clientSnapshot = await getDocs(clientQuery);
      if (clientSnapshot.empty) return;
      const clientData = clientSnapshot.docs[0].data();
      const clientId = clientSnapshot.docs[0].id;

      // Fetch artwork for this client
      const artworkRef = collection(db, 'artwork');
      const artworkQuery = query(
        artworkRef,
        where('client_id', '==', clientId),
        orderBy('created_at', 'desc')
      );
      const artworkSnapshot = await getDocs(artworkQuery);
      const formattedArtwork = artworkSnapshot.docs.map(doc => {
        const art = doc.data();
        return {
          id: doc.id,
          name: art.title,
          category: art.status || 'future',
          artist: art.artist_name || 'Unknown Artist',
          startDate: art.created_at?.split('T')[0],
          completedDate: art.completion_date,
          progress: art.status === 'completed' ? 100 : art.status === 'in_progress' ? 50 : 0,
          description: art.description || 'No description available',
          instructions: 'Detailed instructions will be provided by your artist',
          notes: ['Artwork created', 'Progress tracking available'],
          referenceImages: art.reference_images || ['/placeholder.svg'],
          estimatedCost: art.estimated_cost ? `$${art.estimated_cost}` : undefined,
          actualCost: art.actual_cost ? `$${art.actual_cost}` : undefined,
        };
      });
      setArtworkEntries(formattedArtwork);
    } catch (error) {
      console.error('Error fetching artwork:', error);
      toast({
        title: "Error",
        description: "Failed to load artwork log",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredArtwork = selectedCategory === 'all' 
    ? artworkEntries 
    : artworkEntries.filter(entry => entry.category === selectedCategory);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'completed': return 'bg-green-400/10 text-green-400 border-green-400/30';
      case 'in-progress': return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30';
      case 'future': return 'bg-blue-400/10 text-blue-400 border-blue-400/30';
      default: return 'bg-gray-400/10 text-gray-400 border-gray-400/30';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'completed': return 'Completed Artwork';
      case 'in-progress': return 'Artwork in Progress';
      case 'future': return 'Future Artwork Ideas';
      default: return category;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-white">Loading artwork log...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tattoo-dark">
      {/* Header */}
      <div className="bg-tattoo-gray border-b border-tattoo-primary">
        <div className="max-w-6xl mx-auto p-4">
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
              <h1 className="text-2xl font-bold text-white">My Artwork Log</h1>
            </div>
            <div className="flex space-x-2">
              {['all', 'completed', 'in-progress', 'future'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category as any)}
                  size="sm"
                  className={selectedCategory === category ? 'bg-tattoo-primary text-tattoo-dark' : 'border-tattoo-primary text-tattoo-primary'}
                >
                  {category === 'all' ? 'All' : getCategoryLabel(category).split(' ')[0]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="space-y-6">
          {filteredArtwork.length > 0 ? (
            filteredArtwork.map((entry) => (
              <Card key={entry.id} className="bg-tattoo-gray border-tattoo-primary">
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div 
                      className="w-full cursor-pointer"
                      onClick={() => toggleExpanded(entry.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <CardTitle className="text-white text-xl">{entry.name}</CardTitle>
                              <p className="text-gray-300">Artist: {entry.artist}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <Badge className={getCategoryColor(entry.category)}>
                              {getCategoryLabel(entry.category)}
                            </Badge>
                            {expandedItems.has(entry.id) ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {entry.category === 'in-progress' && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-300 mb-2">
                              <span>Progress</span>
                              <span>{entry.progress}%</span>
                            </div>
                            <div className="w-full bg-tattoo-dark rounded-full h-2">
                              <div 
                                className="bg-tattoo-primary h-2 rounded-full transition-all duration-300"
                                style={{ width: `${entry.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </CardHeader>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          {/* Basic Info */}
                          <div>
                            <h4 className="text-white font-medium mb-3">Artwork Details</h4>
                            <div className="space-y-2 text-sm">
                              {entry.startDate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Started:</span>
                                  <span className="text-white">{entry.startDate}</span>
                                </div>
                              )}
                              {entry.completedDate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Completed:</span>
                                  <span className="text-white">{entry.completedDate}</span>
                                </div>
                              )}
                              {entry.estimatedCost && (
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Estimated Cost:</span>
                                  <span className="text-white">{entry.estimatedCost}</span>
                                </div>
                              )}
                              {entry.actualCost && (
                                <div className="flex justify-between">
                                  <span className="text-gray-300">Actual Cost:</span>
                                  <span className="text-white">{entry.actualCost}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <h4 className="text-white font-medium mb-3">Description</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {entry.description}
                            </p>
                          </div>

                          {/* Instructions */}
                          <div>
                            <h4 className="text-white font-medium mb-3">Artist Instructions</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {entry.instructions}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {/* Progress Notes */}
                          <div>
                            <h4 className="text-white font-medium mb-3">Progress Notes</h4>
                            <div className="space-y-2">
                              {entry.notes.map((note, index) => (
                                <div key={index} className="flex items-start space-x-2">
                                  <div className="w-2 h-2 bg-tattoo-primary rounded-full mt-2 flex-shrink-0" />
                                  <p className="text-gray-300 text-sm">{note}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Reference Images */}
                          <div>
                            <h4 className="text-white font-medium mb-3">Reference Images</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {entry.referenceImages.map((image, index) => (
                                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-tattoo-dark border border-tattoo-primary/30">
                                  <img
                                    src={image}
                                    alt={`Reference ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col space-y-2">
                            <Button
                              variant="outline"
                              className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Full Gallery
                            </Button>
                            <Button
                              variant="outline"
                              className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Message Artist
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))
          ) : (
            <Card className="bg-tattoo-gray border-tattoo-primary">
              <CardContent className="text-center py-12">
                <h3 className="text-xl font-bold text-white mb-4">No Artwork Yet</h3>
                <p className="text-gray-300 mb-6">
                  Start your tattoo journey by booking a consultation with one of our talented artists.
                </p>
                <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90">
                  Find an Artist
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtworkLog;
