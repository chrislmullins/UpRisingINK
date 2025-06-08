
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, MessageSquare, User } from 'lucide-react';

const BookingSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tattooType: '',
    description: '',
    preferredDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking request submitted:', formData);
    // Handle form submission logic here
  };

  return (
    <section id="booking" className="py-20 bg-tattoo-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Book Your <span className="gradient-text">Session</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ready to bring your vision to life? Fill out our booking form and one of our artists will connect with you to discuss your project.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Booking Form */}
          <Card className="bg-tattoo-gray border-tattoo-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center">
                <Calendar className="mr-3 text-tattoo-primary" />
                New Client Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="bg-tattoo-dark border-tattoo-primary/30 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Email *
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="bg-tattoo-dark border-tattoo-primary/30 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Phone Number
                    </label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="bg-tattoo-dark border-tattoo-primary/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Preferred Date
                    </label>
                    <Input
                      name="preferredDate"
                      type="date"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="bg-tattoo-dark border-tattoo-primary/30 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Tattoo Type/Style
                  </label>
                  <Input
                    name="tattooType"
                    value={formData.tattooType}
                    onChange={handleInputChange}
                    placeholder="e.g. Traditional, Realism, Geometric..."
                    className="bg-tattoo-dark border-tattoo-primary/30 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Project Description *
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your tattoo idea, size, placement, and any specific details..."
                    className="bg-tattoo-dark border-tattoo-primary/30 text-white min-h-32"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90 py-3 text-lg font-semibold"
                >
                  Submit Booking Request
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Process Info */}
          <div className="space-y-6">
            <Card className="bg-tattoo-gray border-tattoo-primary/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <MessageSquare className="mr-3 text-tattoo-primary" />
                  Our Process
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-tattoo-primary text-tattoo-dark rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Submit Request</h4>
                      <p className="text-gray-400 text-sm">Fill out the booking form with your tattoo details</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-tattoo-primary text-tattoo-dark rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Artist Match</h4>
                      <p className="text-gray-400 text-sm">We'll match you with the perfect artist for your style</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-tattoo-primary text-tattoo-dark rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Consultation</h4>
                      <p className="text-gray-400 text-sm">Discuss your vision and finalize the design</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-tattoo-primary text-tattoo-dark rounded-full flex items-center justify-center font-bold mr-3 mt-1">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Schedule & Create</h4>
                      <p className="text-gray-400 text-sm">Book your session and bring your tattoo to life</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-tattoo-gray border-tattoo-primary/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <User className="mr-3 text-tattoo-primary" />
                  Why Choose Us?
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-tattoo-primary rounded-full mr-3"></span>
                    Expert artists with years of experience
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-tattoo-primary rounded-full mr-3"></span>
                    State-of-the-art equipment and hygiene standards
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-tattoo-primary rounded-full mr-3"></span>
                    Personalized design consultation
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-tattoo-primary rounded-full mr-3"></span>
                    Comprehensive aftercare support
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-tattoo-primary rounded-full mr-3"></span>
                    Digital portfolio and progress tracking
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
