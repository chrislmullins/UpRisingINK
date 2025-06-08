import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [captcha, setCaptcha] = useState({
    question: '',
    answer: '',
    userAnswer: '',
    correctAnswer: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate simple math captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    let question;
    
    if (operator === '+') {
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
    } else {
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
    }
    
    setCaptcha({
      question,
      answer: answer.toString(),
      userAnswer: '',
      correctAnswer: answer
    });
  };

  React.useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate captcha
    if (parseInt(captcha.userAnswer) !== captcha.correctAnswer) {
      toast({
        title: "Captcha Error",
        description: "Please solve the math problem correctly.",
        variant: "destructive"
      });
      generateCaptcha(); // Generate new captcha
      return;
    }

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Form Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // When submitting the form, call the Firebase Cloud Function endpoint for sending contact emails
      // Example endpoint: https://us-central1-uprisinginkapp.cloudfunctions.net/sendContactEmail
      // This is already implemented in the handleSubmit function:
      // await fetch('https://us-central1-uprisinginkapp.cloudfunctions.net/sendContactEmail', { ... })
      await fetch('https://us-central1-uprisinginkapp.cloudfunctions.net/sendContactEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'Contact Form Submission',
          message: formData.message
        })
      });

      toast({
        title: "Message Sent!",
        description: "Thank you for your message. We'll get back to you soon!",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      generateCaptcha();

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-tattoo-dark">
      <Navigation />
      
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Contact Us
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Ready to get your next tattoo? Have questions about our services? 
              We'd love to hear from you!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="bg-tattoo-secondary border-tattoo-gray">
                <CardHeader>
                  <CardTitle className="text-tattoo-primary">Get in Touch</CardTitle>
                  <CardDescription className="text-white/70">
                    Visit us, call us, or send us a message
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 text-white">
                    <MapPin className="text-tattoo-primary" size={20} />
                    <div>
                      <p className="font-medium">Our Location</p>
                      <p className="text-white/80">1631 Sunset Rd c103</p>
                      <p className="text-white/80">Las Vegas, NV 89119</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-white">
                    <Phone className="text-tattoo-primary" size={20} />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-white/80">(725) 204-6609</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-white">
                    <Mail className="text-tattoo-primary" size={20} />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-white/80">info@uprising.ink</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-tattoo-secondary border-tattoo-gray">
                <CardHeader>
                  <CardTitle className="text-tattoo-primary">Studio Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-white">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="text-white/80">12:00 PM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="text-white/80">12:00 PM - 11:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="text-white/80">12:00 PM - 8:00 PM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="bg-tattoo-secondary border-tattoo-gray">
              <CardHeader>
                <CardTitle className="text-tattoo-primary">Send us a Message</CardTitle>
                <CardDescription className="text-white/70">
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="bg-tattoo-dark border-tattoo-gray text-white"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="bg-tattoo-dark border-tattoo-gray text-white"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="subject" className="text-white">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="bg-tattoo-dark border-tattoo-gray text-white"
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="message" className="text-white">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="bg-tattoo-dark border-tattoo-gray text-white"
                      placeholder="Tell us about your tattoo ideas, questions, or anything else..."
                    />
                  </div>

                  {/* Simple Math Captcha */}
                  <div>
                    <Label htmlFor="captcha" className="text-white">
                      Security Check: What is {captcha.question}? *
                    </Label>
                    <Input
                      id="captcha"
                      type="number"
                      value={captcha.userAnswer}
                      onChange={(e) => setCaptcha({...captcha, userAnswer: e.target.value})}
                      required
                      className="bg-tattoo-dark border-tattoo-gray text-white"
                      placeholder="Enter the answer"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-tattoo-primary text-tattoo-dark hover:bg-tattoo-primary/90"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
