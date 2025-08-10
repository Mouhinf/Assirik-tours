import React from 'react';
import { CheckCircle, Users, Clock, Shield } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const reasons = [
    {
      icon: CheckCircle,
      title: 'Fiabilité',
      description: 'Une équipe expérimentée qui privilégie la transparence et le professionnalisme dans tous nos services.',
    },
    {
      icon: Shield,
      title: 'Excellence',
      description: 'Services de première qualité avec un réseau solide de partenaires locaux et internationaux.',
    },
    {
      icon: Clock,
      title: 'Proximité',
      description: 'Approche orientée client avec un accompagnement personnalisé pour chaque projet.',
    },
    {
      icon: Users,
      title: 'Accompagnement',
      description: 'Expertise complète du voyage à l\'immobilier avec des solutions adaptées à vos besoins.',
    },
  ];

  return (
    <section className="py-20 bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Pourquoi nous choisir ?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Plus qu'une simple agence de voyage, nous sommes vos partenaires de confiance 
            pour créer des expériences inoubliables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => {
            const IconComponent = reason.icon;
            return (
              <div
                key={index}
                className="text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-20 h-20 bg-gold-500 rounded-full mx-auto mb-6 group-hover:bg-gold-400 transition-colors duration-300">
                  <IconComponent className="h-10 w-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gold-500">
                  {reason.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gold-500 mb-4">Notre Engagement</h3>
            <p className="text-lg text-gray-200 leading-relaxed">
              "Voyager avec sérénité, partout dans le monde" n'est pas qu'un slogan, 
              c'est notre promesse. Chaque client est unique et mérite une attention particulière 
              pour réaliser ses rêves de voyage dans les meilleures conditions.
            </p>
            <div className="mt-6">
              <button className="bg-gold-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-gold-600 transition-colors duration-200">
                Découvrir nos témoignages
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;