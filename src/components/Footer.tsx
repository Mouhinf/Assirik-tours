import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, MessageCircle } from 'lucide-react';

interface FooterProps {
  onPageChange: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onPageChange }) => {
  const quickLinks = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'services', label: 'Services' },
    { id: 'destinations', label: 'Destinations' },
    { id: 'apropos', label: 'À propos' },
    { id: 'contact', label: 'Contact' },
  ];

  const services = [
    'Billets d\'avion',
    'Assistance visa',
    'Services immobiliers',
    'Accompagnement personnalisé',
    'Solutions complètes',
  ];

  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Assirik<span className="text-gold-500"> Tours</span>
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Votre partenaire de confiance pour vos projets de voyage et immobiliers. 
                Fiabilité, excellence et proximité à votre service.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gold-500 mr-3" />
                <span className="text-sm text-gray-300">Rue 22 prolongée, Fass Delorme, Dakar</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gold-500 mr-3" />
                <span className="text-sm text-gray-300">+221 77 549 53 14</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gold-500 mr-3" />
                <span className="text-sm text-gray-300">assikirtours@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gold-500">Liens Rapides</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onPageChange(link.id)}
                    className="text-gray-300 hover:text-gold-500 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gold-500">Nos Services</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <span className="text-gray-300 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media & Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gold-500">Suivez-nous</h4>
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                className="bg-gold-500 p-3 rounded-full hover:bg-gold-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a
                href="#"
                className="bg-gold-500 p-3 rounded-full hover:bg-gold-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a
                href="https://wa.me/221775495314"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gold-500 p-3 rounded-full hover:bg-gold-600 transition-colors duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5 text-white" />
              </a>
            </div>
            
            <div className="text-sm text-gray-300">
              <p className="mb-2">Horaires d'ouverture :</p>
              <p>Lun - Ven: 9h00 - 18h00</p>
              <p>Sam - Dim: Fermé</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2024 Assirik Tours. Tous droits réservés.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-gold-500 transition-colors duration-200">
                Mentions légales
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-500 transition-colors duration-200">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-400 hover:text-gold-500 transition-colors duration-200">
                Conditions d'utilisation
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;