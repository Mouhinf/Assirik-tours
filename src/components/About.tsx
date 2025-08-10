import React from 'react';
import { MapPin, Users, Award, Heart } from 'lucide-react';

const About: React.FC = () => {
  const team = [
    {
      name: "Amadou Diallo",
      role: "Directeur Général",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      description: "Expert en voyages avec plus de 15 ans d'expérience dans l'industrie touristique sénégalaise."
    },
    {
      name: "Fatou Sow",
      role: "Responsable Billetterie",
      image: "https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      description: "Spécialiste des tarifs aériens et des négociations avec les compagnies internationales."
    },
    {
      name: "Moussa Ba",
      role: "Conseiller Visa",
      image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      description: "Expert en procédures consulaires avec un taux de réussite de 95% pour les demandes de visa."
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Passion du Service",
      description: "Nous mettons notre cœur dans chaque projet de voyage pour garantir votre satisfaction totale."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Nous visons l'excellence dans tous nos services avec des standards de qualité élevés."
    },
    {
      icon: Users,
      title: "Proximité Client",
      description: "Une relation de confiance basée sur l'écoute, la transparence et l'accompagnement personnalisé."
    },
    {
      icon: MapPin,
      title: "Expertise Locale",
      description: "Notre ancrage local nous permet de vous offrir les meilleurs conseils et tarifs du marché."
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            À Propos d'Assirik Tours
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une agence de voyage sénégalaise de référence, ancrée à Dakar et dédiée à l'excellence du service depuis plus de 10 ans.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Notre Histoire</h3>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                Fondée en 2014 au cœur de Dakar, Assirik Tours est née de la passion du voyage et 
                du désir d'offrir aux Sénégalais et aux résidents un service d'excellence dans l'organisation 
                de leurs déplacements internationaux.
              </p>
              <p>
                Située dans le quartier dynamique de Fass Delorme, notre agence s'est rapidement imposée 
                comme un partenaire de confiance grâce à notre expertise locale, notre réseau international 
                et notre approche personnalisée du conseil en voyage.
              </p>
              <p>
                Aujourd'hui, nous sommes fiers d'avoir accompagné plus de 500 clients dans la réalisation 
                de leurs projets de voyage, qu'il s'agisse de voyages d'affaires, de pèlerinages, 
                d'études ou de vacances en famille.
              </p>
            </div>
          </div>
          <div>
            <img
              src="https://images.pexels.com/photos/3278215/pexels-photo-3278215.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&dpr=1"
              alt="Bureau Assirik Tours Dakar"
              className="rounded-2xl shadow-lg w-full h-96 object-cover"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Nos Valeurs</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-10 w-10 text-orange-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h4>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">Notre Équipe</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover"
                />
                <h4 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h4>
                <p className="text-orange-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 lg:p-12 mt-20 text-center text-white">
          <h3 className="text-3xl lg:text-4xl font-bold mb-6">Notre Mission</h3>
          <p className="text-xl leading-relaxed max-w-4xl mx-auto text-orange-100">
            Faire d'Assirik Tours le partenaire de référence pour tous vos projets de voyage, 
            en vous offrant un service d'excellence, des conseils d'experts et un accompagnement 
            personnalisé qui transforme chaque voyage en une expérience inoubliable.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;