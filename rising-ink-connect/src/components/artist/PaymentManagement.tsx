
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, User, Calendar, MessageSquare } from 'lucide-react';

interface Payment {
  id: string;
  clientName: string;
  appointmentDate: string;
  appointmentType: string;
  amount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  depositAmount?: number;
  notes: string;
}

interface PaymentManagementProps {
  artistId: string;
  onBack: () => void;
}

const PaymentManagement: React.FC<PaymentManagementProps> = ({ artistId, onBack }) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'partial' | 'paid' | 'overdue'>('all');

  // Mock data
  const payments: Payment[] = [
    {
      id: '1',
      clientName: 'John Doe',
      appointmentDate: '2024-01-20',
      appointmentType: 'Sleeve Session 1',
      amount: 800,
      status: 'partial',
      depositAmount: 200,
      notes: 'Deposit received, balance due at appointment'
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      appointmentDate: '2024-01-18',
      appointmentType: 'Small Tattoo',
      amount: 300,
      status: 'paid',
      notes: 'Paid in full'
    },
    {
      id: '3',
      clientName: 'Mike Johnson',
      appointmentDate: '2024-01-15',
      appointmentType: 'Consultation',
      amount: 100,
      status: 'pending',
      notes: 'Awaiting payment confirmation'
    },
    {
      id: '4',
      clientName: 'Sarah Wilson',
      appointmentDate: '2024-01-10',
      appointmentType: 'Touch-up',
      amount: 150,
      status: 'overdue',
      notes: 'Payment overdue by 5 days'
    }
  ];

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400 bg-green-400/10';
      case 'partial': return 'text-yellow-400 bg-yellow-400/10';
      case 'pending': return 'text-blue-400 bg-blue-400/10';
      case 'overdue': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
  const partialAmount = payments.filter(p => p.status === 'partial').reduce((sum, p) => sum + (p.depositAmount || 0), 0);

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
              <h1 className="text-2xl font-bold text-white">Payment Management</h1>
            </div>
            <div className="flex space-x-2">
              {['all', 'pending', 'partial', 'paid', 'overdue'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  onClick={() => setFilter(status as any)}
                  size="sm"
                  className={filter === status ? 'bg-tattoo-primary text-tattoo-dark' : 'border-tattoo-primary text-tattoo-primary'}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-gray-300 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-green-400">${totalRevenue}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-gray-300 text-sm">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-400">${pendingAmount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-tattoo-gray border-tattoo-primary">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-gray-300 text-sm">Deposits Received</p>
                <p className="text-3xl font-bold text-blue-400">${partialAmount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <CardTitle className="text-white">Payment Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-tattoo-primary/30">
                    <TableHead className="text-gray-300">Client</TableHead>
                    <TableHead className="text-gray-300">Appointment</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Notes</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="border-tattoo-primary/30">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-tattoo-primary" />
                          <span className="text-white">{payment.clientName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-white text-sm">{payment.appointmentType}</p>
                          <div className="flex items-center space-x-1 text-gray-400 text-xs">
                            <Calendar className="w-3 h-3" />
                            <span>{payment.appointmentDate}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white">
                          <p>${payment.amount}</p>
                          {payment.depositAmount && (
                            <p className="text-xs text-gray-400">
                              Deposit: ${payment.depositAmount}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(payment.status)}`}>
                          {payment.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm max-w-xs truncate">
                        {payment.notes}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6 bg-tattoo-gray border-tattoo-primary">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90">
                Log New Payment
              </Button>
              <Button 
                variant="outline"
                className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                Send Payment Reminder
              </Button>
              <Button 
                variant="outline"
                className="border-tattoo-primary text-tattoo-primary hover:bg-tattoo-primary hover:text-tattoo-dark"
              >
                Generate Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentManagement;
