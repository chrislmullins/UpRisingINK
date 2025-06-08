import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, Plus, Eye, Mail, Phone, UserCheck } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  assignedArtist?: string;
}

interface ClientManagementProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    profileImage: string;
  };
  onBack: () => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ currentUser, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '123-456-7890',
      status: 'active',
      assignedArtist: 'Alex Rivera'
    },
    {
      id: '2',
      name: 'Emily White',
      email: 'emily@example.com',
      phone: '987-654-3210',
      status: 'pending'
    },
    {
      id: '3',
      name: 'David Green',
      email: 'david@example.com',
      phone: '555-123-4567',
      status: 'inactive',
      assignedArtist: 'Sarah Chen'
    }
  ]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                Client Management
              </h1>
              <p className="text-gray-300 mt-1">
                Manage and view client information.
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

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Add New */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Search clients..."
              className="bg-tattoo-dark border-gray-600 text-white pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
          <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90">
            <Plus className="mr-2 w-4 h-4" />
            Add New Client
          </Button>
        </div>

        {/* Client List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredClients.map(client => (
            <Card key={client.id} className="bg-tattoo-gray border-tattoo-primary">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  {client.name}
                  <Badge variant="secondary" className="bg-tattoo-primary text-tattoo-dark">
                    {client.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
                {client.assignedArtist && (
                  <div className="flex items-center space-x-2 mt-2">
                    <UserCheck className="w-4 h-4" />
                    <span>Assigned Artist: {client.assignedArtist}</span>
                  </div>
                )}
                <div className="mt-4">
                  <Button variant="outline" className="mr-2">
                    <Eye className="mr-2 w-4 h-4" />
                    View Details
                  </Button>
                  <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientManagement;
