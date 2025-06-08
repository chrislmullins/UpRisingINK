
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, User, Search, Plus, Edit, MessageSquare, Image } from 'lucide-react';

interface Artwork {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'planned';
  date: string;
  notes: string;
  careInstructions?: string;
  images: string[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalSessions: number;
  artwork: Artwork[];
}

interface ClientManagementProps {
  artistId: string;
  onBack: () => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ artistId, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'details'>('list');

  // Mock data
  const clients: Client[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      joinDate: '2023-06-15',
      totalSessions: 3,
      artwork: [
        {
          id: '1',
          title: 'Dragon Sleeve',
          status: 'in-progress',
          date: '2024-01-15',
          notes: 'Traditional Japanese style, session 2 of 4 planned',
          careInstructions: 'Keep covered for first 24 hours, apply thin layer of healing balm twice daily',
          images: ['/placeholder.svg']
        },
        {
          id: '2',
          title: 'Small Rose',
          status: 'completed',
          date: '2023-08-20',
          notes: 'First tattoo, healed perfectly',
          careInstructions: 'Standard aftercare followed successfully',
          images: ['/placeholder.svg']
        }
      ]
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1 (555) 987-6543',
      joinDate: '2023-09-10',
      totalSessions: 1,
      artwork: [
        {
          id: '3',
          title: 'Geometric Pattern',
          status: 'completed',
          date: '2023-12-05',
          notes: 'Minimalist design on forearm',
          careInstructions: 'Keep dry for 48 hours, use unscented lotion after day 3',
          images: ['/placeholder.svg']
        }
      ]
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedClientData = clients.find(client => client.id === selectedClient);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-400/10';
      case 'in-progress': return 'text-yellow-400 bg-yellow-400/10';
      case 'planned': return 'text-blue-400 bg-blue-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
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
                onClick={() => {
                  if (view === 'details') {
                    setView('list');
                    setSelectedClient(null);
                  } else {
                    onBack();
                  }
                }}
                className="text-tattoo-primary hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {view === 'details' ? 'Back to Clients' : 'Back to Dashboard'}
              </Button>
              <h1 className="text-2xl font-bold text-white">
                {view === 'details' ? `${selectedClientData?.name} - Client Details` : 'Client Management'}
              </h1>
            </div>
            {view === 'list' && (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-tattoo-gray border-tattoo-primary text-white w-64"
                  />
                </div>
                <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {view === 'list' ? (
          /* Client List View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="bg-tattoo-gray border-tattoo-primary hover:border-tattoo-primary/70 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-tattoo-primary rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-tattoo-dark" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{client.name}</CardTitle>
                        <p className="text-gray-300 text-sm">{client.email}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Total Sessions:</span>
                      <span className="text-white">{client.totalSessions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Client Since:</span>
                      <span className="text-white">{client.joinDate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Active Artwork:</span>
                      <span className="text-white">
                        {client.artwork.filter(art => art.status === 'in-progress').length}
                      </span>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client.id);
                          setView('details');
                        }}
                        className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex-1"
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Client Details View */
          selectedClientData && (
            <div className="space-y-6">
              {/* Client Info */}
              <Card className="bg-tattoo-gray border-tattoo-primary">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Client Information
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-300 text-sm">Name</label>
                        <p className="text-white">{selectedClientData.name}</p>
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm">Email</label>
                        <p className="text-white">{selectedClientData.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-gray-300 text-sm">Phone</label>
                        <p className="text-white">{selectedClientData.phone}</p>
                      </div>
                      <div>
                        <label className="text-gray-300 text-sm">Client Since</label>
                        <p className="text-white">{selectedClientData.joinDate}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Artwork History */}
              <Card className="bg-tattoo-gray border-tattoo-primary">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    Artwork History
                    <Button
                      size="sm"
                      className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Artwork
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedClientData.artwork.map((artwork) => (
                      <div key={artwork.id} className="p-4 bg-tattoo-dark rounded-lg border border-tattoo-primary/30">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-medium">{artwork.title}</h3>
                            <p className="text-gray-400 text-sm">{artwork.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(artwork.status)}`}>
                              {artwork.status.toUpperCase()}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="text-gray-300 text-sm font-medium">Notes:</label>
                            <p className="text-white text-sm mt-1">{artwork.notes}</p>
                          </div>
                          
                          {artwork.careInstructions && (
                            <div>
                              <label className="text-gray-300 text-sm font-medium">Care Instructions:</label>
                              <p className="text-white text-sm mt-1">{artwork.careInstructions}</p>
                            </div>
                          )}
                          
                          <div>
                            <label className="text-gray-300 text-sm font-medium">Reference Images:</label>
                            <div className="flex space-x-2 mt-2">
                              {artwork.images.map((image, index) => (
                                <div key={index} className="w-16 h-16 bg-tattoo-gray rounded border border-tattoo-primary/30 flex items-center justify-center">
                                  <Image className="w-6 h-6 text-gray-400" />
                                </div>
                              ))}
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-16 h-16 border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark border-dashed"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ClientManagement;
