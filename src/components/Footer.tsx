
import React from 'react';

interface FooterProps {
  currentTheme: string;
}

export const Footer: React.FC<FooterProps> = ({ currentTheme }) => {
  return (
    <footer className="bg-white/95 backdrop-blur-xl border-t border-gray-200/80 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">TimeStitch</h3>
            <p className="text-gray-600 text-sm">
              Capture and preserve your precious moments forever with rich stories and beautiful imagery.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Projects</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Memories</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Gallery</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Sharing</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-gray-900 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-gray-900 transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 TimeStitch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
