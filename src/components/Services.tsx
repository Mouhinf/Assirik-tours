import React from 'react';
import { Plane, FileText, Calendar, HeartHandshake, Globe, Shield } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      icon: Plane,
      title: 'Billetterie Aérienne',
      description: 'Vente de billets d\'avion avec nos compagnies partenaires vers toutes les destinations mondiales.',
      features: [
        'Tarifs compétitifs négociés',
        'Réservation en temps réel',
        'Assistance 24h/24',
        'Modifications et annulations'
      ],
      color: 'bg-blue-500'
    },
    {
      icon: FileText,
      title: 'Assistance Visa',
      description: 'Accompagnement complet pour l\'obtention de vos visas avec un taux de réussite élevé.',
      features: [
        'Dossier de candidature complet',
        'Vérification des documents',
        'Suivi des demandes',
        'Conseils personnalisés'
      ],
      color: 'bg-green-500'
    },
    {
      icon: Calendar,
      title: 'Organisation de Voyages',
      description: 'Planification complète de vos séjours, voyages d\'affaires et vacances sur mesure.',
      features: [
        'Itinéraires personnalisés',
        'Réservation d\'hébergement',
        'Transport local',
        'Activités et excursions'
      ],
      color: 'bg-purple-500'
    },
    {
      icon: HeartHandshake,
      title: 'Conseils Personnalisés',
      description: 'Expertise et conseils adaptés à vos besoins spécifiques de voyage.',
      features: [
        'Consultation gratuite',
        'Recommandations d\'experts',
        'Budget optimisé',
        'Suivi post-voyage'
      ],
      color: 'bg-orange-500'
    },
    {
      icon: Globe,
      title: 'Destinations Mondiales',
      description: 'Accès à plus de 200 destinations dans le monde entier.',
      features: [
        'Europe, Amérique, Asie',
        'Afrique et Moyen-Orient',
        'Océanie',
        'Destinations exotiques'
      ],
      color: 'bg-teal-500'
    },
    {
      icon: Shield,
      title: 'Assurance Voyage',
      description: 'Protection complète pour voyager en toute sérénité.',
      features: [
        'Couverture médicale',
        'Annulation voyage',
        'Perte de bagages',
        'Assistance rapatriement'
      ],
      color: 'bg-red-500'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Nos Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une gamme complète de services pour répondre à tous vos besoins de voyage, 
            avec l'expertise et la fiabilité que vous attendez d'une agence locale de référence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`${service.color} rounded-full w-16 h-16 flex items-center justify-center mb-6`}>
                <service.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 lg:p-12 mt-16 text-center text-white">
          <h3 className="text-3xl lg:text-4xl font-bold mb-4">
            Prêt à planifier votre prochain voyage ?
          </h3>
          <p className="text-xl mb-8 text-orange-100">
            Contactez-nous dès aujourd'hui pour une consultation gratuite et personnalisée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+221775495314"
              className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-orange-50 transition-colors duration-200"
            >
              Appeler maintenant
            </a>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-orange-600 transition-colors duration-200">
              Demander un devis
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;