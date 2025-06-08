import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, Plus, Eye, Mail, Settings, Shield } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';
import CreateUserForm from './CreateUserForm';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
}

interface UserManagementProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    profileImage: string;
  };
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'client',
      status: 'active',
      lastLogin: '2024-03-15'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'artist',
      status: 'active',
      lastLogin: '2024-03-10'
    },
    {
      id: '3',
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      role: 'manager',
      status: 'inactive',
      lastLogin: '2024-02-28'
    }
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserCreated = () => {
    // Refresh the users list - in a real app, you'd refetch from the database
    console.log('User created, refreshing list...');
  };

  return (
    <div className="min-h-screen bg-tattoo-dark">
      {/* Header */}
      <div className="bg-tattoo-gray border-b border-tattoo-primary">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={onBack}
              variant="ghost"
              className="bg-transparent hover:bg-tattoo-primary/10 text-white"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                User Management
              </h1>
              <p className="text-gray-300 mt-1">
                Manage platform users and their roles.
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

      {/* Search and Add User */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Search users..."
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
            Add User
          </Button>
        </div>

        {/* User List */}
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <CardTitle className="text-white">User List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr className="text-left">
                    <th className="py-3.5 px-4 text-sm font-normal text-gray-400">Name</th>
                    <th className="py-3.5 px-4 text-sm font-normal text-gray-400">Email</th>
                    <th className="py-3.5 px-4 text-sm font-normal text-gray-400">Role</th>
                    <th className="py-3.5 px-4 text-sm font-normal text-gray-400">Status</th>
                    <th className="py-3.5 px-4 text-sm font-normal text-gray-400">Last Login</th>
                    <th className="py-3.5 px-4 text-sm font-normal text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-white">{user.name}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">
                        <Badge variant="secondary">{user.role}</Badge>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">
                        {user.status === 'active' ? (
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        ) : user.status === 'inactive' ? (
                          <Badge className="bg-red-500 text-white">Inactive</Badge>
                        ) : (
                          <Badge className="bg-yellow-500 text-white">Pending</Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">{user.lastLogin}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="text-tattoo-primary hover:bg-tattoo-primary/10">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-tattoo-primary hover:bg-tattoo-primary/10">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-tattoo-primary hover:bg-tattoo-primary/10">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10">
                            <Shield className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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

export default UserManagement;
