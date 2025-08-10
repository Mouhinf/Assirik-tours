import React from 'react';
import { Award, Users, Globe, Clock } from 'lucide-react';

interface AboutProps {
  expanded?: boolean;
}

const About: React.FC<AboutProps> = ({ expanded = false }) => {
  const stats = [
    { icon: Users, label: 'Clients satisfaits', value: '2500+' },
    { icon: Globe, label: 'Destinations', value: '150+' },
    { icon: Award, label: 'Années d\'expérience', value: '8' },
    { icon: Clock, label: 'Support 24h/7j', value: '100%' },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
              À propos de
              <span className="text-gold-500"> Assirik Tours</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              Assirik Tours est votre partenaire de confiance à Dakar, spécialisé dans les services de voyage 
              et l'immobilier avec un engagement fort envers l'excellence et la proximité client.
            </p>

            {expanded ? (
              <>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Située à Rue 22 prolongée, Fass Delorme à Dakar, notre agence s'est spécialisée dans trois 
                  domaines d'expertise : la vente de billets d'avion, l'assistance visa et les services immobiliers. 
                  Cette diversification nous permet d'offrir des solutions complètes à nos clients.
                </p>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Notre équipe expérimentée privilégie une approche orientée client avec un réseau solide de 
                  partenaires locaux et internationaux. Nous maîtrisons les procédures consulaires complexes 
                  et disposons d'une expertise reconnue dans la gestion immobilière.
                </p>

                <div className="bg-gold-50 rounded-lg p-6 mb-8">
                  <h3 className="text-xl font-semibold text-navy-900 mb-3">Notre Mission</h3>
                  <p className="text-gray-700">
                    Fournir des services de première qualité avec transparence et professionnalisme. 
                    Nous nous engageons à offrir fiabilité, excellence et proximité dans tous nos domaines 
                    d'intervention, du voyage à l'immobilier.
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Notre équipe d'experts vous accompagne dans vos projets de voyage et immobiliers 
                  avec une approche personnalisée, la fiabilité et l'excellence comme maîtres-mots.
                </p>
              </>
            )}

            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gold-500 rounded-full mr-4"></div>
                <span className="text-gray-700 font-medium">Réseau de partenaires solide</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gold-500 rounded-full mr-4"></div>
                <span className="text-gray-700 font-medium">Transparence et professionnalisme</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gold-500 rounded-full mr-4"></div>
                <span className="text-gray-700 font-medium">Accompagnement personnalisé</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                alt="Équipe Assirik Tours"
                className="w-full h-[500px] object-cover"
              />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-navy-900 rounded-full opacity-10"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="flex items-center justify-center w-16 h-16 bg-gold-100 rounded-full mx-auto mb-4 group-hover:bg-gold-500 transition-colors duration-300">
                    <IconComponent className="h-8 w-8 text-gold-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-3xl font-bold text-navy-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;