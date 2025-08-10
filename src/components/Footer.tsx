import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  setActiveSection: (section: string) => void;
}

const Footer: React.FC<FooterProps> = ({ setActiveSection }) => {
  const quickLinks = [
    { label: 'Accueil', id: 'accueil' },
    { label: 'Nos Services', id: 'services' },
    { label: 'À Propos', id: 'apropos' },
    { label: 'Témoignages', id: 'temoignages' },
    { label: 'Contact', id: 'contact' }
  ];

  const services = [
    'Billetterie Aérienne',
    'Assistance Visa',
    'Organisation Voyages',
    'Conseils Personnalisés',
    'Assurance Voyage'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-6">
              <MapPin className="h-8 w-8 text-orange-400 mr-2" />
              <span className="text-2xl font-bold">Assirik Tours</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Votre partenaire de confiance pour tous vos voyages depuis Dakar. 
              Expertise locale, service international.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-orange-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-orange-600 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-orange-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Liens Rapides</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => setActiveSection(link.id)}
                    className="text-gray-300 hover:text-orange-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6">Nos Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index} className="text-gray-300">
                  {service}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-orange-400 mr-3 mt-1 flex-shrink-0" />
                <div className="text-gray-300">
                  <p>Rue 22 prolongée</p>
                  <p>Fass Delorme, Dakar</p>
                  <p>Sénégal</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-orange-400 mr-3" />
                <a href="tel:+221775495314" className="text-gray-300 hover:text-orange-400 transition-colors">
                  +221 77 549 53 14
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-orange-400 mr-3" />
                <a href="mailto:contact@assirik-tours.sn" className="text-gray-300 hover:text-orange-400 transition-colors">
                  contact@assirik-tours.sn
                </a>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2 text-orange-400">Horaires</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p>Lun - Ven: 8h00 - 18h00</p>
                <p>Samedi: 8h00 - 14h00</p>
                <p>Dimanche: Fermé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Assirik Tours. Tous droits réservés.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-orange-400 transition-colors">
                Mentions légales
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="hover:text-orange-400 transition-colors">
                Conditions générales
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;