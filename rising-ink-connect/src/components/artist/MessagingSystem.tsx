import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageSquare, User, Send } from 'lucide-react';
import { db } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isFromArtist: boolean;
}

interface Conversation {
  id: string;
  clientName: string;
  clientId?: string;
  isLead: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

interface MessagingSystemProps {
  artistId: string;
  onBack: () => void;
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({ artistId, onBack }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState<'all' | 'clients' | 'leads'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConversations = () => {
      setLoading(true);
      const q = query(
        collection(db, 'conversations'),
        where('artistId', '==', artistId),
        orderBy('lastMessageTime', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const convs: Conversation[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          convs.push({
            id: doc.id,
            clientName: data.clientName,
            clientId: data.clientId,
            isLead: data.isLead,
            lastMessage: data.lastMessage,
            lastMessageTime: data.lastMessageTime,
            unreadCount: data.unreadCount,
            messages: data.messages || []
          });
        });
        setConversations(convs);
        setLoading(false);
      });

      return () => unsubscribe();
    };

    fetchConversations();
  }, [artistId]);

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'clients') return !conv.isLead;
    if (filter === 'leads') return conv.isLead;
    return true;
  });

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const message: Message = {
      id: Date.now().toString(),
      senderId: artistId,
      senderName: 'Sarah Chen',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isFromArtist: true
    };

    // Update conversation with new message
    const convRef = doc(db, 'conversations', selectedConversation);
    await updateDoc(convRef, {
      lastMessage: newMessage,
      lastMessageTime: Timestamp.now(),
      unreadCount: 0,
      messages: arrayUnion(message)
    });

    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-tattoo-dark">
      {/* Header */}
      <div className="bg-tattoo-gray border-b border-tattoo-primary">
        <div className="max-w-7xl mx-auto p-4">
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
              <h1 className="text-2xl font-bold text-white">Messages</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
                className={filter === 'all' ? 'bg-tattoo-primary text-tattoo-dark' : 'border-tattoo-primary text-tattoo-primary'}
              >
                All
              </Button>
              <Button
                variant={filter === 'clients' ? 'default' : 'outline'}
                onClick={() => setFilter('clients')}
                size="sm"
                className={filter === 'clients' ? 'bg-tattoo-primary text-tattoo-dark' : 'border-tattoo-primary text-tattoo-primary'}
              >
                Clients
              </Button>
              <Button
                variant={filter === 'leads' ? 'default' : 'outline'}
                onClick={() => setFilter('leads')}
                size="sm"
                className={filter === 'leads' ? 'bg-tattoo-primary text-tattoo-dark' : 'border-tattoo-primary text-tattoo-primary'}
              >
                New Leads
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <CardTitle className="text-white">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-400">
                    Loading conversations...
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedConversation === conversation.id 
                          ? 'bg-tattoo-primary/20' 
                          : 'hover:bg-tattoo-dark'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-tattoo-primary rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-tattoo-dark" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-white font-medium truncate">{conversation.clientName}</p>
                              {conversation.isLead && (
                                <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">
                                  Lead
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm truncate">{conversation.lastMessage}</p>
                            <p className="text-gray-400 text-xs">{conversation.lastMessageTime}</p>
                          </div>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-tattoo-primary text-tattoo-dark text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <div className="lg:col-span-2">
            {selectedConv ? (
              <Card className="bg-tattoo-gray border-tattoo-primary h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="w-6 h-6 text-tattoo-primary" />
                      <span>{selectedConv.clientName}</span>
                      {selectedConv.isLead && (
                        <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">
                          New Lead
                        </span>
                      )}
                    </div>
                    {selectedConv.isLead && (
                      <Button 
                        size="sm"
                        className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                      >
                        Invite to Sign Up
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 flex flex-col">
                  <div className="flex-1 space-y-4 overflow-y-auto mb-4 max-h-[400px]">
                    {selectedConv.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromArtist ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isFromArtist
                              ? 'bg-tattoo-primary text-tattoo-dark'
                              : 'bg-tattoo-dark text-white'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.isFromArtist ? 'text-tattoo-dark/70' : 'text-gray-400'
                          }`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-tattoo-dark border-tattoo-primary text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button 
                      onClick={handleSendMessage}
                      className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-tattoo-gray border-tattoo-primary h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Select a conversation to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;
