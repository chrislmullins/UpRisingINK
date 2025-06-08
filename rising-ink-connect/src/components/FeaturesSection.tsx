
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MessageSquare, User, Settings } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Calendar className="w-12 h-12 text-tattoo-primary" />,
      title: 'Smart Booking System',
      description: 'Seamless appointment scheduling with real-time availability and automated reminders.',
      details: ['Online booking forms', 'Calendar integration', 'SMS/Email reminders', 'Waitlist management']
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-tattoo-primary" />,
      title: 'Direct Messaging',
      description: 'Secure communication between artists and clients for design discussions and updates.',
      details: ['Real-time chat', 'Image sharing', 'Design feedback', 'Session planning']
    },
    {
      icon: <User className="w-12 h-12 text-tattoo-primary" />,
      title: 'Client Portal',
      description: 'Personalized dashboard for clients to manage appointments and view their tattoo journey.',
      details: ['Appointment history', 'Design galleries', 'Aftercare guides', 'Progress tracking']
    },
    {
      icon: <Settings className="w-12 h-12 text-tattoo-primary" />,
      title: 'Artist Management',
      description: 'Comprehensive tools for artists to manage their portfolio, schedule, and client relationships.',
      details: ['Portfolio management', 'Schedule control', 'Client database', 'Revenue tracking']
    }
  ];

  return (
    <section id="features" className="py-20 bg-tattoo-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Complete <span className="gradient-text">Digital Experience</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our platform revolutionizes how tattoo studios operate, connecting artists and clients through cutting-edge technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-tattoo-gray border-tattoo-primary/20 hover:border-tattoo-primary/50 transition-all duration-300 group">
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 mb-4">{feature.description}</p>
                <ul className="text-sm text-gray-400 space-y-1">
                  {feature.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center justify-center">
                      <span className="w-2 h-2 bg-tattoo-primary rounded-full mr-2"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
