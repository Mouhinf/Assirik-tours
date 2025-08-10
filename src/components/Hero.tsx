import React from 'react';
import { Plane, MapPin, Shield } from 'lucide-react';

interface HeroProps {
  onReservation: () => void;
  onQuote: () => void;
}

const Hero: React.FC<HeroProps> = ({ onReservation, onQuote }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-navy-900 bg-opacity-60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Votre partenaire
            <span className="text-gold-500 block">de confiance</span>
            pour tous vos projets
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Découvrez le monde avec Assirik Tours, votre agence spécialisée en billets d'avion, assistance visa et services immobiliers à Dakar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onReservation}
              className="bg-gold-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gold-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Réserver maintenant
            </button>
            <button
              onClick={onQuote}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-navy-900 transition-all duration-200"
            >
              Demander un devis
            </button>
          </div>

          {/* Quick Services */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-opacity-20 transition-all duration-200">
              <Plane className="h-12 w-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Billets d'Avion</h3>
              <p className="text-gray-200">Solutions économiques et flexibles</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-opacity-20 transition-all duration-200">
              <Shield className="h-12 w-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Assistance Visa</h3>
              <p className="text-gray-200">Accompagnement personnalisé</p>
            </div>
            
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-white hover:bg-opacity-20 transition-all duration-200">
              <MapPin className="h-12 w-12 text-gold-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Services Immobiliers</h3>
              <p className="text-gray-200">Gestion et promotion immobilière</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;