
import React from 'react';
import { MessageSquare, Calendar, User, Settings } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-tattoo-dark py-12 border-t border-tattoo-gray">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold gradient-text">UpRising.Ink</h3>
            <p className="text-gray-400">
              Uprising Ink Tattoo Studio L.L.C.
            </p>
            <p className="text-gray-400 text-sm">
              Professional tattoo artistry with cutting-edge digital experience.
            </p>
            <p className="text-xs text-gray-500">
              Powered by Multraverse.ai
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#gallery" className="text-gray-400 hover:text-tattoo-primary transition-colors">Gallery</a></li>
              <li><a href="#artists" className="text-gray-400 hover:text-tattoo-primary transition-colors">Our Artists</a></li>
              <li><a href="#booking" className="text-gray-400 hover:text-tattoo-primary transition-colors">Book Session</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-tattoo-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Portals</h4>
            <ul className="space-y-2">
              <li>
                <a href="#client-portal" className="text-gray-400 hover:text-tattoo-primary transition-colors flex items-center">
                  <User className="mr-2" size={16} />
                  Client Portal
                </a>
              </li>
              <li>
                <a href="#artist-portal" className="text-gray-400 hover:text-tattoo-primary transition-colors flex items-center">
                  <Calendar className="mr-2" size={16} />
                  Artist Portal
                </a>
              </li>
              <li>
                <a href="#admin-portal" className="text-gray-400 hover:text-tattoo-primary transition-colors flex items-center">
                  <Settings className="mr-2" size={16} />
                  Admin Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Info</h4>
            <div className="space-y-2 text-gray-400">
              <p>1631 Sunset Rd c103</p>
              <p>Las Vegas, NV 89119</p>
              <p>Phone: (725) 204-6609</p>
              <p>Email: info@uprising.ink</p>
            </div>
            <div className="flex items-center space-x-4 pt-4">
              <a href="#" className="text-gray-400 hover:text-tattoo-primary transition-colors">
                <MessageSquare size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-tattoo-primary transition-colors">
                <Calendar size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-tattoo-gray mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Uprising Ink Tattoo Studio L.L.C. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2 md:mt-0">
            Digital platform by Multraverse.ai
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
