import React from 'react';
import { ArrowRight, Star, Users, Award } from 'lucide-react';

interface HeroProps {
  setActiveSection: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ setActiveSection }) => {
  return (
    <section className="relative bg-gradient-to-br from-orange-600 to-red-600 text-white">
      {/* Hero Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          alt="Voyage à Dakar"
          className="w-full h-full object-cover opacity-20"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Votre partenaire de confiance pour tous vos voyages
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-orange-100">
              Depuis Dakar, nous vous accompagnons dans la réalisation de tous vos projets de voyage avec expertise et professionnalisme.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => setActiveSection('services')}
                className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold flex items-center justify-center hover:bg-orange-50 transition-colors duration-200"
              >
                Découvrir nos services
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveSection('contact')}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors duration-200"
              >
                Nous contacter
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-orange-400">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-yellow-300" />
                </div>
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-orange-200 text-sm">Clients satisfaits</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-8 w-8 text-yellow-300" />
                </div>
                <div className="text-3xl font-bold mb-1">4.8/5</div>
                <div className="text-orange-200 text-sm">Note moyenne</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-yellow-300" />
                </div>
                <div className="text-3xl font-bold mb-1">10+</div>
                <div className="text-orange-200 text-sm">Années d'expérience</div>
              </div>
            </div>
          </div>

          <div className="lg:pl-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Pourquoi choisir Assirik Tours ?</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-yellow-400 rounded-full p-2 mr-4 mt-1">
                    <Star className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Expertise locale</h4>
                    <p className="text-orange-100">Connaissance approfondie du marché sénégalais</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-400 rounded-full p-2 mr-4 mt-1">
                    <Star className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Service personnalisé</h4>
                    <p className="text-orange-100">Accompagnement sur mesure pour chaque voyage</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-yellow-400 rounded-full p-2 mr-4 mt-1">
                    <Star className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Partenaires de confiance</h4>
                    <p className="text-orange-100">Collaboration avec les meilleures compagnies</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;