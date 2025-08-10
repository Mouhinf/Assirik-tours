import React from 'react';
import { Plane, Package, Shield, FileText, MapPin, Users } from 'lucide-react';

interface ServicesProps {
  expanded?: boolean;
}

const Services: React.FC<ServicesProps> = ({ expanded = false }) => {
  const services = [
    {
      icon: Plane,
      title: 'Billets d\'Avion',
      description: 'Solutions économiques et flexibles pour tous types de voyages : affaires, loisirs, urgences.',
      details: 'Réseau solide de partenaires aériens. Tarifs adaptés à vos besoins, modification et annulation flexibles. Service personnalisé.',
      price: 'À partir de 250 000 FCFA',
    },
    {
      icon: FileText,
      title: 'Assistance Visas',
      description: 'Accompagnement dans les démarches complexes liées aux visas avec expertise consulaire.',
      details: 'Service personnalisé, connaissance approfondie des procédures consulaires, suivi complet de votre dossier.',
      price: 'À partir de 25 000 FCFA',
    },
    {
      icon: MapPin,
      title: 'Services Immobiliers',
      description: 'Expertise complète en gestion, achat, vente et promotion immobilière.',
      details: 'Intervention sur tout le cycle immobilier. Valorisation, gestion et vente de biens. Projets novateurs et durables.',
      price: 'Devis personnalisé',
    },
    {
      icon: Users,
      title: 'Accompagnement Personnalisé',
      description: 'Service client privilégiant une approche orientée client avec excellence.',
      details: 'Équipe expérimentée, réseau de partenaires locaux et internationaux, transparence et professionnalisme.',
      price: 'Devis personnalisé',
    },
    {
      icon: Shield,
      title: 'Fiabilité & Excellence',
      description: 'Services de première qualité avec proximité et accompagnement personnalisé.',
      details: 'Engagement qualité, transparence totale, professionnalisme reconnu, satisfaction client garantie.',
      price: 'Inclus dans nos services',
    },
    {
      icon: Package,
      title: 'Solutions Complètes',
      description: 'Une gamme étendue de services pour répondre à tous vos besoins.',
      details: 'Du voyage d\'affaires aux projets immobiliers, nous vous accompagnons dans tous vos projets avec expertise.',
      price: 'Tarifs compétitifs',
    },
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Nos Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une gamme complète de services pour répondre à tous vos besoins de voyage, 
            avec l'expertise et la qualité que vous méritez.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group hover:-translate-y-2"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gold-100 rounded-full mb-6 group-hover:bg-gold-500 transition-colors duration-300">
                  <IconComponent className="h-8 w-8 text-gold-500 group-hover:text-white transition-colors duration-300" />
                </div>
                
                <h3 className="text-2xl font-bold text-navy-900 mb-4">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                {expanded && (
                  <>
                    <p className="text-gray-700 mb-4 text-sm leading-relaxed border-t pt-4">
                      {service.details}
                    </p>
                    <div className="text-gold-600 font-semibold text-lg">
                      {service.price}
                    </div>
                  </>
                )}

                <div className="mt-6">
                  <button className="text-gold-500 hover:text-gold-600 font-semibold transition-colors duration-200 flex items-center">
                    En savoir plus
                    <svg className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="bg-navy-900 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Besoin d'un service personnalisé ?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Contactez-nous pour discuter de vos besoins spécifiques. Notre équipe d'experts est là pour créer l'expérience de voyage parfaite pour vous.
            </p>
            <button className="bg-gold-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-gold-600 transition-colors duration-200">
              Nous contacter
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;