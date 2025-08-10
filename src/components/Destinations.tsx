import React from 'react';
import { MapPin, Star, Calendar } from 'lucide-react';

interface DestinationsProps {
  expanded?: boolean;
}

const Destinations: React.FC<DestinationsProps> = ({ expanded = false }) => {
  const destinations = [
    {
      name: 'Paris, France',
      image: 'https://images.pexels.com/photos/1308940/pexels-photo-1308940.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      price: '485 000 FCFA',
      duration: '5 jours / 4 nuits',
      rating: 4.8,
      description: 'Découvrez la Ville Lumière, ses monuments emblématiques et sa culture raffinée.',
      highlights: ['Tour Eiffel', 'Louvre', 'Champs-Élysées', 'Montmartre'],
    },
    {
      name: 'Dubaï, Émirats',
      image: 'https://images.pexels.com/photos/618079/pexels-photo-618079.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      price: '520 000 FCFA',
      duration: '4 jours / 3 nuits',
      rating: 4.9,
      description: 'Luxe moderne et traditions dans la perle du Golfe Persique.',
      highlights: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Desert Safari'],
    },
    {
      name: 'Marrakech, Maroc',
      image: 'https://images.pexels.com/photos/3889774/pexels-photo-3889774.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      price: '185 000 FCFA',
      duration: '3 jours / 2 nuits',
      rating: 4.7,
      description: 'Plongez dans l\'authenticité marocaine entre souks colorés et palais.',
      highlights: ['Place Jemaa el-Fna', 'Majorelle', 'Médina', 'Désert Agafay'],
    },
    {
      name: 'Istanbul, Turquie',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      price: '380 000 FCFA',
      duration: '6 jours / 5 nuits',
      rating: 4.6,
      description: 'Entre Europe et Asie, une ville riche en histoire et traditions.',
      highlights: ['Sainte-Sophie', 'Grand Bazar', 'Bosphore', 'Palais Topkapi'],
    },
    {
      name: 'Le Caire, Égypte',
      image: 'https://images.pexels.com/photos/3290068/pexels-photo-3290068.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      price: '420 000 FCFA',
      duration: '5 jours / 4 nuits',
      rating: 4.5,
      description: 'Explorez les mystères de l\'Égypte ancienne et ses pyramides légendaires.',
      highlights: ['Pyramides de Gizah', 'Sphinx', 'Musée Égyptien', 'Nil'],
    },
    {
      name: 'New York, USA',
      image: 'https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      price: '750 000 FCFA',
      duration: '7 jours / 6 nuits',
      rating: 4.8,
      description: 'La Big Apple vous attend avec ses gratte-ciels et son énergie unique.',
      highlights: ['Times Square', 'Statue de la Liberté', 'Central Park', 'Brooklyn'],
    },
  ];

  const displayedDestinations = expanded ? destinations : destinations.slice(0, 6);

  return (
    <section id="destinations" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6">
            Destinations Populaires
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos destinations les plus prisées avec des packages complets 
            et des prix négociés pour vous offrir le meilleur de chaque voyage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedDestinations.map((destination, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1 flex items-center space-x-1">
                  <Star className="h-4 w-4 text-gold-500 fill-current" />
                  <span className="text-sm font-medium text-navy-900">{destination.rating}</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <MapPin className="h-5 w-5 text-gold-500 mr-2" />
                  <h3 className="text-xl font-bold text-navy-900">{destination.name}</h3>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {destination.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{destination.duration}</span>
                </div>

                {expanded && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-navy-900 mb-2">Points forts :</h4>
                    <div className="flex flex-wrap gap-1">
                      {destination.highlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="bg-gold-100 text-gold-800 text-xs px-2 py-1 rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-navy-900">{destination.price}</span>
                    <span className="text-sm text-gray-500 block">par personne</span>
                  </div>
                  <button className="bg-gold-500 text-white px-6 py-2 rounded-full font-medium hover:bg-gold-600 transition-colors duration-200">
                    Réserver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!expanded && (
          <div className="text-center mt-12">
            <button className="bg-navy-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-navy-800 transition-colors duration-200">
              Voir toutes les destinations
            </button>
          </div>
        )}

        <div className="mt-16 bg-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-navy-900 mb-4">
            Votre destination n'est pas listée ?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Nous organisons des voyages vers plus de 150 destinations dans le monde. 
            Contactez-nous pour un devis personnalisé selon vos envies.
          </p>
          <button className="bg-gold-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-gold-600 transition-colors duration-200">
            Demander un devis personnalisé
          </button>
        </div>
      </div>
    </section>
  );
};

export default Destinations;