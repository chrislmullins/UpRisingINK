import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Calendar, MessageSquare, User } from 'lucide-react';
import { db } from '@/firebase'; // Firestore instance
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  from: 'client' | 'artist';
  content: string;
  timestamp: string;
  type: 'text' | 'appointment' | 'payment';
  sender_name: string;
}

interface MessagingInterfaceProps {
  clientId: string;
  artistId?: string;
  onBack: () => void;
}

const MessagingInterface: React.FC<MessagingInterfaceProps> = ({ clientId, artistId, onBack }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedContext, setSelectedContext] = useState<'artwork' | 'appointment' | 'payment'>('artwork');
  const [messages, setMessages] = useState<Message[]>([]);
  const [artistName, setArtistName] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (artistId) {
      fetchMessages();
      fetchArtistInfo();
    }
  }, [artistId]);

  const fetchArtistInfo = async () => {
    if (!artistId) return;
    try {
      const artistRef = doc(db, 'artists', artistId);
      const artistSnap = await getDoc(artistRef);
      if (!artistSnap.exists()) throw new Error('Artist not found');
      const artistData = artistSnap.data();
      // Assume artistData.profileId is the profile document ID
      const profileId = artistData.profileId || artistData.profile_id;
      if (!profileId) throw new Error('Artist profile not found');
      const profileRef = doc(db, 'profiles', profileId);
      const profileSnap = await getDoc(profileRef);
      setArtistName(profileSnap.exists() ? profileSnap.data().full_name || 'Unknown Artist' : 'Unknown Artist');
    } catch (error: any) {
      console.error('Error fetching artist info:', error);
      toast({
        title: 'Error',
        description: 'Failed to load artist information',
        variant: 'destructive',
      });
    }
  };

  const fetchMessages = async () => {
    if (!artistId || !user) return;
    setLoading(true);
    try {
      // Get artist profile ID
      const artistRef = doc(db, 'artists', artistId);
      const artistSnap = await getDoc(artistRef);
      if (!artistSnap.exists()) throw new Error('Artist not found');
      const artistData = artistSnap.data();
      const artistProfileId = artistData.profileId || artistData.profile_id;
      if (!artistProfileId) throw new Error('Artist profile not found');
      // Query messages between client and artist
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('participants', 'array-contains', user.id),
        orderBy('created_at', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const filtered = querySnapshot.docs.filter(docSnap => {
        const d = docSnap.data();
        // Only messages between this client and this artist
        return (
          (d.sender_id === user.id && d.recipient_id === artistProfileId) ||
          (d.sender_id === artistProfileId && d.recipient_id === user.id)
        );
      });
      const formattedMessages: Message[] = filtered.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          from: d.sender_id === user.id ? 'client' : 'artist',
          content: d.content,
          timestamp: d.created_at?.toDate ? d.created_at.toDate().toISOString() : d.created_at,
          type: (d.message_type as 'text' | 'appointment' | 'payment') || 'text',
          sender_name: d.sender_name || (d.sender_id === user.id ? 'You' : artistName || 'Unknown'),
        };
      });
      setMessages(formattedMessages);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !artistId || !user) return;
    try {
      // Get artist profile ID
      const artistRef = doc(db, 'artists', artistId);
      const artistSnap = await getDoc(artistRef);
      if (!artistSnap.exists()) throw new Error('Artist not found');
      const artistData = artistSnap.data();
      const artistProfileId = artistData.profileId || artistData.profile_id;
      if (!artistProfileId) throw new Error('Artist profile not found');
      // Send message
      const msgDoc = await addDoc(collection(db, 'messages'), {
        sender_id: user.id,
        recipient_id: artistProfileId,
        content: newMessage,
        message_type: selectedContext === 'artwork' ? 'text' : selectedContext,
        created_at: serverTimestamp(),
        participants: [user.id, artistProfileId],
        sender_name: user.profile.full_name || 'You',
      });
      // Fetch the new message
      const msgSnap = await getDoc(msgDoc);
      const d = msgSnap.data();
      const newMsg: Message = {
        id: msgDoc.id,
        from: 'client',
        content: d?.content || newMessage,
        timestamp: d?.created_at?.toDate ? d.created_at.toDate().toISOString() : new Date().toISOString(),
        type: (d?.message_type as 'text' | 'appointment' | 'payment') || 'text',
        sender_name: d?.sender_name || 'You',
      };
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const contextTemplates = {
    artwork: "Hi! I'd like to discuss the artwork design...",
    appointment: "Hi! I'd like to schedule an appointment...",
    payment: "Hi! I have a question about payment..."
  };

  if (!artistId) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">No Artist Selected</h2>
          <p className="mb-6">Please select an artist first to start messaging.</p>
          <Button
            onClick={onBack}
            className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-tattoo-dark flex items-center justify-center">
        <div className="text-white">Loading messages...</div>
      </div>
    );
  }

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
                Back
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-tattoo-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-tattoo-dark" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{artistName}</h1>
                  <p className="text-gray-300 text-sm">Your Artist</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Context Selector */}
        <Card className="mb-4 bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <CardTitle className="text-white text-lg">Message Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedContext === 'artwork' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedContext('artwork')}
                className={selectedContext === 'artwork' 
                  ? 'bg-tattoo-primary text-tattoo-dark' 
                  : 'border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark'
                }
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Artwork Discussion
              </Button>
              <Button
                variant={selectedContext === 'appointment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedContext('appointment')}
                className={selectedContext === 'appointment' 
                  ? 'bg-tattoo-primary text-tattoo-dark' 
                  : 'border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark'
                }
              >
                <Calendar className="w-4 h-4 mr-2" />
                Appointment
              </Button>
              <Button
                variant={selectedContext === 'payment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedContext('payment')}
                className={selectedContext === 'payment' 
                  ? 'bg-tattoo-primary text-tattoo-dark' 
                  : 'border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark'
                }
              >
                Payment Inquiry
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="mb-4 bg-tattoo-gray border-tattoo-primary">
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.from === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-sm p-3 rounded-lg ${
                        message.from === 'client'
                          ? 'bg-tattoo-primary text-tattoo-dark'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.from === 'client' ? 'text-tattoo-dark/70' : 'text-gray-400'
                      }`}>
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                      {message.type !== 'text' && (
                        <div className="mt-2 pt-2 border-t border-gray-600">
                          <div className="flex items-center text-xs">
                            {message.type === 'appointment' && <Calendar className="w-3 h-3 mr-1" />}
                            {message.type === 'appointment' ? 'Appointment Request' : 'Payment Inquiry'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Input */}
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardContent className="p-4">
            <div className="space-y-4">
              <Textarea
                placeholder={contextTemplates[selectedContext]}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="bg-tattoo-dark border-tattoo-primary text-white placeholder-gray-400"
                rows={3}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <p className="text-gray-400 text-sm">
                  Context: {selectedContext.charAt(0).toUpperCase() + selectedContext.slice(1)}
                </p>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessagingInterface;
