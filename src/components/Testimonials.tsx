import React from 'react';
import { Star, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Aisha Diop",
      role: "Enseignante",
      image: "https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      rating: 5,
      text: "Excellent service ! L'équipe d'Assirik Tours m'a accompagnée dans l'obtention de mon visa Schengen. Leur professionnalisme et leur suivi personnalisé ont fait toute la différence. Je recommande vivement !",
      destination: "Paris, France"
    },
    {
      name: "Mamadou Konate",
      role: "Chef d'entreprise",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      rating: 5,
      text: "Pour nos voyages d'affaires, Assirik Tours est notre partenaire de confiance. Ils trouvent toujours les meilleurs tarifs et s'occupent de tous les détails logistiques. Un service impeccable !",
      destination: "Dubai, EAU"
    },
    {
      name: "Fatima Sall",
      role: "Médecin",
      image: "https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      rating: 5,
      text: "Organisation parfaite de notre voyage de famille au Canada. De la réservation des billets à l'obtention des visas, tout s'est déroulé sans encombre. Merci à toute l'équipe !",
      destination: "Montréal, Canada"
    },
    {
      name: "Ibrahima Ba",
      role: "Étudiant",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      rating: 5,
      text: "Grâce à Assirik Tours, j'ai pu obtenir mon visa étudiant pour les États-Unis. Leur expertise des procédures consulaires et leur accompagnement m'ont énormément aidé. Je suis très reconnaissant !",
      destination: "New York, USA"
    },
    {
      name: "Aminata Diallo",
      role: "Architecte",
      image: "https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      rating: 5,
      text: "Service client exceptionnel ! Ils ont su s'adapter à mes contraintes de dernière minute et ont trouvé une solution pour mon voyage urgent à Londres. Professionnalisme et réactivité au rendez-vous.",
      destination: "Londres, UK"
    },
    {
      name: "Omar Ndiaye",
      role: "Ingénieur",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      rating: 5,
      text: "Pour notre voyage de noces en Thaïlande, Assirik Tours nous a concocté un itinéraire sur mesure absolument parfait. Chaque détail était pensé. Nous garderons un souvenir inoubliable !",
      destination: "Bangkok, Thaïlande"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Témoignages Clients
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez ce que nos clients disent de leur expérience avec Assirik Tours. 
            Leur satisfaction est notre plus belle récompense.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
            <div className="text-gray-600">Clients satisfaits</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">4.8/5</div>
            <div className="text-gray-600">Note moyenne</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
            <div className="text-gray-600">Taux de réussite visa</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">100+</div>
            <div className="text-gray-600">Destinations</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg relative">
              <div className="absolute -top-4 left-8">
                <div className="bg-orange-600 rounded-full p-2">
                  <Quote className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="flex items-center mb-6 pt-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  <div className="flex items-center mt-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">
                "{testimonial.text}"
              </p>

              <div className="text-sm text-orange-600 font-medium">
                Destination: {testimonial.destination}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Rejoignez nos clients satisfaits
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Faites confiance à notre expertise pour réaliser votre prochain voyage. 
              Contactez-nous dès aujourd'hui pour une consultation gratuite.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+221775495314"
                className="bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors duration-200"
              >
                Nous appeler
              </a>
              <button className="border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg font-semibold hover:bg-orange-600 hover:text-white transition-colors duration-200">
                Demander un devis
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;