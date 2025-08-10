import React, { useState } from 'react';
import { Menu, X, Phone, Mail } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'apropos', label: 'À propos' },
    { id: 'services', label: 'Services' },
    { id: 'destinations', label: 'Destinations' },
    { id: 'contact', label: 'Contact' },
  ];

  const handlePageChange = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top bar with contact info */}
      <div className="bg-navy-900 text-white py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+221 77 549 53 14</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>assikirtours@gmail.com</span>
              </div>
            </div>
            <div className="text-gold-500">
              Rue 22 prolongée, Fass Delorme, Dakar, Sénégal
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => handlePageChange('accueil')}
          >
            <div className="text-2xl font-bold text-navy-900">
              Assirik<span className="text-gold-500"> Tours</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'text-gold-500 border-b-2 border-gold-500'
                    : 'text-navy-900 hover:text-gold-500'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* WhatsApp Button */}
          <div className="hidden md:block">
            <a
              href="https://wa.me/221775495314"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gold-500 text-white px-6 py-2 rounded-full font-medium hover:bg-gold-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              WhatsApp
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-navy-900 hover:text-gold-500 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageChange(item.id)}
                className={`block px-3 py-2 text-base font-medium w-full text-left transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'text-gold-500 bg-gold-50'
                    : 'text-navy-900 hover:text-gold-500 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2">
              <a
                href="https://wa.me/221775495314"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gold-500 text-white px-3 py-2 rounded-lg font-medium text-center hover:bg-gold-600 transition-all duration-200"
              >
                Contacter via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;