import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Edit, Image, Calendar, MessageSquare } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';

interface OwnerArtistHubProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    profileImage: string;
  };
  onBack: () => void;
}

const OwnerArtistHub: React.FC<OwnerArtistHubProps> = ({ currentUser, onBack }) => {
  // Mock artist hub data
  const artistHubData = {
    totalPieces: 125,
    upcomingAppointments: 7,
    messages: 23,
    profileViews: 345
  };

  const recentUpdates = [
    { id: '1', type: 'New Piece', description: 'Added "Serpent\'s Kiss" to portfolio', time: '1 hour ago' },
    { id: '2', type: 'Appointment', description: 'New appointment with client Sarah L.', time: '3 hours ago' },
    { id: '3', type: 'Message', description: 'Received message from potential client Mark D.', time: '5 hours ago' }
  ];

  return (
    <div className="min-h-screen bg-tattoo-dark">
      {/* Header */}
      <div className="bg-tattoo-gray border-b border-tattoo-primary">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                My Artist Hub - {currentUser.name}
              </h1>
              <p className="text-gray-300 mt-1">
                Manage your artist profile and track your performance on UpRising.ink.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={onBack}
                className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
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
        {/* Artist Hub Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Total Pieces</p>
                  <p className="text-2xl font-bold text-white">{artistHubData.totalPieces}</p>
                </div>
                <Image className="w-8 h-8 text-tattoo-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Upcoming Appointments</p>
                  <p className="text-2xl font-bold text-white">{artistHubData.upcomingAppointments}</p>
                </div>
                <Calendar className="w-8 h-8 text-tattoo-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Messages</p>
                  <p className="text-2xl font-bold text-white">{artistHubData.messages}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-tattoo-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Profile Views</p>
                  <p className="text-2xl font-bold text-white">{artistHubData.profileViews}</p>
                </div>
                <Edit className="w-8 h-8 text-tattoo-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Updates */}
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUpdates.map((update) => (
                  <div key={update.id} className="p-3 bg-tattoo-dark rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-tattoo-primary font-medium text-sm">{update.type}</p>
                      <span className="text-gray-400 text-xs">{update.time}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{update.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex flex-col h-20 space-y-2">
                  <Plus className="w-6 h-6" />
                  <span className="text-sm">Add New Piece</span>
                </Button>

                <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex flex-col h-20 space-y-2">
                  <Edit className="w-6 h-6" />
                  <span className="text-sm">Edit Profile</span>
                </Button>

                <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex flex-col h-20 space-y-2">
                  <Calendar className="w-6 h-6" />
                  <span className="text-sm">View Appointments</span>
                </Button>

                <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 flex flex-col h-20 space-y-2">
                  <MessageSquare className="w-6 h-6" />
                  <span className="text-sm">View Messages</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerArtistHub;
